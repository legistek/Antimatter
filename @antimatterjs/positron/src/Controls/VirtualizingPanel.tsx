import * as React from 'react';
import { Binding, Utilities } from '@antimatterjs/react';
import { Point, Span } from '../Foundation';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { FrameworkElement } from '../FrameworkElement';

export interface IVirtualizingPanelProps extends IPanelProps
{
    Scale?: number | Binding,
    OverscanHeight?: number,
}

export interface IVirtualizingPanelState extends IPanelState
{
    Scale?: number
    OverscanHeight?: number,
}

interface IObserverCollection
{
    intesection: IntersectionObserver,
    before: MutationObserver,
    after: MutationObserver
}

class RenderWindowInfo
{
    StartIndex: number = 0;
    StartItemBounds: Span = { Start: 0, End: 0 };
    EndIndex: number = 0;
    EndItemBounds: Span = { Start: 0, End: 0 };
    LastItemBounds: Span = { Start: 0, End: 0 };
}

export abstract class VirtualizingPanel<
    P extends IVirtualizingPanelProps,
    S extends IVirtualizingPanelState>
    extends PanelBase<P, S>
{
    /**
     * Sets the desired scroll position for the VirtualizingPanel. 
     * @param pt A Point with the x and y scroll coordinates. The 
     * actual scroll position does not change immediately but rather
     * is updated once the component re-renders. This can be called
     * at the conclusion of a manipulation gesture, for example, to
     * set the scroll position to match the transform.
     */
    public SetDesiredScroll(pt: Point)
    {
        this._desiredScroll = pt;
        this.InvalidateRender();
    }

    /**
     * Returns a Span (start and end y-coordinate boundaries) for the item
     * by its index. Sub-classes must implement this item according to their 
     * specific needs.
     * @param itemIndex The 0-based index of the item.
     */
    protected abstract GetItemExpanseBounds(itemIndex: number): Span;

    /**
     * Invoked when a new set of children have been realized (i.e. visualized
     * and are no longer virtual). Sub-classes can override this function to
     * do things like cache actual item heights for on-the-fly virtualization.
     * @param startIndex The starting 0-based index that has been realized.
     * @param endIndex The ending 0-based index that has been realized.
     * @param children An array of realized children. These will be DOM 
     * references to the item container for each item.
     */
    protected /* virtual */ OnChildrenRealized(
        startIndex: number,
        endIndex: number,
        children: FrameworkElement[])
    {
        console.log(`${children.length} children realized`);
    }

    /* override */ renderElement(): JSX.Element | null
    {
        if (!this.state.ItemsParent)
            return null;

        var items = this.state.ItemsParent?.state.ItemsSource || [];

        // We need the scaled div to remain the same pixel width
        // for horizontal scrolling to work properly if that's
        // desired.
        const widthPercent = this.state.Scale
            ? (100 / (this.state.Scale as number || 1))
            : 100;

        return (
            <div style={
                {
                    transform: this.state.Scale ? `scale(${this.state.Scale})` : undefined,
                    transformOrigin: "0px 0px",
                    width: `${widthPercent}%`
                }
            }>
                <div
                    ref={r => this._spacerBefore = r}
                    style={{
                        height: this._renderWindowInfo.StartItemBounds.Start,
                    }} />

                {this.RenderVisibleItems(items)}

                <div ref={r => this._spacerAfter = r}
                    style={{
                        height: (this._renderWindowInfo.LastItemBounds.End - this._renderWindowInfo.EndItemBounds.End)
                    }} />
            </div>
        );
    }

    // Recalculates the container dimensions - width is based on the maximum 
    // width of any item previously rendered and height is based on the 
    // spans of the items. This must be done every time the component updates 
    // because we are overriding React's virtual DOM in this narrow instance, 
    // otherwise we'd have to do two renders every time new items get realized.
    /* override */ componentDidUpdate(prevProps)
    {
        if (!this.Container || !this._scroller)
            return;

        // Preserve H scroll during re-calculation if needed
        const hscroll = this._scroller.scrollLeft;
        this.Container.style.height = `${this._renderWindowInfo.LastItemBounds.End * (this.state.Scale as number || 1)}px`;
        this.Container.style.width = "fit-content";
        this._maxWidth = Math.max(this._maxWidth, this.Container?.clientWidth || 0);
        this.Container.style.width = `${this._maxWidth * (this.state.Scale as number || 1)}px`;

        if (this._desiredScroll)
        {
            this._scroller.scrollLeft = this._desiredScroll.X;
            this._scroller.scrollTop = this._desiredScroll.Y;
            this._desiredScroll = undefined;
        }
        else
        {
            this._scroller.scrollLeft = hscroll;
        }

        if (this._realizationGeneration !== this._lastRealizedGeneration)
        {
            this._lastRealizedGeneration = this._realizationGeneration;
            this.OnChildrenRealized(
                this._renderWindowInfo.StartIndex,
                this._renderWindowInfo.EndIndex,
                this._realizedChildren);
        }
    }

    /* override */ componentDidMount()
    {
        if (!this._spacerBefore || !this._spacerAfter || !this.Container)
            return;

        var root = this.FindScroller();
        if (!root)
            return;
        this._scroller = root;

        const intersectionObserver = new IntersectionObserver(
            this.IntersectionCallback.bind(this),
            {
                root: this._scroller,
                rootMargin: `50px`,
            });
        intersectionObserver.observe(this._spacerBefore);
        intersectionObserver.observe(this._spacerAfter);

        const mutationObserverBefore = createSpacerMutationObserver(this._spacerBefore);
        const mutationObserverAfter = createSpacerMutationObserver(this._spacerAfter);

        this._observers = {
            intesection: intersectionObserver,
            before: mutationObserverBefore,
            after: mutationObserverAfter,
        };

        function createSpacerMutationObserver(spacer: HTMLElement): MutationObserver
        {
            // Without the use of thresholds, IntersectionObserver only detects binary changes in visibility,
            // so if a spacer gets resized but remains visible, no additional callbacks will occur. By unobserving
            // and reobserving spacers when they get resized, the intersection callback will re-run if they remain visible.
            const mutationObserver = new MutationObserver((): void =>
            {
                intersectionObserver.unobserve(spacer);
                intersectionObserver.observe(spacer);
            });

            mutationObserver.observe(spacer, { attributes: true });

            return mutationObserver;
        }
    }

    /* override */ componentWillUnmount()
    {
        if (this._observers)
        {
            this._observers.intesection.disconnect();
            this._observers.before.disconnect();
            this._observers.after.disconnect();
            delete this._observers;
        }
        super.componentWillUnmount?.call(this);
    }

    /* override */ OnInvalidateRender()
    {
        this.ComputeRenderWindowInfo(
            (this._scroller?.getBoundingClientRect().y || 0) - (this.Container?.getBoundingClientRect().y || 0),
            this.state.ItemsParent?.Container?.clientHeight || 0);
        super.OnInvalidateRender();
    }

    private ComputeRenderWindowInfo(
        windowTop: number,
        windowHeight: number): void
    {
        let needRender: boolean = false;

        let c = this.ItemCount;

        const scale = (this.state.Scale as number || 1);

        let newInfo: RenderWindowInfo = new RenderWindowInfo();

        const windowBottom = windowTop + windowHeight * (1 + (this.state.OverscanHeight as number || 1));
        windowTop = Math.max(0, windowTop - windowHeight * (this.state.OverscanHeight as number || 1));

        newInfo.StartIndex = Utilities.SortedBinarySearch(
            ((index) =>
            {
                var itemPos = this.GetItemExpanseBounds(index);
                if (itemPos.Start * scale > windowTop)
                    return -1;  // too far; go lower
                else if (itemPos.End * scale < windowBottom)
                    return +1;  // not far enough; go higher
                else
                    return 0;
            }).bind(this),
            c);

        newInfo.StartItemBounds = this.GetItemExpanseBounds(newInfo.StartIndex);
        newInfo.EndIndex = newInfo.StartIndex;

        let itemBounds: Span = { Start: 0, End: 0 };

        while (c > newInfo.EndIndex + 1 &&
            (itemBounds = this.GetItemExpanseBounds(newInfo.EndIndex)).End * scale < windowBottom)
            newInfo.EndIndex++;

        needRender = true;
        newInfo.LastItemBounds = this.GetItemExpanseBounds(c - 1);
        if (newInfo.EndIndex + 1 === c)
        {
            // end index is the last item
            newInfo.EndItemBounds = newInfo.LastItemBounds;
        }
        else
        {
            newInfo.EndItemBounds = itemBounds;
        }
        this._renderWindowInfo = newInfo;

        this._hasComputed = true;
    }

    private get ItemCount(): number
    {
        return this.state.ItemsParent?.state?.ItemsSource?.length || 0;
    }

    private FindScroller(): HTMLElement | null | undefined
    {
        var elem = this.Container;
        while (elem && elem?.style.overflowY !== "auto")
            elem = elem.parentElement;
        return elem;
    }

    private IntersectionCallback(entries: IntersectionObserverEntry[]): void
    {
        if (!this._spacerBefore || !this._spacerAfter || !this.Container)
            return;
        for (const entry of entries)
        {
            if (!entry.isIntersecting)
                continue;

            if (entry.target === this._spacerBefore ||
                (entry.target === this._spacerAfter && this._spacerAfter.offsetHeight > 0))
            {
                this.InvalidateRender();
                break;
            }
        }
    }

    private RenderVisibleItems(items: any[]): JSX.Element[] | null
    {
        if (!this._hasComputed)
            return null;

        if (!items || items.length === 0)
            return null;

        var visibleItems: JSX.Element[] = new Array(
            this._renderWindowInfo.EndIndex - this._renderWindowInfo.StartIndex + 1);

        this._realizedChildren = [];

        for (let i = this._renderWindowInfo.StartIndex,
            j = 0; i <= this._renderWindowInfo.EndIndex;
            i++, j++)
        {
            var item = items[i];
            var renderedItem = this.state.ItemsParent?.OnRenderItem(item,
                {
                    ref: (r) => r ? this._realizedChildren?.push(r) : {}
                }) || (<></>);
            visibleItems[j] = renderedItem;
        }

        this._realizationGeneration++;

        return visibleItems;
    }

    private _spacerBefore: HTMLElement | null = null;
    private _spacerAfter: HTMLElement | null = null;
    private _hasComputed: boolean = false;
    private _observers?: IObserverCollection;
    private _renderWindowInfo: RenderWindowInfo = new RenderWindowInfo();
    private _scroller: HTMLElement | null = null;
    private _maxWidth: number = 0;
    private _desiredScroll?: Point;
    private _realizedChildren: FrameworkElement[] = [];
    private _realizationGeneration: number = 0;
    private _lastRealizedGeneration: number = 0;
}