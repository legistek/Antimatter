import { Antimatter, Utilities } from '@antimatterjs/react';
import { EntryType } from 'perf_hooks';
import * as React from 'react';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { VirtualizingItemsControl } from './VirtualizingItemsControl';

export interface IVirtualizedPanelProps extends IPanelProps
{
    VirtualizingItemsParent?: VirtualizingItemsControl;
    PlaceholderHeight?: number;
    RealizationDelay?: number;
    Overscan?: number;
    GroupIndex?: number;
}

export class VirtualizedPanelBase<P extends IVirtualizedPanelProps = {}, S extends IPanelState = {}>
    extends PanelBase<P, S>
{
    private _measuredHeight?: number;
    private _observer?: IntersectionObserver;
    private _deferBindings: boolean = true;

    constructor(props)
    {
        super(props);
        this.InteractionCallback = this.InteractionCallback.bind(this);
    }

    public override get DeferBindings()
    {
        return !(this._deferBindings === false);
    }

    public get IsRealized()
    {
        return this.GetValue(nameof(this.IsRealized), false);
    }
    public set IsRealized(value: boolean)
    {
        this.SetValue(nameof(this.IsRealized), value, true);
    }

    public get RealizationDelay(): number
    {
        return this.GetValue(nameof(this.RealizationDelay), 0);
    }

    public get GroupIndex(): number
    {
        return this.GetValue(nameof(this.GroupIndex), 0);
    }

    private _lastHeight: number = 0;

    protected override OnContainerMounted(container: HTMLElement)
    {
        var delta = container.clientHeight - (this._lastHeight || this.PlaceholderHeight || 0);
        this._lastHeight = container.clientHeight;
        if (delta === 0)
            return;

        var scroller = Utilities.FindParentElement(container, (e) =>
        {
            if (!e.style)
                return false;
            return e.style.overflowY === "auto" ||
                e.style.overflowY === "scroll";
        });
        if (!scroller)
            return false;

        var panel = (scroller as any).AMXInstance as PanelBase;
        if (!(panel instanceof PanelBase))
            return;

        var rc = container.getBoundingClientRect();
        var rp = scroller.getBoundingClientRect();
        if (!rc || !rp)
            return false;

        var y = rc.y - rp.y;        // client's y relative to parent's

        panel.OnScrollableHeightChanged(y + scroller.scrollTop, delta);
    }

    public get Overscan(): number
    {
        return this.GetValue(
            nameof(this.props.Overscan),
            this.VirtualizingItemsParent?.Overscan || 10);
    }

    public get VirtualizingItemsParent(): VirtualizingItemsControl | undefined
    {
        return this.GetValue(nameof(this.props.VirtualizingItemsParent));
    }

    public /* virtual */ RenderRealizedElement(): JSX.Element
    {
        return (<>{this.props.children}</>);
    }

    /** Called when the panel comes into view. */
    protected /* virtual */ OnRealization()
    {
    }

    /** Called when the panel comes out of view. */
    protected /* virtual */ OnDerealization()
    {
    }

    /* override */ renderElement(): JSX.Element
    {
        if (this.IsRealized)
            //return (<div>We are real!</div>);
            return this.RenderRealizedElement();
        else
            return (<></>);
    }

    /* override */ getCSSStyles(): React.CSSProperties
    {
        var styles = super.getCSSStyles();
        if (!this.IsRealized && this.PlaceholderHeight !== undefined)
            styles.height = this.PlaceholderHeight;
        return styles;
    }

    public /* override */ OnComponentMount(): void
    {
        if (!this.Container)
            return;

        var scroller = Utilities.FindParentElement(this.Container as HTMLElement, (e) =>
        {
            if (!e.style)
                return false;
            return e.style.overflowY === "auto" ||
                e.style.overflowY === "scroll";
        });
        if (!scroller)
            return;

        this._observer = new IntersectionObserver(
            this.InteractionCallback,
            {
                rootMargin: `${this.Overscan}px 0px ${this.Overscan}px 0px`,
                root: scroller,
                threshold: 0
            }
        );
        this._observer.observe(this.Container);
    }

    /* override */ OnComponentWillUnmount(): void
    {
        this._observer?.disconnect();
    }

    protected /*virtual*/ get PlaceholderHeight(): number | undefined
    {
        return this._measuredHeight ||
            this.GetValue(nameof(this.props.PlaceholderHeight)) ||
            this.VirtualizingItemsParent?.VirtualizingPlaceholderHeight ||
            100;
    }

    private _possibleRealization: boolean = false;
    private _possibleDerealization: boolean = false;

    private async InteractionCallback(entries: IntersectionObserverEntry[], observer: IntersectionObserver)
    {
        let realized: boolean = false;
        for (let e of entries)
        {
            if (e.isIntersecting)
            {
                realized = true;
                break;
            }
        }

        if (!realized)
        {
            this._possibleRealization = false;
            if (!this.IsRealized || this._possibleDerealization)
                return;

            this._possibleDerealization = true;
            if (this.RealizationDelay > 0)
                await Utilities.SleepAsync(this.RealizationDelay);
            if (!this._possibleDerealization)
                return;
            // On the way out, save its measured height
            this._measuredHeight = (this.Container as HTMLElement)?.offsetHeight || this._measuredHeight;
            this.OnDerealization();
            Antimatter.UnapplyAllBindings(this);
            this._possibleDerealization = false;
        }
        else
        {
            this._possibleDerealization = false;
            if (this.IsRealized || this._possibleRealization)
                return;

            this._possibleRealization = true;
            if (this.RealizationDelay > 0)
                await Utilities.SleepAsync(this.RealizationDelay);
            if (!this._possibleRealization)
                return;
            this._deferBindings = false;
            this.InitializeElement();
            this.OnRealization();
            this._possibleRealization = false;
        }

        this.IsRealized = realized;
    }
}

export class VirtualizedPanel extends VirtualizedPanelBase<IVirtualizedPanelProps>
{
}