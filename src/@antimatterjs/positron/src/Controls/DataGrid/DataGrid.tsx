import * as React from 'react';
import { Antimatter, Binding, BindingMode, BindingParameters, ModelObjectReference, ModelValueType, RelativeSourceMode, Span } from '@antimatterjs/react';
import { ScrollBarVisibility, SelectionMode } from '../../Enums';
import { FrameworkElement, IFrameworkElementState } from "../../FrameworkElement";
import { DataTemplate } from '../../FrameworkTemplate';
import { Style, WebStyle } from "../../Style";
import { FontStyle, SemanticColor, Theme, ThemeColor, ThemeLayout } from '../../Theme';
import { ISelectorProps, SelectorBase } from "../Primitives/Selector";
import { DataGridRow, DataGridRowBase, IDataGridRowProps } from './DataGridRow';
import { IDataGridHeaderCellProps } from './DataGridHeaderCell';
import { DataGridCell, IDataGridCellProps } from './DataGridCell';
import { IPanelProps } from '../Panel';
import { DataGridRowsPresenter, IDataGridRowsPresenterProps } from './DataGridRowsPresenter';
import { DropAcceptance } from '../DragPanel';
import { ICollectionUpdate, NotifyCollectionChangedAction } from '@antimatterjs/react/src/ICollectionUpdate';
import { CommandRef } from '../ContextMenu';
import { ItemsStackPanel, IItemsStackPanelProps } from '../ItemsStackPanel';
import { DataGridHeaderPanel } from './DataGridHeaderPanel';
import { CSSClasses } from '../../CSSClasses';

export enum GridLinesVisibility
{
    None,
    Vertical = 1,
    Horizontal = 2,
    Both = 3,
}

export interface IDataGridColumn
{
    Key: string;
    Header?: string;
    Width?: number;
    MinWidth?: number;
    BindingPath?: string;
    Type?: ModelValueType;
    CanResize?: boolean;
    IsFrozen?: boolean;
    IsSelector?: boolean;
    IsColorIndicator?: boolean;
    CanSort?: boolean;
    Template?: DataTemplate;
    EditTemplate?: DataTemplate;

    /** The Model-value path (on the item bound to each row) indicating whether
 * a particular cell in a particular row can be edited. */
    CanEditPath?: string;
}

export interface IDataGridProps extends ISelectorProps
{
    HasHeaders?: boolean;
    HeaderPanelStyle?: Style<IPanelProps>;
    HeaderCellStyle?: Style<IDataGridHeaderCellProps>;
    CellStyle?: Style<IDataGridHeaderCellProps>;
    RowStyle?: Style<IDataGridRowProps>;
    RowHeight?: number | Binding;
    MinRowHeight?: number | Binding;
    CondensedRowHeight?: number | Binding;
    MaxHeight?: number|string;
    FirstVisibleItem?: any | Binding;
    VirtualizationGroupSize?: number;

    CanDragRows?: boolean | Binding;
    RowDropContent?: BindingParameters;
    RowDropCommands?: BindingParameters;
    RowDropPosition?: BindingParameters;
    RowDropTemplate?: DataTemplate;
    RowDropAcceptance?: DropAcceptance | Binding;
    RowContextMenu?: BindingParameters | Binding | ModelObjectReference[] | (() => JSX.Element),

    RowDragTemplate?: DataTemplate;
    GridLines?: GridLinesVisibility | Binding;
    GridLinesBrush?: string | Binding | SemanticColor;

    /** The key for the IDataGridColumn which is the current sort
     * column. A bang (!) preceding the key indicates a descending
     * (rather than ascending) sort order. */
    SortColumn?: string | Binding;

    EditMode?: boolean | Binding;

    /** The column definitions for the DataGrid. If binding, uses the
     * MarshalValue option by default; a converter is also required to convert
     * model-side column data to an IDataGridColumn if it is not already in
     * that format, and to populate Template and optionally EditTemplate.
     * Note that even if a TwoWay BindingMode is used, column size will not be
     * reported to the model via this property; instead the model should handle
     * resizing notifications with ColumnResizeCommand. */
    Columns?: IDataGridColumn[] | Binding;

    /** Invoked when a manual column resize has been completed. The command
     * parameter is a two-item array consisting of the column key
     * followed by the new column width. If Columns is a Binding, there is
     * no need for the Model to update the Columns source value in response
     * to this command, however, it should update its own column width data
     * for any time the DataGrid needs to re-render and retrieve the Columns. */
    ColumnResizeCommand?: ModelObjectReference | Binding;

    NotifyScrollChange?: boolean | Binding;

    CondensedItemTemplate?: DataTemplate | Binding;
    IsCondensedMode?: boolean | Binding;
}

export class DataGridBase<P extends IDataGridProps = {}, S extends IFrameworkElementState = {}>
    extends SelectorBase<P, S>
{
    private static _nextDGID: number = 0;
    private _headerVersion: number = 0;
    private _currentRowSpan?: Span;

    public readonly DGID: number;

    public static readonly DefaultColumnWidth: number = 300;
    public static readonly VAR_FontSize = Antimatter.Identifier("--DataGridFontSize", true, true);
    public static readonly VAR_FontFamily = Antimatter.Identifier("--DataGridFontFamily", true, true);

    public NowEditingCell: DataGridCell | undefined;

    constructor(props)
    {
        super(props);
        this.DGID = DataGridBase._nextDGID++;
    }

    public static DefaultBindings = {
        Columns: {
            MarshalValue: true,
        },
        SortColumn: {
            Mode: BindingMode.TwoWay
        },
        SelectedItems: {
            Mode: BindingMode.TwoWay,
            NotifyCollectionChanged: true
        },
        SelectedItem: {
            Mode: BindingMode.TwoWay,
            ValidatesOnDataErrors: true
        },
        IsSelectAll: {
            Mode: BindingMode.TwoWay
        },
        ItemsSource: {
            FallbackValue: [],
            NotifyCollectionChanged: true
        },
        FirstVisibleItem: {
            Mode: BindingMode.TwoWay
        },
        SelectedIndex: {
            Mode: BindingMode.TwoWay
        },
    };

    public static DefaultCellStyleNoHover = new WebStyle<IDataGridCellProps>(
        {
            Padding: ThemeLayout.MarginStandard,
        },
        {
            "@": {
                "userSelect": "none",
            },

            [`@.${DataGridCell.STATE_Selector}`]: {
                cursor: "pointer"
            },
            ".dg-edit-mode @.dgcell-can-edit":
            {
                background: Theme.Value(ThemeColor.ThemeLighter),
                cursor: "pointer"
            },
            ".dg-edit-mode @.dgcell-read-only:hover":
            {
                background: "transparent"
            },
            ".dg-edit-mode @.dgcell-is-editing":
            {
                //padding: "0 !important"
                borderColor: Theme.Value(SemanticColor.FocusBorder),
                borderWidth: "1px",
                borderStyle: "solid"
            }
        });

    public static DefaultCellStyle = new WebStyle<IDataGridCellProps>(
        {
        },
        {
            "@:hover": {
                background: Theme.Value(SemanticColor.ListItemBackgroundHovered)
            },
            ".selected @:hover": {
                background: "transparent"
            }
        },
        DataGridBase.DefaultCellStyleNoHover
    )

    public static DefaultStyle: WebStyle<IDataGridProps> = new WebStyle<IDataGridProps>(
        {
            CanSelect: true,
            HasHeaders: true,
            RowHeight: 45,
            SelectionMode: SelectionMode.Extended,
            GridLines: GridLinesVisibility.Horizontal,
            GridLinesBrush: SemanticColor.VariantBorder,
            ItemsPanel: DataGridRowsPresenter,
            ItemAsDataContext: true,
            VirtualizationGroupSize: 25,
            FontFamily: FontStyle.FontFamily,
            FontSize: FontStyle.Medium,
            ItemTemplate: (item) => <></>,  // Necessary for now as ItemsControl won't paint anything if this is undefined
            CellStyle: DataGridBase.DefaultCellStyle,
            ItemsPanelStyle: DataGridRowsPresenter.DefaultStyle,
            HeaderPanelStyle: new WebStyle<IPanelProps>(
                {
                    Background: SemanticColor.BodyBackground,
                    BorderThickness: ThemeLayout.StandardBorderB,
                    BorderBrush: SemanticColor.InputBorder
                },
                {
                }),
        },
        {
        });

    private static VariableHeightRowsPresenterStyle = new WebStyle<IItemsStackPanelProps>(
        {
            VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
            HorizontalScrollBarVisibility: ScrollBarVisibility.Auto,
            AutoScrollForDrag: true
        },
        {
            "@ .header-row": {
                position: "sticky",
                zIndex: 134,
                top: "0px",
                overflow: "visible"
            },
            [`@ .${ItemsStackPanel.PART_GroupPanels}`]: {
                overflow: "visible",     // necessary for pinning frozen columns
                minWidth: "fit-content"
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

    public static VariableRowHeightStyle: WebStyle<IDataGridProps> = new WebStyle<IDataGridProps>(
        {
            //ItemsPanel: DataGridVariableHeightRowsPresenter,
            ItemsPanelStyle: DataGridBase.VariableHeightRowsPresenterStyle,
            RowHeight: 0,
            Template: (templatedParent: DataGridBase) =>
                <ItemsStackPanel
                    ItemsParent={templatedParent}
                    Style={templatedParent.ItemsPanelStyle}       
                    RealizationDelay={25}
                    VirtualizingPlaceholderHeight={templatedParent.VirtualizingPlaceholderHeight}
                    VirtualizationGroupSize={templatedParent.VirtualizationGroupSize}
                    HeaderTemplate={() =>
                        <DataGridHeaderPanel
                            RenderVersion={templatedParent._headerVersion}
                            ClassName="header-row"
                            Style={templatedParent.HeaderPanelStyle}
                            DataGrid={templatedParent} />}
                />
        },
        {
        },
        DataGridBase.DefaultStyle);

    public get CondensedItemTemplate(): DataTemplate | undefined
    {
        return this.GetValue(nameof(this.props.CondensedItemTemplate));
    }

    public get RowContextMenu(): BindingParameters | Binding | ModelObjectReference[] | (() => JSX.Element) | undefined
    {
        return this.GetValue(nameof(this.props.RowContextMenu));
    }

    public get IsCondensedMode(): boolean
    {
        return this.GetValue(nameof(this.props.IsCondensedMode));
    }

    public get NotifyScrollChange(): boolean
    {
        return this.GetValue(nameof(this.props.NotifyScrollChange), false);
    }

    protected override GetContainerForItemOverride(): typeof FrameworkElement
    {
        return DataGridRowBase;
    }

    private _emptyColumns: IDataGridColumn[] = [];
    private _effectiveColumns: IDataGridColumn[] = [];
    public get Columns(): IDataGridColumn[]
    {
        if (!this.IsCondensedMode)
            return this.ActualColumns;
        if (this._effectiveColumns.length > 0)
            return this._effectiveColumns;

        var actualColumns = this.ActualColumns;
        let mainColumn: IDataGridColumn|undefined = undefined;
        for (var col of actualColumns)
        {
            if (col.IsFrozen)
                this._effectiveColumns.push(col);
            else if (!mainColumn)
            {
                mainColumn = {
                    Key: "condensed",
                    Header: "Placeholder",
                    Template: this.CondensedItemTemplate,
                    Width: Number.POSITIVE_INFINITY,
                    CanSort: col.CanSort,
                };
                this._effectiveColumns.push(mainColumn);
            }
            else
            {
                mainColumn.CanSort ||= col.CanSort;
            }
        }

        return this._effectiveColumns;
    }

    public get ActualColumns(): IDataGridColumn[]
    {
        return this.GetValue(nameof(this.props.Columns), this._emptyColumns);
    }

    public get RowDropCommands(): BindingParameters|undefined
    {
        return this.GetValue(nameof(this.props.RowDropCommands));
    }

    public get RowDropPosition(): BindingParameters | undefined
    {
        return this.GetValue(nameof(this.props.RowDropPosition));
    }

    public get RowDropContent(): BindingParameters|undefined
    {
        return this.GetValue(nameof(this.props.RowDropContent));
    }

    public get RowDropTemplate(): DataTemplate | undefined
    {
        return this.GetValue(nameof(this.props.RowDropTemplate));
    }

    public get CanDragRows(): boolean
    {
        return this.GetValue(nameof(this.props.CanDragRows), false);
    }

    public get RowDropAcceptance(): DropAcceptance
    {
        return this.GetValue(nameof(this.props.RowDropAcceptance), DropAcceptance.None);
    }

    public get RowDragTemplate(): DataTemplate | undefined
    {
        return this.GetValue(nameof(this.props.RowDragTemplate));
    }

    public get HasHeaders(): boolean
    {
        return this.GetValue(nameof(this.props.HasHeaders), false);
    }

    public get MaxHeight(): number | string | undefined
    {
        return this.GetValue(nameof(this.props.MaxHeight));
    }

    public get SortColumn(): string | undefined
    {
        return this.GetValue(nameof(this.props.SortColumn));
    }

    public get SortColumnKey(): string | undefined
    {
        var sc = this.SortColumn;
        if (!sc)
            return undefined;
        if (sc.startsWith("!"))
            return sc.substring(1);
        return sc;
    }

    public get SortDescending(): boolean
    {
        if (!this.SortColumn)
            return false;
        return this.SortColumn.startsWith("!");
    }

    public get ColumnResizeCommand(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.ColumnResizeCommand));
    }

    public get EditMode(): boolean
    {
        return this.GetValue(nameof(this.props.EditMode), false);
    }

    public override get CanSelect(): boolean
    {
        return this.EditMode ? false : super.CanSelect;
    }

    public GetCondensedSortMenu(): CommandRef[]
    {
        let cmds: CommandRef[] = [];
        let i = -1;
        for (var col of this.ActualColumns)
        {
            i++;
            if (!col.CanSort)
                continue;
            cmds.push({
                Label: col.Header || '',
                Key: col.Key,
                Action: (cmd) =>
                {
                    this.SetSorting(cmd.Data, cmd.Key === this.SortColumnKey ? !this.SortDescending : false);
                },
                Data: i,
            });
        }
        return cmds;
    }

    public SetSorting(index: number | undefined, descending: boolean)
    {
        var col = (index !== undefined) ? this.ActualColumns[index] : undefined;
        if (col)
            this.SetValue(
                nameof(this.props.SortColumn),
                descending ? '!' + col?.Key : col?.Key,
                descending,
                false);
        this._headerVersion++;
        this.ItemsPanelInstance?.InvalidateRender();
    }

    public get HeaderPanelStyle(): Style<IPanelProps>|undefined
    {
        return this.GetValue(nameof(this.props.HeaderPanelStyle));
    }

    public get HeaderCellStyle(): Style<IDataGridHeaderCellProps>|undefined
    {
        return this.GetValue(nameof(this.props.HeaderCellStyle));
    }

    public get RowStyle(): Style<IDataGridRowProps> | undefined
    {
        return this.GetValue(nameof(this.props.RowStyle));
    }

    public get CellStyle(): Style<IDataGridCellProps> | undefined
    {
        return this.GetValue(nameof(this.props.CellStyle));
    }

    public get GridLinesBrush(): string | undefined
    {
        return this.GetValue(nameof(this.GridLinesBrush));
    }

    public get VirtualizationGroupSize(): number
    {
        return this.GetValue(nameof(this.VirtualizationGroupSize), 1);
    }

    public get RowHeight(): number|undefined
    {
        return this.GetValue(nameof(this.RowHeight), undefined);
    }

    public get MinRowHeight(): number | undefined
    {
        return this.GetValue(nameof(this.MinRowHeight), undefined);
    }

    public get CondensedRowHeight(): number
    {
        return this.GetValue(nameof(this.CondensedRowHeight), 45);
    }

    public get GridLines(): GridLinesVisibility
    {
        return this.GetValue(nameof(this.GridLines), GridLinesVisibility.Horizontal);
    }

    public ResizeColumn(index: number, width: number, notifyModel: boolean)
    {
        if (!this.Container)
            return;
        var col = this.ActualColumns[index];
        if (!col || !col.CanResize)
            return;

        col.Width = width;

        this.Container.style.setProperty("--DataGridColumns", this.ConstructGridColumns());

        if (notifyModel && this.ColumnResizeCommand)
            this.ExecuteCommand(this.ColumnResizeCommand, [col.Key, width]);
    }

    public override async OnBoundPropertyUpdate(prop: string, value: any, oldValue: any)
    {
        if (prop === nameof(this.props.SortColumn) ||
            prop === nameof(this.props.CanDragRows) ||
            prop === nameof(this.props.Columns))
        {
            this._headerVersion++;
            this.ItemsPanelInstance?.InvalidateRender();
        }
        else if (prop === nameof(this.props.IsCondensedMode) ||
            prop === nameof(this.props.Columns))
        {
            this._effectiveColumns = [];
            this.InvalidateRender(true);
        }
        else if ((prop == nameof(this.props.EditMode)) && !!this.NowEditingCell)
        {
            this.NowEditingCell.EndEditing();
        }
        super.OnBoundPropertyUpdate(prop, value, oldValue);
    }

    public get FirstVisibleItem(): any
    {
        return this.GetValue(nameof(this.props.FirstVisibleItem));
    }

    public get FrozenFirstColumn(): IDataGridColumn | undefined
    {
        var col = this.ActualColumns[0];
        if (!col || !col.IsFrozen)
            return undefined;
        return col;
    }

    public get FrozenLastColumn(): IDataGridColumn | undefined
    {
        var col = this.ActualColumns[this.ActualColumns.length - 1];
        if (!col || !col.IsFrozen)
            return undefined;
        return col;
    }

    public TryGetCell(columnIndex: number, rowIndex: number): DataGridCell | undefined
    {
        var row = this.TryGetItemContainer(rowIndex) as DataGridRow;
        if (!row)
            return undefined;
        return row.Cells[columnIndex];
    }

    protected override OnItemsRenderedOverride(items: Span)
    {
        this._currentRowSpan = items;
    }

    public /*virtual*/ OnScrollChange(scrollTop: number, delta: number, viewportHeight: number, extentHeight: number): void
    {
        var rows = this.ItemsPanelInstance as DataGridRowsPresenter;
        if (!(rows instanceof DataGridRowsPresenter) || !rows.Container )
            return;

        var info = rows.ComputeRenderWindow(
            rows.Container.scrollTop,
            rows.Container.scrollTop + rows.Container.clientHeight
        );

        var middle = Math.floor(
            info.StartIndex + (info.EndIndex - info.StartIndex) / 2);
        this.SetValue(nameof(this.props.ScrollAnchor), this.ItemsSource[middle], false);
        this.SetValue(nameof(this.props.FirstVisibleItem), this.ItemsSource[info.StartIndex], false);
    }

    private get FrozenFirstColumnWidth(): number
    {
        return this.FrozenFirstColumn?.Width || 0;
    }

    private get FrozenLastColumnWidth(): number
    {
        return this.FrozenLastColumn?.Width || 0;
    }

    public override OnRenderItem(item: any, index: number, props?: any): JSX.Element | null
    {
        if (!props)
            props = {};
        (props as IDataGridRowProps).DataGrid = this;
        (props as IDataGridRowProps).Style = this.RowStyle;
        (props as IDataGridRowProps).ContextMenuCommands = this.RowContextMenu;
        (props as IDataGridRowProps).PlaceContextMenuWithMouse = true;
        return super.OnRenderItem(item, index, props);
    }

    // Any reason why this shouldn't be in Selector???
    protected override OnItemsSourceCollectionChanged(sender: any, e: ICollectionUpdate)
    {
        super.OnItemsSourceCollectionChanged(sender, e);
        this.OnSelectedItemsCollectionChanged(this, e);
        this.OnSelectionChanged();
    }

    override constructClasses()
    {
        return super.constructClasses() + (this.EditMode ? ` dg-edit-mode ` : '');
    }

    override getCSSStyles()
    {
        var styles = super.getCSSStyles();
        styles[DataGrid.VAR_FontFamily] = this.FontFamily;
        styles[DataGrid.VAR_FontSize] = this.FontSize;
        styles["--DataGridColumns"] = this.ConstructGridColumns();
        if (this.RowHeight !== undefined && this.RowHeight !== 0)
            styles["--DataGridRowHeight"] = `${(this.IsCondensedMode ? this.CondensedRowHeight : this.RowHeight)}px`;
        if (this.MinRowHeight !== undefined && this.MinRowHeight !== 0)
            styles["--DataGridMinRowHeight"] = `${(this.IsCondensedMode ? this.CondensedRowHeight : this.MinRowHeight)}px`;
        styles["--DataGridFrozenFirstColumnWidth"] = `${this.FrozenFirstColumnWidth}px`;
        styles["--DataGridFrozenLastColumnWidth"] = `${this.FrozenLastColumnWidth}px`;

        if (this.GridLines & GridLinesVisibility.Horizontal)
            styles["--DataGridRowBorderWidth"] = '0px 0px 1px 0px';
        else
            styles["--DataGridRowBorderWidth"] = '0px';

        if (this.GridLines & GridLinesVisibility.Vertical)
            styles["--DataGridCellBorderWidth"] = "0px 1px 0px 0px";
        else
            styles["--DataGridCellBorderWidth"] = "0px";

        styles["--DataGridLinesColor"] = this.GridLinesBrush;
        styles.maxHeight = this.MaxHeight;
        styles.boxShadow = this.BoxShadow;
        return styles;
    }

    private ConstructGridColumns(): string
    {
        let template: string = '';
        let i = -1;
        let hasFrozenLast = false;
        for (let col of this.Columns)
        {
            i++;
            if (col.IsFrozen && i == this.Columns.length - 1)
            {
                template += "1fr ";
                hasFrozenLast = true;
            }
            if (col.Width === undefined || Number.isNaN(col.Width))
            {
                if (col.MinWidth !== undefined)
                    template += `minmax(${col.MinWidth}px, auto) `;
                else
                    template += "auto ";
            }
            else if (col.Width === Number.POSITIVE_INFINITY)
            {
                template += "1fr ";
            }
            else
            {
                template += `${col.Width}px `;
            }
        }
        if (!hasFrozenLast)
            template += "1fr "; // fills out the empty space
        return template;
    }
}
export class DataGrid extends DataGridBase<IDataGridProps, IFrameworkElementState> { }