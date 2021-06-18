import { Binding, Utilities } from '@antimatterjs/react';
import * as React from 'react';
import { Span } from '../Foundation';
import { IVirtualizingPanelProps, IVirtualizingPanelState, VirtualizingPanel } from './VirtualizingPanel';

interface IVirtualizingStackPanelCommon
{
    GetItemSpan?: (index: number) => Span;
}

export interface IVirtualizingStackPanelProps extends IVirtualizingPanelProps, IVirtualizingStackPanelCommon
{
    ItemHeight?: number | Binding;
}

export interface IVirtualizingStackPanelState extends IVirtualizingPanelState, IVirtualizingStackPanelCommon
{
    ItemHeight?: number;
}

export class VirtualizingStackPanelBase<
    P extends IVirtualizingStackPanelProps = {},
    S extends IVirtualizingStackPanelState = {}>
    extends VirtualizingPanel<P, S>
{
    protected /* override */ GetItemExpanseBounds(itemIndex: number): Span
    {
        if (this.state.GetItemSpan)
            return this.state.GetItemSpan(itemIndex);

        const height = this.state.ItemHeight as number;
        if (height !== undefined)
        {
            const origin = itemIndex * height;
            return {
                Start: origin,
                End: origin + height
            };
        }

        throw "VirtualizingStackPanel must specify ItemHeight or provide a GetItemSpan function";        
    }

    /* override */ constructClasses(): string
    {
        return "amx-ptn-stack-panel "
            + super.constructClasses();
    }
}

export class VirtualizingStackPanel extends VirtualizingStackPanelBase<IVirtualizingStackPanelProps, IVirtualizingStackPanelState>
{
}