import * as React from 'react';
import { ColumnActionsMode, ConstrainMode, DetailsList, DetailsListLayoutMode, IColumn, IDetailsHeaderProps, IRenderFunction, ScrollablePane, Sticky } from '@fluentui/react';
import { Style } from '../Style';
import { Control, IControlProps, IControlState } from './Control';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { ContentPresenter } from './ContentPresenter';

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
                <ScrollablePane>
                    <DetailsList
                        onRenderDetailsHeader={
                            // tslint:disable-next-line:jsx-no-lambda
                            (detailsHeaderProps?: IDetailsHeaderProps, defaultRender?: IRenderFunction<IDetailsHeaderProps>) => (
                                <Sticky>
                                    {defaultRender ? defaultRender(detailsHeaderProps) : (<></>)}
                                </Sticky>
                            )}
                        constrainMode={ConstrainMode.unconstrained}
                        layoutMode={DetailsListLayoutMode.fixedColumns}
                        items={templatedParent.state.ItemsSource || []}
                        columns={templatedParent.ConstructColumns()} />
                </ScrollablePane>
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
                minWidth: 50,
                maxWidth: 300,
                calculatedWidth: 75,
                currentWidth: 50,
                data: col,
                isResizable: true,
                columnActionsMode: ColumnActionsMode.clickable,
                isPadded: true,
                onColumnResize: (width) =>
                {

                },
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
    public static DefaultStyle: Style<IDataGridCellProps> = new Style<IDataGridCellProps>(
        {
            Template: (templatedParent: DataGridCell<IDataGridCellProps, IDataGridCellState>) =>
            (<ContentPresenter
                Content={templatedParent.state.Item}
                ContentTemplate={templatedParent.state.Column?.Template} />)
        });
}