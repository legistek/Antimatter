import { FrameworkElement, IFrameworkElementState } from "../FrameworkElement";
import { IControlState } from "./Control";
import { IItemsControlProps, ItemsControl, ItemsControlBase } from "./ItemsControl";
import { VirtualizedPanel, VirtualizedPanelBase } from "./VirtualizedPanel";

export interface IVirtualizingItemsControlProps extends IItemsControlProps
{
    Overscan?: number;
}

export class VirtualizingItemsControlBase<P extends IVirtualizingItemsControlProps = {}, S extends IControlState = {}>
    extends ItemsControlBase<P, S>
{
}

export class VirtualizingItemsControl extends VirtualizingItemsControlBase<IVirtualizingItemsControlProps>
{
    public get Overscan(): number
    {
        return this.GetValue(nameof(this.props.Overscan), 0);
    }

    protected override GetContainerForItemOverride(): typeof FrameworkElement
    {
        return VirtualizedPanelBase;
    }

    public override OnRenderItem(item: any, index: number, props?: any): JSX.Element | null
    {
        props = props || {};
        props.VirtualizingItemsParent = this;
        return super.OnRenderItem(item, index, props);
    }
}