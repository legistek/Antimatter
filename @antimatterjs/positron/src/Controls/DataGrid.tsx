import * as React from 'react';
import * as Fluent from '@fluentui/react';
import { TemplateProp, WebStyle } from '../Style';
import { Control, IControlProps, IControlState } from './Control';
import { CheckBox } from './CheckBox';
import { IItemsControlProps, IItemsControlState, ItemsControl, ItemsControlBase } from './ItemsControl';
import { ContentPresenter, IContentPresenterProps, IContentPresenterState } from './ContentPresenter';
import { Antimatter, Binding, BindingMode, ModelObjectReference, Utilities } from '@antimatterjs/react';
import { HorizontalAlignment, SelectionMode, VerticalAlignment } from '../Enums';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { FontStyle, SemanticColor, Theme, ThemeColor, ThemeLayout } from '../Theme';
import { BoundCollection } from '@antimatterjs/react/src/BoundCollection';

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
    HeaderBackground?: string | ThemeColor | SemanticColor,
    HeaderBorderBrush?: string | ThemeColor | SemanticColor,
    HeaderBorderThickness?: string | ThemeLayout,
    CanSelect?: boolean | Binding,
    IsSelectAll?: boolean | Binding,
    SelectedItems?: any[] | Binding,
    SelectedItem?: any | Binding,
    AllCapsHeader?: boolean,
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
    private _selection: Fluent.Selection;
    private _suspendModelNotifySelectionChanged: boolean = false;

    public static DefaultBindings = {
        SelectedItems: {
            Mode: BindingMode.TwoWay,
            NotifyCollectionChanged: true
        },
        SelectedItem: {
            Mode: BindingMode.TwoWay,
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
                onSelectionChanged: this.OnSelectionChanged.bind(this),
                getKey: item => Utilities.SmartGetKey(item)
            });
    }

    public get HeaderBackground(): string | undefined
    {
        return this.GetValue(nameof(this.props.HeaderBackground));
    }

    public get HeaderBorderBrush(): string | undefined
    {
        return this.GetValue(nameof(this.props.HeaderBorderBrush));
    }

    public get SelectedItem(): any
    {
        return this.GetValue(nameof(this.props.SelectedItem));
    }

    public get HeaderBorderThickness(): string | undefined
    {
        return this.GetValue(nameof(this.props.HeaderBorderThickness));
    }

    public get AllCapsHeader(): boolean
    {
        return this.GetValue(nameof(this.props.AllCapsHeader), false);
    }

    private _selectedItems: any[] = [];
    public get SelectedItems(): any[]
    {
        return this.GetValue(nameof(this.props.SelectedItems), this._selectedItems);
    }

    override OnPropertyChanged(prop: string, value: any, oldValue: any)
    {
        if (prop === nameof(this.state.SelectedItems))
        {
            if (oldValue?.IsBoundCollection)
                (oldValue as BoundCollection<any>).CollectionChanged.unsubscribe(this.Callback(this.OnSelectedItemsCollectionChanged));

            if (value?.IsBoundCollection)
                (value as BoundCollection<any>).CollectionChanged.subscribe(this.Callback(this.OnSelectedItemsCollectionChanged));
            this.OnSelectedItemsCollectionChanged(this);
        }
        else if (prop === nameof(this.props.SelectedItem))
        {
            this._suspendModelNotifySelectionChanged = true;
            try
            {
                this._selection.setAllSelected(false);
                this._selection.setKeySelected(this.SelectedItem, true, false);
            }
            finally
            {
                this._suspendModelNotifySelectionChanged = false;
            }
            this.InvalidateRender();
        }

        super.OnPropertyChanged(prop, value, oldValue);
    }

    protected override OnItemsSourceCollectionChanged(sender: any, e: void)
    {
        super.OnItemsSourceCollectionChanged(sender);
        this._selection?.setItems(this.ItemsSource, false);
        this.OnSelectedItemsCollectionChanged(this);
        this.OnSelectionChanged();
    }

    protected OnSelectedItemsCollectionChanged(sender: any, e: void)
    {
        this._suspendModelNotifySelectionChanged = true;

        try
        {
            this._selection.setAllSelected(false);
            if (this.SelectedItems && this.SelectedItems.length > 0)
            {
                for (var item of this.SelectedItems)
                    this._selection.setKeySelected(Utilities.SmartGetKey(item), true, false);
            }
        }
        finally
        {
            this._suspendModelNotifySelectionChanged = false;
        }

        this.InvalidateRender();
    }

    private OnSelectionChanged()
    {
        if (this._suspendModelNotifySelectionChanged)
            return;

        const isAll = this._selection?.isAllSelected();
        if (isAll !== this.state.IsSelectAll)
            this.SetValue(nameof(this.state.IsSelectAll), this._selection?.isAllSelected(), false);
        if (isAll)
            return;

        var sel = this._selection?.getSelection();
        if (sel)
            this.SelectedItems.splice(0, this.SelectedItems.length, ...sel);

        this.SetValue(nameof(this.props.SelectedItem), this.SelectedItems[0], false, false);        
    }

    public static DefaultStyle: WebStyle<IDataGridProps> = new WebStyle<IDataGridProps>(
        {
            Background: SemanticColor.ListBackground,
            HeaderBackground: SemanticColor.BodyStandoutBackground,
            //HeaderBorderBrush: SemanticColor.VariantBorder,
            HeaderBorderThickness: "0px",
            AllCapsHeader: true,
            BorderBrush: SemanticColor.VariantBorder,
            BorderThickness: ThemeLayout.StandardBorder,
            Template: new ControlTemplate((templatedParent: DataGridBase<IDataGridProps, IDataGridState>) => (
                <Fluent.ScrollablePane styles={{
                    root: {
                        borderColor: templatedParent.BorderBrush,
                        borderWidth: templatedParent.BorderThickness,
                        borderStyle: "solid"
                    }
                }}>
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
                        styles={{
                            root: {
                                background: templatedParent.Background,
                            },
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
                                if (detailsHeaderProps)
                                {
                                    detailsHeaderProps.styles = {
                                        root: {
                                            background: templatedParent.HeaderBackground,                                            
                                            selectors: {
                                                ":after": {
                                                    content: "''",
                                                    pointerEvents: "none",
                                                    position: "absolute",
                                                    boxSizing: "border-box",
                                                    top: "0",
                                                    left: "0",
                                                    minWidth: "fit-content",
                                                    width: "100%",
                                                    height: "100%",
                                                    borderRadius: "0",
                                                    borderWidth: templatedParent.HeaderBorderThickness,
                                                    borderStyle: "solid",
                                                    borderColor: templatedParent.HeaderBorderBrush,
                                                }
                                            }
                                        },
                                    };
                                }
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
                                    alignSelf: "center",
                                    whiteSpace: "normal"
                                },
                                root: {
                                    height: templatedParent.state.RowHeight || 32,
                                    minHeight: 0,
                                    background: "transparent",
                                    // Draw your own grid lines here
                                    borderColor: Theme.Value(SemanticColor.BodyDivider),
                                    borderWidth: "0px 0px 1px 0px",
                                    borderStyle: "solid",
                                    width: "100%",
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
            "@ .ms-DetailsHeader-cellName": {
                fontFamily: Theme.Value(FontStyle.FontFamily),
                whiteSpace: "normal",
                lineHeight: "normal",                
                marginTop: "auto",
                marginBottom: "5px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical"
            },
            "@ .ms-DetailsHeader-cellTitle": {
                height: "100%",                
                //height: "fit-content"
            },
            "@ .ms-DetailsHeader-checkTooltip": {
                marginTop: "auto",
                marginBottom: "5px"
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
                name: this.AllCapsHeader ? col.Header?.toUpperCase() : col.Header,
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
                        Content={item} />
                )
            });
        }
        return cols;
    }
}

export class DataGrid extends DataGridBase<IDataGridProps, IDataGridState>
{
}
