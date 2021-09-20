import * as React from 'react';
import * as Fluent from '@fluentui/react';
import { WebStyle } from '../Style';
import { Control, IControlProps, IControlState } from './Control';
import { CheckBox } from './CheckBox';
import { IItemsControlProps, IItemsControlState, ItemsControl, ItemsControlBase } from './ItemsControl';
import { ContentPresenter, IContentPresenterProps, IContentPresenterState } from './ContentPresenter';
import { Antimatter, Binding, BindingMode, ModelObjectReference } from '@antimatterjs/react';
import { HorizontalAlignment, SelectionMode, VerticalAlignment } from '../Enums';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { FontStyle, SemanticColor, Theme } from '../Theme';

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
    //        "@": {
    //            height: "100%",
    //            display: 'flex',
    //            //borderWidth: "0px 0px 1px 0px",
    //            //borderStyle: "solid",
    //            //borderColor: "gray"
    //        }
    //    });

    protected /* override */ constructClasses(): string
    {
        return super.constructClasses() + " amx-ptn-datagridcell ";
    }
}

interface IDataGridCommon
{
    Columns?: IDataGridColumn[],
    SelectionMode?: SelectionMode,
}
export interface IDataGridProps extends IItemsControlProps, IDataGridCommon
{
    RowHeight?: number | Binding,    
    CanSelect?: boolean | Binding,
    IsSelectAll?: boolean | Binding,
    SelectedItems?: any[] | Binding,
}
export interface IDataGridState extends IItemsControlState, IDataGridCommon
{
    RowHeight?: number,
    CanSelect?: boolean,
    IsSelectAll?: boolean,
    SelectedItems?: any[],
}

export interface IDataGridColumn
{
    Template: DataTemplate;
    Header: string;
    Key: string;
    Width?: number,
    CanResize?: boolean,
    EditTemplate?: DataTemplate;
    Data?: any;
}

export class DataGridBase<
    P extends IDataGridProps = {},
    S extends IDataGridState = {}>
    extends ItemsControlBase<P, S>
{
    /* private */ _selection: Fluent.Selection;

    public static DefaultBindings = {
        SelectedItems: {
            Mode: BindingMode.TwoWay
        },
        IsSelectAll: {
            Mode: BindingMode.TwoWay
        },
        ItemsSource: {
            NotifyCollectionChanged: true
        }
    };

    constructor(props)
    {
        super(props);
        this._selection = new Fluent.Selection(
            {
                onSelectionChanged: this.OnSelectionChanged.bind(this)
            });
    }

    private _selectedItems: any[] = [];
    public get SelectedItems(): any[]
    {
        return this.GetValue(nameof(this.props.SelectedItems), this._selectedItems);
    }

    /* private */ OnSelectionChanged()
    {
        const isAll = this._selection.isAllSelected();
        if (isAll !== this.state.IsSelectAll)
            this.SetValue(nameof(this.state.IsSelectAll), this._selection.isAllSelected(), false);
        if (isAll)
            return;

        var sel = this._selection.getSelection();

        this.SelectedItems.splice(0, this.SelectedItems.length, ...sel);

        // this.SetValue(nameof(this.state.SelectedItems), sel, false);
    }
    
    public static DefaultStyle: WebStyle<IDataGridProps> = new WebStyle<IDataGridProps>(
        {
            Template: new ControlTemplate((templatedParent: DataGridBase<IDataGridProps, IDataGridState>) =>(
                <Fluent.ScrollablePane>
                    <Fluent.DetailsList
                        cellStyleProps={{
                            cellLeftPadding: 0,
                            cellRightPadding: 0,
                            cellExtraRightPadding: 0,                            
                        }}                        
                        onRenderCheckbox={(props, defaultRender) =>
                        {
                            return (
                                <CheckBox
                                    VerticalAlignment={VerticalAlignment.Center}
                                    HorizontalAlignment={HorizontalAlignment.Center}
                                    IsHitTestVisible={false} IsChecked={props?.checked} />);
                        }}
                        selectionPreservedOnEmptyClick={false}
                        selection={templatedParent._selection}
                        selectionMode={
                            templatedParent.state.CanSelect === false ? Fluent.SelectionMode.none :
                                (templatedParent.state.SelectionMode === SelectionMode.Single
                                ? Fluent.SelectionMode.single
                                : Fluent.SelectionMode.multiple)}
                        useReducedRowRenderer={true}
                        compact={true}
                        onRenderDetailsHeader={
                            // tslint:disable-next-line:jsx-no-lambda
                            (detailsHeaderProps?: Fluent.IDetailsHeaderProps, defaultRender?: Fluent.IRenderFunction<Fluent.IDetailsHeaderProps>) =>
                            {
                                return (
                                    <Fluent.Sticky>
                                        {defaultRender ? defaultRender(detailsHeaderProps) : (<></>)}
                                    </Fluent.Sticky>
                                );
                            }}
                        getKey={item => item?.IsModelObjectReference ? (item as ModelObjectReference).Handle : item?.toString()}
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
                                    // Draw your own grid lines here
                                    borderColor: Theme.Value(SemanticColor.BodyDivider),
                                    borderWidth: "0px 0px 1px 0px",
                                    borderStyle: "solid",
                                    width: "100%"
                                },
                                checkCell: {
                                    height: templatedParent.state.RowHeight || 32,
                                    minHeight: 0
                                },                                
                            };
                            return defaultRender ? defaultRender(props) : (<></>);
                        }}
                        constrainMode={Fluent.ConstrainMode.unconstrained}
                        layoutMode={Fluent.DetailsListLayoutMode.fixedColumns}
                        items={templatedParent.state.ItemsSource || []}
                        columns={templatedParent.ConstructColumns()} />
                </Fluent.ScrollablePane>
            ))
        },
        {
            "@ .ms-DetailsHeader-cell": {
                fontFamily: Theme.Value(FontStyle.FontFamily)
            }
        }
    );

    /* private */ ConstructColumns(): Fluent.IColumn[]
    {
        if (!this.state.Columns || this.state.Columns.length === 0)
            return [];
        let cols: Fluent.IColumn[] = [];
        for (const col of this.state.Columns as IDataGridColumn[])
        {
            cols.push({
                name: col.Header,
                key: col.Key,
                minWidth: 25,
                maxWidth: 300,
                calculatedWidth: col.Width,
                currentWidth: col.Width,
                data: col,
                isResizable: col.CanResize === undefined ? true : col.CanResize,
                columnActionsMode: col.CanResize !== false ? Fluent.ColumnActionsMode.clickable : Fluent.ColumnActionsMode.disabled,
                isPadded: false,
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

export class DataGrid extends DataGridBase<IDataGridProps, IDataGridState>
{
}
