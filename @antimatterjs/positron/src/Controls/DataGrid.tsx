import * as React from 'react';
import { ColumnActionsMode, ConstrainMode, DetailsList, DetailsListLayoutMode, DetailsRow, IColumn, IDetailsHeaderProps, IRenderFunction, ScrollablePane, Sticky } from '@fluentui/react';
import { Style } from '../Style';
import { Control, IControlProps, IControlState } from './Control';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { ContentPresenter, IContentPresenterProps, IContentPresenterState } from './ContentPresenter';
import { Binding } from '@antimatterjs/react';

interface IDataGridCommon
{
    Columns?: IDataGridColumn[]
}
export interface IDataGridProps extends IItemsControlProps, IDataGridCommon
{
    RowHeight?: number | Binding
}
export interface IDataGridState extends IItemsControlState, IDataGridCommon
{
    RowHeight?: number
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
                        cellStyleProps={{
                            cellLeftPadding: 0,
                            cellRightPadding: 0,
                            cellExtraRightPadding: 0
                        }}                        
                        useReducedRowRenderer={true}
                        compact={true}
                        onRenderDetailsHeader={
                            // tslint:disable-next-line:jsx-no-lambda
                            (detailsHeaderProps?: IDetailsHeaderProps, defaultRender?: IRenderFunction<IDetailsHeaderProps>) => (
                                <Sticky>
                                    {defaultRender ? defaultRender(detailsHeaderProps) : (<></>)}
                                </Sticky>
                            )}
                        styles={{
                            root: {
                                minHeight: 0
                            }
                        }}
                        onRenderRow={(props, defaultRender) =>
                        {
                            if (!props)
                                return null;
                            props.styles = {
                                cell: {
                                    paddingTop: 0,
                                    paddingBottom: 0,
                                    minHeight: 0,
                                    height: 32,
                                    alignSelf: "center"
                                },
                                root: {
                                    height: templatedParent.state.RowHeight || 32,
                                    minHeight: 0,
                                },
                                cellMeasurer: {
                                    height: "auto",
                                    minHeight: 0
                                },
                                cellUnpadded: {
                                    height: "auto",
                                    minHeight: 0
                                },
                                cellPadded: {
                                    height: "auto",
                                    minHeight: 0
                                },
                                checkCell: {
                                    height: "auto",
                                    minHeight: 0
                                },                                                               
                            };
                            return defaultRender ? defaultRender(props) : (<></>);
                        }}
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
                        ContentTemplate={(column?.data as IDataGridColumn)?.Template}
                        Content={item}/>
                )
            });
        }
        return cols;
    }
}

interface IDataGridCellCommon
{    
}
interface IDataGridCellProps extends IContentPresenterProps, IDataGridCellCommon
{
}
interface IDataGridCellState extends IContentPresenterState, IDataGridCellCommon
{
}
class DataGridCell<
    P extends IDataGridCellProps = {},
    S extends IDataGridCellState = {}>
    extends ContentPresenter<P, S>
{
    public static DefaultStyle: Style<IDataGridCellProps> = new Style<IDataGridCellProps>(
        {
        },
        {
            Selector: "@",
            Rules: {
                height: "100%"
            }
        });
}