import * as React from 'react';
import { Binding } from '@antimatterjs/react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { Style } from '../Style';
import { Control, IControlProps, IControlState } from './Control';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { DetailsList, IColumn } from '@fluentui/react';

interface IDataGridCommon
{
    Columns?: IDataGridColumn[]
}
export interface IDataGridProps extends IItemsControlProps, IDataGridCommon
{   
}
export interface IDataGridState extends IItemsControlState, IDataGridCommon
{
}

export interface IDataGridColumn
{
    Template: (item: any) => JSX.Element;    
    Header: string;
    Key: string;

    EditTemplate?: (item: any) => JSX.Element;
    Data?: any;
}

export class DataGrid<
    P extends IDataGridProps = {},
    S extends IDataGridState = {}>
    extends ItemsControl<P, S>
{
    public static DefaultStyle: Style<IDataGridProps> = new Style<IDataGridProps>(
        {
            Template: (templatedParent: DataGrid<IDataGridProps, IDataGridState>) => (
                <DetailsList
                    items={templatedParent.state.ItemsSource || []}
                    columns={templatedParent.ConstructColumns()}/>
            )
        }
    );

    /* private */ ConstructColumns(): IColumn[]
    {
        if (!this.state.Columns || this.state.Columns.length === 0)
            return [];
        let cols: IColumn[] = [];
        for (const col of this.state.Columns as IDataGridColumn[])
        {
            cols.push({
                name: col.Header,
                key: col.Key,
                minWidth: 100,
                data: col,
                onRender: (item, index, column) =>
                (
                    <DataGridCell
                        Item={item}
                        Column={column?.data as IDataGridColumn}/>
                )
            });
        }
        return cols;
    }
}

interface IDataGridCellCommon
{
    Item?: any;
    Column?: IDataGridColumn;
}
interface IDataGridCellProps extends IControlProps, IDataGridCellCommon
{
}
interface IDataGridCellState extends IControlState, IDataGridCellCommon
{
}
class DataGridCell<
    P extends IDataGridCellProps = {},
    S extends IDataGridCellState = {}>
    extends Control<P, S>
{

}