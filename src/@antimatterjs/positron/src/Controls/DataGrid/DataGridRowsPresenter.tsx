import * as React from 'react';
import { Span } from '@antimatterjs/react';

import { Orientation, ScrollBarVisibility } from '../../Enums';
import { IFrameworkElementState } from '../../FrameworkElement';
import { Style, WebStyle } from '../../Style';
import { Panel, IPanelProps, IPanelState } from "../Panel";
import { StackPanel } from '../StackPanel';
import { IVirtualizedPanelProps } from '../VirtualizedPanel';
import { RenderWindowInfo, VirtualizingPanel, VirtualizingPanelItemsPresenter } from "../VirtualizingPanel";
import { DataGrid, DataGridBase, IDataGridColumn } from "./DataGrid";
import { DataGridHeaderCell } from './DataGridHeaderCell';
import { DataGridHeaderPanel } from './DataGridHeaderPanel';
import { SemanticColor, Theme } from '../../Theme';
import { Grid } from '../Grid';
import { DataGridCell } from './DataGridCell';
import { CSSClasses } from '../../CSSClasses';

export interface IDataGridRowsPresenterProps extends IVirtualizedPanelProps
{
    BottomPadding?: number
}

export class DataGridRowsPresenter extends VirtualizingPanel<IDataGridRowsPresenterProps, IFrameworkElementState>
{
    constructor(props)
    {
        super(props);
        this.OnScroll = this.OnScroll.bind(this);
    }

    public static CondensedStyle = new WebStyle<IDataGridRowsPresenterProps>({
        VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
    });

    public static DefaultStyle = new WebStyle<IDataGridRowsPresenterProps>(
        {
            HorizontalScrollBarVisibility: ScrollBarVisibility.Auto,
            VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
            AutoScrollForDrag: true
        },
        {
            "@ .header-row": {
                position: "sticky",
                zIndex: 134,
                top: "0px",
                gridRow: 1,
                overflow: "visible"
            },           
            "@ .PART_TopSpacer": {
                gridRow: 2,
            },
            "@ .PART_RealizedRowsPanel": {
                zIndex: 50,
                gridRow: 3,
                overflow: "visible"
            },
            "@ .PART_BottomSpacer": {
                gridRow: 4,
            },
            [`@ .${CSSClasses.DataGridCellFrozenFirst}`]: {
                position: "sticky",
                left: "0px",
                background: Theme.Value(SemanticColor.BodyBackground),
                zIndex: 134
            },
            [`@ .${DataGridCell.STATE_FrozenLast}`]: {
                position: "sticky",
                right: "0px",
                background: Theme.Value(SemanticColor.BodyBackground),
                zIndex: 134
            },
        });

    private _headers?: DataGridHeaderPanel | null;
    private _headerVersion: number = 0;
   
    public get BottomPadding(): number
    {
        return this.GetValue(nameof(this.props.BottomPadding), 0);
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
                {
                    this.DataGrid?.HasHeaders &&
                    <DataGridHeaderPanel
                        RenderVersion={this._headerVersion}
                        ClassName="header-row"
                        Style={this.DataGrid.HeaderPanelStyle}
                        DataGrid={this.DataGrid} />
                }                                

                <div
                    ref={r => { this.SpacerBefore = r; } }
                    className="PART_TopSpacer"
                    style={{                        
                        height: this.RenderWindowInfo.StartItemTop,
                    }} />

                <StackPanel
                    ClassName="PART_RealizedRowsPanel"
                    Orientation={Orientation.Vertical}
                    ItemSpacing="0px">
                    <VirtualizingPanelItemsPresenter
                        ParentPanel={this}
                        RenderVersion={this._forceRenderTrigger}
                        StartIndex={this.RenderWindowInfo.StartIndex}
                        EndIndex={this.RenderWindowInfo.EndIndex}
                    />
                </StackPanel>

                <div ref={r => { this.SpacerAfter = r; } }
                    className="PART_BottomSpacer"
                    style={{
                        height: (this.RenderWindowInfo.ExpanseHeight - this.RenderWindowInfo.LastItemBottom) + this.BottomPadding
                    }} />
            </>
        );
    }

    override OnInvalidateRender(forceCasecade: boolean)
    {
        if (this.DataGrid?.CanSelect === true || forceCasecade)
            this._forceRenderTrigger++;
        this._headerVersion++;
        this._headers?.InvalidateRender(forceCasecade);
        super.OnInvalidateRender(forceCasecade);
    }

    override getCSSStyles(): React.CSSProperties
    {
        var styles = super.getCSSStyles();
        styles.display = "grid";        
        styles.gridTemplateRows = `max-content max-content max-content max-content`;
        //styles.gridTemplateColumns =
        //    `${this.DataGrid?.FrozenFirstColumn?.Width || 0}px minmax(max-content,1fr) ${this.DataGrid?.FrozenLastColumn?.Width || 0}px`;
        return styles;        
    }   

    override GetItemContainerProps(item: any, index: number, data: any): any
    {
        // In this case 'data' is potentially a frozen IDataGridColumn
        var col = data as IDataGridColumn | undefined;
        if (col?.IsFrozen)
            return {
                FrozenColumn: col
            };
        return undefined;        
    }

    private get DataGrid(): DataGridBase
    {
        return this.ItemsParent as DataGrid;
    }

    private _lastScrollTop: number = 0;

    private OnScroll()
    {
        if (!this.DataGrid.NotifyScrollChange || !this.Scroller || !this.Container)
            return;
        this.DataGrid.OnScrollChange(
            this.Container.scrollTop,
            this.Container.scrollTop - this._lastScrollTop,
            this.Container.clientHeight,
            this.Container.scrollHeight
        );
        this._lastScrollTop = this.Container.scrollTop;
    }

    override OnComponentMount()
    {
        super.OnComponentMount();
        if (this.DataGrid.NotifyScrollChange && this.Container)
        {
            this.Container.addEventListener("scroll", this.OnScroll);
        }
    }

    override OnComponentWillUnmount()
    {
        if (!this.Container)
            return;
        this.Container.removeEventListener("scroll", this.OnScroll);
    }

    protected override GetItemExpanseBounds(itemIndex: number): Span
    {
        let y: number = itemIndex * (this.DataGrid?.RowHeight || 1);
        return {
            Start: y,
            End: y + (this.DataGrid?.RowHeight || 1)
        }
    }

    override ComputeRenderWindow(windowTop: number, windowBottom: number): RenderWindowInfo
    {
        let newInfo: RenderWindowInfo = new RenderWindowInfo();
        if (!this.DataGrid)
            return newInfo;

        newInfo.StartIndex = Math.floor(windowTop / (this.DataGrid?.RowHeight || 1));
        newInfo.StartItemTop = this.GetItemExpanseBounds(newInfo.StartIndex).Start;
        newInfo.EndIndex = Math.min(
            Math.ceil(windowBottom / (this.DataGrid?.RowHeight || 1)),
            this.ItemCount - 1);
        newInfo.LastItemBottom = (newInfo.EndIndex + 1) * (this.DataGrid.RowHeight || 0);
        newInfo.ExpanseHeight = this.ItemCount * (this.DataGrid.RowHeight || 0);

        return newInfo;
    }

    private _forceRenderTrigger: number = 0;
}