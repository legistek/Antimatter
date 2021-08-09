import * as React from 'react';
import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { VirtualizingItemsControl, VirtualizingItemsControlBase } from './VirtualizingItemsControl';

export interface IVirtualizedPanelProps extends IPanelProps
{
    Data?: any;
    VirtualizingItemsParent?: VirtualizingItemsControl;
}
export interface IVirtualizedPanelState extends IPanelState
{
    IsRealized?: boolean;
    Data?: any;
    VirtualizingItemsParent?: VirtualizingItemsControl;
}

export class VirtualizedPanelBase<P extends IVirtualizedPanelProps = {}, S extends IVirtualizedPanelState = {}>
    extends PanelBase<P, S>
{
    private _measuredHeight?: number;
    private _observer?: IntersectionObserver;

    constructor(props)
    {
        super(props);
        if (!this.state.VirtualizingItemsParent)
            throw "Only use VirtualizedPanel with a VirtualizingItemsControl";
        this.InteractionCallback = this.InteractionCallback.bind(this);
    }

    public /* virtual */ RenderRealizedElement(): JSX.Element
    {
        return (<>{this.props.children}</>);
    }

    protected /* virtual */ OnRealization()
    {
    }

    protected /* virtual */ OnDerealization()
    {
    }

    /* override */ renderElement(): JSX.Element
    {
        if (this.state.IsRealized)
            return this.RenderRealizedElement();
        else
            return (<></>);
    }

    /* override */ getCSSStyles(): React.CSSProperties
    {
        var styles = super.getCSSStyles();
        if (!this.state.IsRealized)
            styles.height = this.PlaceholderHeight;
        return styles;
    }

    /* override */ componentDidMount(): void
    {
        if (!this.Container)
            return;
        this.state.VirtualizingItemsParent?.state;
        this._observer = new IntersectionObserver(
            this.InteractionCallback,
            {
                rootMargin: `${(this.state.VirtualizingItemsParent?.state?.Overscan || 0)}px 0px ${(this.state.VirtualizingItemsParent?.state?.Overscan || 0)}px 0px`
            }
        );
        this._observer.observe(this.Container);
    }

    /* override */ componentWillUnmount(): void
    {
        this._observer?.disconnect();
    }

    private get PlaceholderHeight(): number
    {
        return this._measuredHeight || this.state.VirtualizingItemsParent?.state.DefaultItemHeight || 100;
    }

    private InteractionCallback(entries: IntersectionObserverEntry[], observer: IntersectionObserver): void
    {
        var realized = entries[0].isIntersecting;
        if (!realized)
        {
            if (!this.state.IsRealized)
                return;
            
            // On the way out, save its measured height
            this._measuredHeight = this.Container?.offsetHeight || this._measuredHeight;
            this.OnDerealization();            
        }
        else
        {
            if (this.state.IsRealized)
                return;
            this.OnRealization();
        }

        this.setState({
            IsRealized: realized
        });

        //console.log(`${this.state.Data} interacting: ${isInteracting}`);
        //(window as any).requestIdleCallback(
        //    () =>
        //    {
        //        //var realized = entries[0].isIntersecting;
        //        //if (realized)
        //        //    this.OnRealization();
        //        //else
        //        //    this.OnDerealization();

        //    },
        //    {
        //        timeout: 600
        //    });
    }
}

export class VirtualizedPanel extends VirtualizedPanelBase<IVirtualizedPanelProps, IVirtualizedPanelState>
{
}