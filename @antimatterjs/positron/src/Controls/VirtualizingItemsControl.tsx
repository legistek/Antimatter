import { FrameworkElement } from "../FrameworkElement";
import { IItemsControlProps, IItemsControlState, ItemsControl, ItemsControlBase } from "./ItemsControl";
import { VirtualizedPanel, VirtualizedPanelBase } from "./VirtualizedPanel";

export interface IVirtualizingItemsControlProps extends IItemsControlProps
{
    DefaultItemHeight?: number;
    Overscan?: number;
}

export interface IVirtualizingItemsControlState extends IItemsControlState
{
    DefaultItemHeight?: number;
    Overscan?: number;
}

export class VirtualizingItemsControlBase<
    P extends IVirtualizingItemsControlProps = {},
    S extends IVirtualizingItemsControlState = {}>
    extends ItemsControlBase<P, S>
{
    public readonly IsVirtualizingItemsControl = true;
}

export class VirtualizingItemsControl extends VirtualizingItemsControlBase<IVirtualizingItemsControlProps, IVirtualizingItemsControlState>
{
    /* protected virtual */ GetContainerForItemOverride(): typeof FrameworkElement
    {
        return VirtualizedPanelBase;
    }
}