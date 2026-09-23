import * as React from 'react';
import { Binding, Utilities, Point, Span } from '@antimatterjs/react';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { FrameworkElement, IFrameworkElementProps } from '../FrameworkElement';
import { IVirtualizingPanelProps, RenderWindowInfo, VirtualizingPanel } from './VirtualizingPanel';

export interface IVirtualizingStackPanelProps extends IVirtualizingPanelProps
{
    ItemHeight?: number | Binding;
}

export class VirtualizingStackPanelBase<
    P extends IVirtualizingStackPanelProps,
    S extends IPanelState>
    extends VirtualizingPanel<P, S>
{
    public get ItemHeight(): number
    {
        return this.GetValue(
            nameof(this.props.ItemHeight),
            this.ItemsParent?.VirtualizingPlaceholderHeight ?? 1);
    }

    protected override GetItemExpanseBounds(itemIndex: number): Span 
    {
        return {
            Start: this.ItemHeight * itemIndex,
            End: this.ItemHeight * (itemIndex + 1)                
        };
    }

    override ComputeRenderWindow(windowTop: number, windowBottom: number): RenderWindowInfo
    {
        var startIndex = Math.floor(windowTop / this.ItemHeight);
        var endIndex = Math.min(
            this.ItemCount - 1,
            Math.ceil(windowBottom / this.ItemHeight));
        
        return {
            StartIndex: startIndex,
            EndIndex: endIndex,
            StartItemTop: startIndex * this.ItemHeight,
            LastItemBottom: (endIndex + 1) * this.ItemHeight,
            ExpanseHeight: this.ItemCount * this.ItemHeight            
        };
    }
}
export class VirtualizingStackPanel extends VirtualizingStackPanelBase<IVirtualizingStackPanelProps, IPanelState>
{
}