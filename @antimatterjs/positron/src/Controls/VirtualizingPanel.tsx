import { Binding, Utilities } from '@antimatterjs/react';
import * as React from 'react';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';
import { Point, Span } from '../Foundation';
import { MultitouchTransform } from '../Media/MultitouchTransform';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { StackPanel } from './StackPanel';

export interface IVirtualizingPanelProps extends IPanelProps
{
    Scale?: number|Binding,
}

export interface IVirtualizingPanelState extends IPanelState
{
    Scale?: number
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
    private _spacerBefore: HTMLElement | null = null;
    private _spacerAfter: HTMLElement | null = null;
    //private _itemsBefore: number = 0;
    //private _heightBefore: number = 0;
    //private _lastRenderedItemCount: number = 0;
    //private _visibleItemCapacity: number = 0;
    private _hasComputed: boolean = false;
    private _observers?: IObserverCollection;
    private _renderWindowInfo: RenderWindowInfo = new RenderWindowInfo();
    private _scroller: HTMLElement | null = null;
    private _needsWidthCalc: boolean = false;
    private _maxWidth: number = 0;
    private _desiredScroll?: Point;

    constructor(props)
    {
        super(props);
    }

    /** Returns the multiple of the visible height that should be
     * rendered before and after the visible height to promote smoother scrolling. 
     **/
    protected /* virtual */ GetOverscanHeight() : number
    {
        this.componentDidUpdate
        return 1;
    }

    public SetDesiredScroll(pt: Point)
    {
        this._desiredScroll = pt;
        //this.InvalidateRender();
    }

    protected abstract GetItemExpanseBounds(itemIndex: number): Span;

    /* override */ renderElement(): JSX.Element | null
    {
        if (!this.state.ItemsParent)
            return null;

        var items = this.state.ItemsParent?.state.ItemsSource;
        if (!items || items.length === 0)
            return null;

        const widthPercent = this.state.Scale ? (100 / (this.state.Scale as number || 1)) : 100;

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

    private GetItemExpanseBoundsPrivate(itemIndex: number): Span
    {
        return this.GetItemExpanseBounds(itemIndex);        
    }

    /* override */ componentDidUpdate(prevProps)
    {
        if (!this.Container || !this._scroller)
            return;

        if (this._desiredScroll)
        {
            this.Container.style.width = `${this._maxWidth * (this.state.Scale as number || 1)}px`;
            this._scroller.scrollLeft = this._desiredScroll.X;
            this._scroller.scrollTop = this._desiredScroll.Y;
            this._desiredScroll = undefined;
        }
        else
        {
            // Preserve H scroll during calculation
            const hscroll = this._scroller.scrollLeft;
            this.Container.style.height = `${this._renderWindowInfo.LastItemBounds.End * (this.state.Scale as number || 1)}px`;
            this.Container.style.width = "fit-content";
            this._maxWidth = Math.max(this._maxWidth, this.Container?.clientWidth || 0);
            this.Container.style.width = `${this._maxWidth * (this.state.Scale as number || 1)}px`;

            this._scroller.scrollLeft = hscroll;
        }
    }

    private ComputeRenderWindowInfo (
        windowTop: number,
        windowHeight: number) : void
    {
        let c = this.ItemCount;

        windowTop /= (this.state.Scale as number || 1);
        windowHeight /= (this.state.Scale as number || 1);

        const windowBottom = windowTop + windowHeight * (1 + this.GetOverscanHeight());
        windowTop = Math.max(0, windowTop - windowHeight * this.GetOverscanHeight());
        
        this._renderWindowInfo.StartIndex = Utilities.SortedBinarySearch(
            ((index) =>
            {
                var itemPos = this.GetItemExpanseBoundsPrivate(index);
                if (itemPos.Start > windowTop)
                    return -1;  // too far; go lower
                else if (itemPos.End < windowBottom)
                    return +1;  // not far enough; go higher
                else
                    return 0;
            }).bind(this),
            c);

        this._renderWindowInfo.StartItemBounds = this.GetItemExpanseBoundsPrivate(this._renderWindowInfo.StartIndex);
        this._renderWindowInfo.EndIndex = this._renderWindowInfo.StartIndex;

        let itemBounds: Span = { Start: 0, End: 0 };

        while (c > this._renderWindowInfo.EndIndex + 1 &&
            (itemBounds = this.GetItemExpanseBoundsPrivate(this._renderWindowInfo.EndIndex)).End < windowBottom)
            this._renderWindowInfo.EndIndex++;

        //this._renderWindowInfo.EndItemBounds = itemBounds;
        //if (this._renderWindowInfo.EndIndex < c - 1)
        //    this._renderWindowInfo.LastItemBounds = this.GetItemExpanseBounds(c - 1);
        //else
        //    this._renderWindowInfo.LastItemBounds = itemBounds;

       
        this._renderWindowInfo.LastItemBounds = this.GetItemExpanseBoundsPrivate(c - 1);
        if (this._renderWindowInfo.EndIndex + 1 === c)
        {
            // end index is the last item
            this._renderWindowInfo.EndItemBounds = this._renderWindowInfo.LastItemBounds;
        }
        else
        {
            this._renderWindowInfo.EndItemBounds = itemBounds;
        }

        this._hasComputed = true;
    }

    private get ItemCount(): number
    {
        return this.state.ItemsParent?.state?.ItemsSource?.length || 0;
    }

    private RecomputeVisibleWindow()
    {
        if (!this.Container)
            return;
        this.ComputeRenderWindowInfo(
            this.Container.scrollTop / (this.state.Scale as number || 1),
            this.Container.clientHeight);
        this._hasComputed;
        this.InvalidateRender();
    }

    private FindScroller(): HTMLElement|null|undefined
    {
        var elem = this.Container;
        while (elem && elem?.style.overflowY !== "auto")
            elem = elem.parentElement;
        return elem;
    }

    /* override */ componentDidMount()
    {
        if (!this._spacerBefore || !this._spacerAfter || !this.Container)
            return;

        //this.RecomputeVisibleWindow();
        //this.Container.onscroll = (ev) =>
        //{
        //    this.RecomputeVisibleWindow();
        //};

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
    }

    private IntersectionCallback(entries: IntersectionObserverEntry[]): void
    {
        if (!this._spacerBefore || !this._spacerAfter || !this.Container)
            return;

        for (const entry of entries)
        {
            if (!entry.isIntersecting)
                continue;                       

            //const spacerBeforeRect = this._spacerBefore.getBoundingClientRect();
            //const spacerAfterRect = this._spacerAfter.getBoundingClientRect();
            //const spacerSeparation = spacerAfterRect.top - spacerBeforeRect.bottom;
            //const containerSize = entry.rootBounds?.height || 0;

            if (entry.target === this._spacerBefore || 
                 (entry.target === this._spacerAfter && this._spacerAfter.offsetHeight > 0))
            {
                this.ComputeRenderWindowInfo(
                    this._scroller?.scrollTop || 0,
                    this.state.ItemsParent?.Container?.clientHeight || 0);
                this.InvalidateRender();
                break;
            }

            ////window.clearTimeout(scroller['isScrolling']);
            ////scroller['isScrolling'] = setTimeout(() => {                
            //if (entry.target === this._spacerBefore)
            //{
            //    this.OnBeforeSpacerVisible(
            //        entry.intersectionRect.top - entry.boundingClientRect.top,
            //        spacerSeparation,
            //        containerSize);
            //}
            //else if (entry.target === this._spacerAfter &&
            //        this._spacerAfter.offsetHeight > 0)
            //{
            //    // When we first start up, both the "before" and "after" spacers will be visible, but it's only relevant to raise a
            //    // single event to load the initial data. To avoid raising two events, skip the one for the "after" spacer if we know
            //    // it's meaningless to talk about any overlap into it.
            //    this.OnAfterSpacerVisible(entry.boundingClientRect.bottom - entry.intersectionRect.bottom, spacerSeparation, containerSize);
            //}
            ////}, 100);
        }
    }

    
    private RenderVisibleItems(items: any[]): JSX.Element[]|null
    {
        if (!this._hasComputed)
            return null;        
        //this._lastRenderedItemCount = 0;

        var visibleItems: JSX.Element[] = new Array(
            this._renderWindowInfo.EndIndex - this._renderWindowInfo.StartIndex + 1);

        // Visible items           
        for (let i = this._renderWindowInfo.StartIndex,
            j = 0; i <= this._renderWindowInfo.EndIndex;
            i++, j++)
        {
            var item = items[i];

            var renderedItem = this.state.ItemsParent?.OnRenderItem(item) || (<></>);
            //this._lastRenderedItemCount++;
            visibleItems[j] = renderedItem;                        
        }

        return visibleItems;
    }

    //private UpdateItemDistribution(itemsBefore: number, visibleItemCapacity: number): void
    //{
    //    if (itemsBefore != this._itemsBefore || visibleItemCapacity != this._visibleItemCapacity)
    //    {
    //        this._itemsBefore = itemsBefore;
    //        this._visibleItemCapacity = visibleItemCapacity;
    //        this._hasComputed = true;
    //        this.InvalidateRender();
    //    }
    //}

    //private OnBeforeSpacerVisible(spacerSize: number, spacerSeparation: number, containerSize: number): void
    //{
    //    var dist = this.CalcualteItemDistribution(spacerSize, spacerSeparation, containerSize);

    //    // Since we know the before spacer is now visible, we absolutely have to slide the window up
    //    // by at least one element. If we're not doing that, the previous item size info we had must
    //    // have been wrong, so just move along by one in that case to trigger an update and apply the
    //    // new size info.
    //    if (dist.ItemsInSpacer === this._itemsBefore && dist.ItemsInSpacer > 0)
    //    {
    //        dist.ItemsInSpacer--;
    //    }

    //    this.UpdateItemDistribution(dist.ItemsInSpacer, dist.VisibleItemCapacity);
    //}

    //private OnAfterSpacerVisible(spacerSize: number, spacerSeparation: number, containerSize: number): void
    //{
    //    var dist = this.CalcualteItemDistribution(spacerSize, spacerSeparation, containerSize);

    //    var itemsBefore = Math.max(0, this.ItemCount - dist.ItemsInSpacer - dist.VisibleItemCapacity);

    //    // Since we know the after spacer is now visible, we absolutely have to slide the window down
    //    // by at least one element. If we're not doing that, the previous item size info we had must
    //    // have been wrong, so just move along by one in that case to trigger an update and apply the
    //    // new size info.
    //    if (itemsBefore == this._itemsBefore && itemsBefore < this.ItemCount - dist.VisibleItemCapacity)
    //    {
    //        itemsBefore++;
    //    }

    //    this.UpdateItemDistribution(itemsBefore, dist.VisibleItemCapacity);
    //}

    //private CalcualteItemDistribution(
    //    spacerSize : number,
    //    spacerSeparation:number,
    //    containerSize : number): { ItemsInSpacer: number, VisibleItemCapacity: number }
    //{
    //    if (this._lastRenderedItemCount > 0)
    //    {
    //        this._itemSize = spacerSeparation / this._lastRenderedItemCount;
    //    }

    //    if (_itemSize <= 0)
    //    {
    //        // At this point, something unusual has occurred, likely due to misuse of this component.
    //        // Reset the calculated item size to the user-provided item size.
    //        _itemSize = this.GetItemSize();
    //    }

    //    return {
    //        ItemsInSpacer: Math.max(0, Math.floor(spacerSize / this._itemSize) - this.GetOverscanHeight()),
    //        VisibleItemCapacity: Math.ceil(containerSize / this._itemSize) + 2 * this.GetOverscanHeight()
    //    };
    //}
}

export class ScrollInfo
{
    public ScrollTop: number = 0;
    public ClientHeight: number = 0;

    public static Equals(s1: ScrollInfo, s2: ScrollInfo)
    {
        return s1.ScrollTop === s2.ScrollTop &&
            s1.ClientHeight === s2.ClientHeight;
    }
}