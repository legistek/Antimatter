import * as React from 'react';
import { ColumnActionsMode, ConstrainMode, DetailsList, DetailsListLayoutMode, DetailsRow, getTheme, IColumn, IDetailsHeaderProps, IRenderFunction, ScrollablePane, Sticky } from '@fluentui/react';
import { Style } from '../Style';
import { Control, IControlProps, IControlState } from './Control';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { ContentPresenter, IContentPresenterProps, IContentPresenterState } from './ContentPresenter';
import { Binding } from '@antimatterjs/react';
import { CheckBox } from './CheckBox';
import { Panel } from './Panel';
import { HorizontalAlignment } from '../Enums';
import { Glyph } from './Glyph';

interface IDataGridCellCommon
{
}
export interface IDataGridCellProps extends IContentPresenterProps, IDataGridCellCommon
{
}
export interface IDataGridCellState extends IContentPresenterState, IDataGridCellCommon
{
}
export class DataGridCell<
    P extends IDataGridCellProps = {},
    S extends IDataGridCellState = {}>
    extends ContentPresenter<P, S>
{
    //public static DefaultStyle: Style<IDataGridCellProps> = new Style<IDataGridCellProps>(
    //    {
    //    },
    //    {
    //        Selector: "@",
    //        Rules: {
    //            height: "100%",
    //            display: 'flex',
    //            //borderWidth: "0px 0px 1px 0px",
    //            //borderStyle: "solid",
    //            //borderColor: "gray"
    //        }
    //    });

    /* protected override */ constructClasses(): string
    {
        return super.constructClasses() + " amx-ptn-datagridcell ";
    }
}

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
    public static theme = getTheme();

    public static DefaultStyle: Style<IDataGridProps> = new Style<IDataGridProps>(
        {
            Template: (templatedParent: DataGrid<IDataGridProps, IDataGridState>) => (
                <ScrollablePane>
                    <DetailsList
                        cellStyleProps={{
                            cellLeftPadding: 0,
                            cellRightPadding: 0,
                            cellExtraRightPadding: 0,
                        }}
                        checkboxCellClassName="hobo"
                        useReducedRowRenderer={true}
                        compact={true}
                        onRenderCheckbox={(props, defaultRender) =>
                        {
                            if (props?.checked)
                            {
                                return (
                                    <div style={{height: templatedParent.state.RowHeight || 32}}>
                                        <Glyph Icon={0xE9A4} />
                                    </div>
                                );
                            }
                            else
                            {
                                return (<></>);
                            }
                        }}
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
                            },                           
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
                                    height: templatedParent.state.RowHeight || 32,
                                    alignSelf: "center"
                                },
                                root: {
                                    height: templatedParent.state.RowHeight || 32,
                                    minHeight: 0,
                                    borderColor: DataGrid.theme.semanticColors.bodyDivider,
                                    borderWidth: "0px 0px 1px 0px",
                                    borderStyle: "solid"
                                },
                                cellMeasurer: {
                                    height: templatedParent.state.RowHeight || 32,
                                    minHeight: 0
                                },
                                cellUnpadded: {
                                    height: templatedParent.state.RowHeight || 32,
                                    minHeight: 0
                                },
                                cellPadded: {
                                    height: templatedParent.state.RowHeight || 32,
                                    minHeight: 0
                                },
                                checkCell: {
                                    height: templatedParent.state.RowHeight || 32,
                                    minHeight: 0
                                },
                                check: {
                                    height: templatedParent.state.RowHeight || 32,
                                    minHeight: 0
                                },
                                checkCover: {
                                    height: templatedParent.state.RowHeight || 32,
                                    minHeight: 0
                                },
                            };
                            return defaultRender ? defaultRender(props) : (<></>);
                        }}
                        constrainMode={ConstrainMode.unconstrained}
                        layoutMode={DetailsListLayoutMode.justified}
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
                        Style={this.state.ItemContainerStyle}
                        ContentTemplate={(column?.data as IDataGridColumn)?.Template}
                        Content={item}/>
                )
            });
        }
        return cols;
    }
}
