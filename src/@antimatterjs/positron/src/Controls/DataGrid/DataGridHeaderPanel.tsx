import { Binding } from '@antimatterjs/react';
import * as React from 'react';
import { CSSClasses } from '../../CSSClasses';
import { IFrameworkElementState } from "../../FrameworkElement";
import { IPanelProps, PanelBase } from "../Panel";
import { DataGridBase } from "./DataGrid";
import { DataGridCell } from './DataGridCell';
import { DataGridHeaderCell } from './DataGridHeaderCell';

export interface IDataGridHeaderPanelProps extends IPanelProps
{
    DataGrid?: DataGridBase,
}
export class DataGridHeaderPanel extends PanelBase<IDataGridHeaderPanelProps, IFrameworkElementState>
{
    public get DataGrid(): DataGridBase | undefined
    {
        return this.GetValue(nameof(this.DataGrid));
    }

    protected override renderElement(): JSX.Element | null
    {
        if (!this.DataGrid)
            return null;

        var headers: JSX.Element[] = [];
        let i: number = 0;
        let colidx: number = 0;
        for (let col of this.DataGrid.Columns)
        {
            colidx++;            
            headers.push(
                <DataGridHeaderCell
                    key={colidx.toString()}
                    ClassName={(col.IsFrozen && i == 0 ? CSSClasses.DataGridCellFrozenFirst
                        : col.IsFrozen && i == this.DataGrid.Columns.length - 1 ? DataGridCell.STATE_FrozenLast
                                : "")}
                    DataGrid={this.DataGrid}
                    Style={this.DataGrid.HeaderCellStyle}
                    Column={col}
                    SortDescending={
                        this.DataGrid.SortColumnKey === col.Key
                            ? this.DataGrid.SortDescending
                            : undefined}
                    ColumnIndex={colidx - 1}
                    Grid={{ Column: (col.IsFrozen && i == this.DataGrid.Columns.length - 1 ? ++i : i++) }} />);
        }

        return (<>{headers}</>);
    }

    override getCSSStyles(): React.CSSProperties
    {
        var styles = super.getCSSStyles();
        styles.display = "grid";
        styles.gridTemplateColumns = "var(--DataGridColumns)";
        styles.overflow = "visible";
        styles.minWidth = "fit-content";
        return styles;
    }
}
