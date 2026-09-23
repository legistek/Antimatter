import * as React from 'react';
import { Binding, Utilities, Point, Span, SpanOverlap } from '@antimatterjs/react';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { FrameworkElement, IFrameworkElementProps } from '../FrameworkElement';
import { FrameworkFragment, IFrameworkFragmentProps } from '../FrameworkFragment';
import { ICollectionUpdate } from '@antimatterjs/react/src/ICollectionUpdate';

export interface IVirtualizingPanelProps extends IPanelProps
{
    OverscanHeight?: number,
    RealizationDelayMs?: number,
}

interface IObserverCollection
{
    intesection: IntersectionObserver,
    before: MutationObserver,
    after: MutationObserver
}

export class RenderWindowInfo
{
    StartIndex: number = 0;
    StartItemTop: number = 0;
    EndIndex: number = 0;
    ExpanseHeight: number = 0;
    LastItemBottom: number = 0;
}

export interface VirtualizingPanelItemsPresenterProps extends IFrameworkFragmentProps
{
    ParentPanel: VirtualizingPanel<any, any>;
    Data?: any;

    StartIndex: number;
    EndIndex: number;
}

export class VirtualizingPanelItemsPresenter extends FrameworkFragment<VirtualizingPanelItemsPresenterProps>
{
    override render(): JSX.Element
    {
        return <>{this.RenderVisibleItems(this.Data)}</>;
    }

    public get StartIndex(): number
    {
        return this.GetValue(nameof(this.props.StartIndex), 0);
    }

    public get EndIndex(): number
    {
        return this.GetValue(nameof(this.props.EndIndex), 0);
    }

    public get ParentPanel(): VirtualizingPanel<any, any>
    {
        return this.GetValue(nameof(this.props.ParentPanel));
    }

    public get Data(): any
    {
        return this.GetValue(nameof(this.props.Data));
    }

    private RenderVisibleItems(data?: any): JSX.Element[] | null
    {
        var items = this.ParentPanel?.ItemsParent?.ItemsSource || [];
        if (!items || items.length === 0)
            return null;

        var visibleCount = this.EndIndex - this.StartIndex + 1;
        if (visibleCount < 1)
            return null;

        var visibleItems: JSX.Element[] = new Array(visibleCount);
        for (let i = this.StartIndex,
            j = 0; i <= this.EndIndex;
            i++, j++)
        {
            var item = items[i];
            var props = this.ParentPanel.GetItemContainerProps(item, i, data) || {};
            var renderedItem = this.ParentPanel?.ItemsParent?.OnRenderItem(item, i, props) || (<></>);
            visibleItems[j] = renderedItem;
        }

        this.ParentPanel?.ItemsParent?.OnItemsRendered({
            Start: this.StartIndex,
            End: this.EndIndex
        });

        return visibleItems;
    }
}

export abstract class VirtualizingPanel<
    P extends IVirtualizingPanelProps,
    S extends IPanelState>
    extends PanelBase<P, S>
{
    public get OverscanHeight(): number
    {
        return this.GetValue(nameof(this.props.OverscanHeight), 1);
    }

    public get RealizationDelayMs(): number
    {
        return this.GetValue(nameof(this.props.RealizationDelayMs), 0);
    }

    public override async ScrollTo(item: number | any): Promise<boolean>
    {
        if (!this.ItemsParent?.ItemsSource || !this._scroller)
            return false;
        var index = typeof (item) === "number"
            ? item
            : this.ItemsParent.ItemsSource.findIndex((i) => Utilities.SmartEquals(i, item));
        if (index === -1)
            return false;

        var itemBounds = this.GetItemExpanseBounds(index);
        const viewportBounds: Span = {
            Start: this._scroller.scrollTop,
            End: this._scroller.scrollTop + this._scroller.clientHeight
        };

        var overlap = Utilities.CalculateOverlap(itemBounds, viewportBounds);
        if (overlap === SpanOverlap.Within)
            return false;

        this._scroller.scrollTo({
            top: Math.max(0, itemBounds.Start - this._scroller.clientHeight / 2),
            behavior: "auto"
        });

        return true;
    }

    /**
     * Returns a Span (start and end y-coordinate boundaries) for the item
     * by its index. Sub-classes must implement this item according to their 
     * specific needs.
     * @param itemIndex The 0-based index of the item.
     */
    protected abstract GetItemExpanseBounds(itemIndex: number): Span;

    /**
     * Returns a RenderWindowInfo with complete information about how to
     * render the current window. The default implementation uses 
     * GetItemExpanseBounds to test against educated guesses. Sub-classes
     * may have more efficient implementations which may or may not also
     * utilize GetItemExpanseBounds. (Sub-classes must still implement 
     * GetItemExpanseBounds in case it is invoked elsewhere.)
     * @param windowTop The top Y position of the current render window.
     * @param windowBottom The bottom Y position of the current render
     * window.
     */
    public /* virtual */ ComputeRenderWindow(windowTop: number, windowBottom: number): RenderWindowInfo
    {
        const c = this.ItemCount;
        let newInfo: RenderWindowInfo = new RenderWindowInfo();

        if (windowTop !== 0)
        {
            newInfo.StartIndex = Utilities.SortedBinarySearch(
                ((index) =>
                {
                    var itemPos = this.GetItemExpanseBounds(index);
                    if (itemPos.Start > windowTop)
                        return -1;  // too far; go lower
                    else if (itemPos.End < windowBottom)
                        return +1;  // not far enough; go higher
                    else
                        return 0;
                }).bind(this),
                c);
        }
        else
        {
            newInfo.StartIndex = 0;
        }

        newInfo.StartItemTop = this.GetItemExpanseBounds(newInfo.StartIndex).Start;
        newInfo.EndIndex = newInfo.StartIndex;

        let itemBounds: Span = { Start: 0, End: 0 };

        while (c > newInfo.EndIndex + 1 &&
            (itemBounds = this.GetItemExpanseBounds(newInfo.EndIndex)).End < windowBottom)
            newInfo.EndIndex++;

        newInfo.LastItemBottom = itemBounds.End;

        if (newInfo.EndIndex + 1 === c)
        {
            // end index is the last item
            newInfo.ExpanseHeight = newInfo.LastItemBottom;
        }
        else
        {
            newInfo.ExpanseHeight = this.GetItemExpanseBounds(c - 1).End;
        }

        return newInfo;
    }

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

    override getCSSStyles(): React.CSSProperties
    {
        var styles = super.getCSSStyles();
        styles.display = "block";
        return styles;
    }

    override renderElement(): JSX.Element | null
    {
        if (!this.ItemsParent)
            return null;

        if (this._needsRecomputeWindow)
        {
            this.RecomputeRenderWindowInfo();
            this._needsRecomputeWindow = false;
        }

        return (
            <>
                <div
                    ref={r => { this.SpacerBefore = r; } }
                    style={{
                        height: this.RenderWindowInfo.StartItemTop,
                    }} />

                <VirtualizingPanelItemsPresenter
                    RenderVersion={this._forcedRenderWindowRenderVersion}
                    ParentPanel={this}
                    StartIndex={this.RenderWindowInfo.StartIndex}
                    EndIndex={this.RenderWindowInfo.EndIndex} />

                <div ref={r => { this.SpacerAfter = r; } }
                    style={{
                        height:
                            (this.RenderWindowInfo.ExpanseHeight - this.RenderWindowInfo.LastItemBottom)
                    }} />
            </>
        );
    }

    override OnItemsSourceCollectionChanged(e: ICollectionUpdate)
    {
        var repaint = e.Index !== undefined &&
            e.Index >= this.RenderWindowInfo.StartIndex &&
            e.Index <= this.RenderWindowInfo.EndIndex;
        this.InvalidateRender(repaint);
    }

    override OnComponentMount()
    {
        super.OnComponentMount();
        if (!this.SpacerBefore || !this.SpacerAfter || !this.Container)
            return;

        var root = this.FindScroller();
        if (!root)
            return;
        this._scroller = root as HTMLElement;

        const intersectionObserver = new IntersectionObserver(
            this.IntersectionCallback.bind(this),
            {
                root: this._scroller,
                rootMargin: `50px`,
            });
        intersectionObserver.observe(this.SpacerBefore);
        intersectionObserver.observe(this.SpacerAfter);

        const mutationObserverBefore = createSpacerMutationObserver(this.SpacerBefore);
        const mutationObserverAfter = createSpacerMutationObserver(this.SpacerAfter);

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

    override OnComponentWillUnmount()
    {
        if (this._observers)
        {
            this._observers.intesection.disconnect();
            this._observers.before.disconnect();
            this._observers.after.disconnect();
            delete this._observers;
        }
        super.OnComponentWillUnmount();
    }

    override OnInvalidateRender(forceCascade: boolean)
    {
        this._needsRecomputeWindow = true;
        if (forceCascade)
            this._forcedRenderWindowRenderVersion++;
        super.OnInvalidateRender(forceCascade);
    }

    protected RecomputeRenderWindowInfo(): void
    {
        var windowTop = this._scroller?.scrollTop || 0;
        var windowHeight = this.ItemsParent?.Container?.clientHeight || 0;

        let windowBottom = windowTop + windowHeight * (1 + (this.OverscanHeight as number || 1));
        windowTop = Math.max(0, windowTop - windowHeight * (this.OverscanHeight as number || 1));

        var newInfo = this.ComputeRenderWindow(windowTop, windowBottom);
        this.RenderWindowInfo = newInfo;
        this._hasComputed = true;
        this._needsRecomputeWindow = false;
    }

    protected get ItemCount(): number
    {
        return this.ItemsParent?.ItemsSource?.length || 0;
    }

    protected FindScroller(): HTMLElement | SVGSVGElement | null | undefined
    {
        var elem = this.Container;
        while (elem && elem?.style.overflowY !== "auto")
            elem = elem.parentElement;
        return elem;
    }

    private _callbackNo = 0;

    private async IntersectionCallback(entries: IntersectionObserverEntry[])
    {
        if (!this.SpacerBefore || !this.SpacerAfter || !this.Container)
            return;

        if (this.RealizationDelayMs > 0)
        {
            var callback = ++this._callbackNo;
            await Utilities.SleepAsync(this.RealizationDelayMs);
            if (callback !== this._callbackNo)
                return;
        }

        for (const entry of entries)
        {
            if (!entry.isIntersecting)
                continue;

            if (entry.target === this.SpacerBefore ||
                (entry.target === this.SpacerAfter && this.SpacerAfter.offsetHeight > 0))
            {
                this.InvalidateRender();
                break;
            }
        }
    }

    public /* virtual */ GetItemContainerProps(item: any, index: number, data: any): IPanelProps | undefined
    {
        return undefined;
    }

    protected SpacerBefore: HTMLElement | null = null;
    protected SpacerAfter: HTMLElement | null = null;
    protected RenderWindowInfo: RenderWindowInfo = new RenderWindowInfo();
    protected get Scroller(): HTMLElement | null
    {
        return this._scroller;
    }

    private _hasComputed: boolean = false;
    private _observers?: IObserverCollection;
    protected _scroller: HTMLElement | null = null;
    private _maxWidth: number = 0;
    protected _forcedRenderWindowRenderVersion: number = 0;

    protected _needsRecomputeWindow: boolean = false;
}