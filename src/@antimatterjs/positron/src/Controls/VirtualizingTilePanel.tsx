import * as React from 'react';

import { Binding, Utilities, Point, Span, SpanOverlap } from '@antimatterjs/react';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { IVirtualizingPanelProps, RenderWindowInfo, VirtualizingPanel, VirtualizingPanelItemsPresenter } from './VirtualizingPanel';

export interface IVirtualizingTilePanelProps extends IVirtualizingPanelProps
{
    ItemHeight?: number | Binding;
    ItemMinWidth?: number | Binding;
}

export class VirtualizingTilePanelBase<
    P extends IVirtualizingTilePanelProps>
    extends VirtualizingPanel<P, IPanelState>
{
    public get ItemHeight(): number
    {
        return this.GetValue(nameof(this.props.ItemHeight), 1);
    }

    public get ItemMinWidth(): number
    {        
        return this.GetValue(nameof(this.props.ItemMinWidth), 1);
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
                <div style={{
                    height: this.RenderWindowInfo.ExpanseHeight
                }}>
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
                            position: 'absolute',
                            top: this.RenderWindowInfo.LastItemBottom,
                            height:
                                (this.RenderWindowInfo.ExpanseHeight - this.RenderWindowInfo.LastItemBottom)
                        }} />
                </div>
            </>
        );
    }

    override get ObserveResize(): boolean
    {
        return true;
    }

    override OnResize(): void
    {
        this._itemsPerRow = Math.floor(this.ActualWidth / this.ItemMinWidth);
        this._itemActualWidth = Math.round(this.ActualWidth / this._itemsPerRow);
        this.InvalidateRender(true);
        console.log(`Resize; New item width ${this._itemActualWidth}`);
        super.OnResize();
    }
    
    public override GetItemContainerProps(item: any, index: number, data: any): IPanelProps | undefined
    {
        var row = Math.floor(index / this._itemsPerRow);
        var column = index % this._itemsPerRow;
        return {
            IsAbsolutePositioned: true,
            AbsoluteX: column * this._itemActualWidth,
            AbsoluteY: row * this.ItemHeight,
            MaxWidth: this._itemActualWidth,
            MinWidth: this._itemActualWidth,
            MaxHeight: this.ItemHeight,
            MinHeight: this.ItemHeight
        };
    }

    protected override GetItemExpanseBounds(itemIndex: number): Span 
    {
        var row = Math.floor(itemIndex / this._itemsPerRow);
        var start = row * this.ItemHeight;
        return {
            Start: start,
            End: start + this.ItemHeight
        }
    }

    override ComputeRenderWindow(windowTop: number, windowBottom: number): RenderWindowInfo
    {
        var startRow = Math.floor(windowTop / this.ItemHeight);
        var startIndex = startRow * this._itemsPerRow;

        var endRow = Math.ceil(windowBottom / this.ItemHeight);
        var endIndex = Math.min(
            this.ItemCount - 1,
            endRow * this._itemsPerRow);

        return {
            StartIndex: startIndex,
            EndIndex: endIndex,
            StartItemTop: startRow * this.ItemHeight,
            LastItemBottom: endRow * this.ItemHeight,
            ExpanseHeight: Math.ceil(this.ItemCount / this._itemsPerRow) * this.ItemHeight
        };
    }

    private _itemsPerRow: number = 0;
    private _itemActualWidth: number = 0;
}

export class VirtualizingTilePanel extends VirtualizingTilePanelBase<IVirtualizingTilePanelProps>
{
}