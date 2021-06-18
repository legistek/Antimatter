import * as React from 'react';
import { PanelBase, IPanelProps, IPanelState } from './Panel';

export interface IVirtualizingPanelProps extends IPanelProps
{
}

export interface IVirtualizingPanelState extends IPanelState
{
}

interface IObserverCollection
{
    intesection: IntersectionObserver,
    before: MutationObserver,
    after: MutationObserver
}

export abstract class VirtualizingPanel<
    P extends IVirtualizingPanelProps,
    S extends IVirtualizingPanelState>
    extends PanelBase<P, S>
{
    private _spacerBefore: HTMLElement | null = null;
    private _spacerAfter: HTMLElement | null = null;
    private _itemsBefore: number = 0;
    private _lastRenderedItemCount: number = 0;
    private _visibleItemCapacity: number = 0;
    private _hasComputed: boolean = false;
    private _observers?: IObserverCollection;

    private get ItemCount(): number
    {
        return this.state.ItemsParent?.state?.ItemsSource?.length || 0;
    }

    /* override */ componentDidMount()
    {
        if (!this._spacerBefore || !this._spacerAfter)
            return;

        const intersectionObserver = new IntersectionObserver(
            this.IntersectionCallback.bind(this),
            {
                root: this.Container,
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

    private IntersectionCallback(entries: IntersectionObserverEntry[]): void
    {
        entries.forEach((entry): void =>
        {
            if (!entry.isIntersecting)
                return;

            if (!this._spacerBefore || !this._spacerAfter)
                return;


            const spacerBeforeRect = this._spacerBefore.getBoundingClientRect();
            const spacerAfterRect = this._spacerAfter.getBoundingClientRect();
            const spacerSeparation = spacerAfterRect.top - spacerBeforeRect.bottom;
            const containerSize = entry.rootBounds?.height || 0;

            //window.clearTimeout(scroller['isScrolling']);
            //scroller['isScrolling'] = setTimeout(() => {                
            if (entry.target === this._spacerBefore)
            {
                this.OnBeforeSpacerVisible(entry.intersectionRect.top - entry.boundingClientRect.top, spacerSeparation, containerSize);
            } else if (entry.target === this._spacerAfter && this._spacerAfter.offsetHeight > 0)
            {
                // When we first start up, both the "before" and "after" spacers will be visible, but it's only relevant to raise a
                // single event to load the initial data. To avoid raising two events, skip the one for the "after" spacer if we know
                // it's meaningless to talk about any overlap into it.
                dotNetHelper.invokeMethodAsync('OnSpacerAfterVisible', entry.boundingClientRect.bottom - entry.intersectionRect.bottom, spacerSeparation, containerSize);
            }
            //}, 100);
        });

    }

    /* override */ renderElement(): JSX.Element | null
    {
        if (!this.state.ItemsParent)
            return null;

        var items = this.state.ItemsParent?.state.ItemsSource;
        if (!items || items.length === 0)
            return null;

        let startIndex = this._itemsBefore;
        let endIndex = Math.min(startIndex + this._visibleItemCapacity, items.length);

        // Clear children
        //ClearOldChildren(startIndex, endIndex);

        let itemsStart = this.ComputeItemExpanseBounds(startIndex);


        return (
            <>
                <div
                    ref={r => this._spacerBefore = r}
                    style={{
                        height: itemsStart.Top,
                        width: "100%"
                    }} />

            </>

        );
    }

    protected abstract ComputeItemExpanseBounds(itemIndex: number): { Left: number, Top: number, Right: number, Bottom: number };

    protected abstract ComputeRenderWindow(
        itemCount: number,
        windowTop: number,
        windowHeight: number): { StartIndex: number, EndIndex: number };

    private UpdateItemDistribution(itemsBefore: number, visibleItemCapacity: number): void
    {
        if (itemsBefore != this._itemsBefore || visibleItemCapacity != this._visibleItemCapacity)
        {
            this._itemsBefore = itemsBefore;
            this._visibleItemCapacity = visibleItemCapacity;
            this._hasComputed = true;
            this.InvalidateRender();
        }
    }

    private OnBeforeSpacerVisible(spacerSize: number, spacerSeparation: number, containerSize: number): void
    {
        var dist = this.CalcualteItemDistribution(spacerSize, spacerSeparation, containerSize);

        // Since we know the before spacer is now visible, we absolutely have to slide the window up
        // by at least one element. If we're not doing that, the previous item size info we had must
        // have been wrong, so just move along by one in that case to trigger an update and apply the
        // new size info.
        if (dist.ItemsInSpacer === this._itemsBefore && dist.ItemsInSpacer > 0)
        {
            dist.ItemsInSpacer--;
        }

        this.UpdateItemDistribution(dist.ItemsInSpacer, dist.VisibleItemCapacity);
    }

    private CalcualteItemDistribution(
        spacerSize : number,
        spacerSeparation:number,
        containerSize : number): { ItemsInSpacer: number, VisibleItemCapacity: number }
    {
        if (this._lastRenderedItemCount > 0)
        {
            this._itemSize = spacerSeparation / this._lastRenderedItemCount;
        }

        if (_itemSize <= 0)
        {
            // At this point, something unusual has occurred, likely due to misuse of this component.
            // Reset the calculated item size to the user-provided item size.
            _itemSize = this.GetItemSize();
        }

        return {
            ItemsInSpacer: Math.max(0, Math.floor(spacerSize / this._itemSize) - this.GetOverscanCount()),
            VisibleItemCapacity: Math.ceil(containerSize / this._itemSize) + 2 * this.GetOverscanCount()
        };
    }
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