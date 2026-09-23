import { Antimatter, Binding, BindingMode, PropertyChangedEventArgs } from '@antimatterjs/react';
import { Icon } from '@fluentui/react';
import * as React from 'react';
import { CSSClasses } from '../../CSSClasses';
import { HorizontalAlignment, Orientation, VerticalAlignment } from '../../Enums';

import { IFrameworkElementState } from "../../FrameworkElement";
import { Style, WebStyle } from "../../Style";
import { SemanticColor, Theme, ThemeColor, ThemeLayout } from '../../Theme';
import { CheckBox } from '../CheckBox';
import { ContextMenu } from '../ContextMenu';
import { Control, IControlProps } from '../Control';
import { Glyph } from '../Glyph';
import { Grid } from '../Grid';
import { Panel } from '../Panel';
import { StackPanel } from '../StackPanel';
import { TextBlock } from '../TextBlock';
import { DataGridBase, IDataGridColumn, IDataGridProps} from "./DataGrid";

export interface IDataGridHeaderCellProps extends IControlProps
{
    Column?: IDataGridColumn,
    ColumnIndex?: number,
    DataGrid?: DataGridBase,
    SortDescending?: boolean,
}

export class DataGridHeaderCellBase<P extends IDataGridHeaderCellProps = {}>
    extends Control<P, IFrameworkElementState>
{
    public static readonly STATE_Sortable: string = Antimatter.Identifier("dgh-sortable");
    public static readonly STATE_Sizable: string = Antimatter.Identifier("dgh-sizeable");
    public static readonly STATE_IsSorting: string = Antimatter.Identifier("dgh-is-sorting");
    public static readonly PART_SortIcon: string = Antimatter.Identifier("dgh-sort-icon");
    public static readonly PART_Resizer: string = Antimatter.Identifier("dgh-resizer");

    public static DefaultStyle: Style<IDataGridHeaderCellProps> = new WebStyle<IDataGridHeaderCellProps>(
        {
            Padding: ThemeLayout.MarginStandard,
            Template: (templatedParent: DataGridHeaderCell) =>
                templatedParent.Column?.IsSelector
                    ? (<CheckBox
                        IsChecked={new Binding({
                            Source: templatedParent.DataGrid,
                            Path: nameof<IDataGridProps>(p => p.IsSelectAll),
                            Mode: BindingMode.TwoWay
                        })}
                        IsEnabled={new Binding({
                            Source: templatedParent.DataGrid,
                            Path: nameof<IDataGridProps>(p => p.EditMode),
                            Converter: em => !em
                        })}
                        HorizontalAlignment={HorizontalAlignment.Center}
                        VerticalAlignment={VerticalAlignment.Center} />)
                    : (
                        <Grid
                            OnClick={(e) =>
                            {
                                if (!templatedParent.Column?.CanSort)
                                    return;
                                if (templatedParent.DataGrid?.IsCondensedMode)
                                {
                                    templatedParent.IsSortMenuOpen = true;
                                }
                                else
                                {
                                    templatedParent.DataGrid?.SetSorting(
                                        templatedParent.ColumnIndex,
                                        templatedParent.SortDescending !== undefined
                                            ? !templatedParent.SortDescending
                                            : false);
                                }
                            }}
                            ColumnDefinitions={[
                                Grid.FittedColumn(),
                                Grid.ColumnDefinition(1, true),
                                Grid.ColumnDefinition(),
                                Grid.ColumnDefinition()]}>
                            {
                                templatedParent.DataGrid?.IsCondensedMode
                                    ? (templatedParent.Column?.CanSort &&
                                        <StackPanel Orientation={Orientation.Horizontal}>
                                            <TextBlock
                                                Margin={templatedParent.Padding}
                                                Grid={{ Column: 0 }}
                                                MaxLines="2"
                                                FontWeight="bold"
                                                VerticalAlignment={VerticalAlignment.Center}
                                                Text={
                                                    templatedParent.DataGrid?.IsCondensedMode
                                                        ? templatedParent.DataGrid?.ActualColumns.find(c => c.Key === templatedParent.DataGrid?.SortColumn)?.Header || "Sort By"
                                                        : templatedParent.Column?.Header
                                                } />
                                            <Glyph
                                                VerticalAlignment={VerticalAlignment.Center}
                                                Icon="ChevronDown" />
                                        </StackPanel>)
                                    : <TextBlock
                                        Margin={templatedParent.Padding}
                                        Grid={{ Column: 0 }}
                                        MaxLines="2"
                                        FontWeight="bold"
                                        VerticalAlignment={VerticalAlignment.Center}
                                        Text={templatedParent.Column?.Header} />
                            }
                            {
                                templatedParent.Column?.CanSort &&
                                !templatedParent.DataGrid?.IsCondensedMode &&
                                (<Icon
                                    style={{ gridColumn: 3 }}
                                    className={`${CSSClasses.Base} ${CSSClasses.VACenter} ${DataGridHeaderCell.PART_SortIcon} ${(templatedParent.SortDescending !== undefined ? DataGridHeaderCell.STATE_IsSorting : '')} `}
                                    iconName={templatedParent.SortDescending === true
                                        ? "CaretSolidDown"
                                        : "CaretSolidUp"} />)
                            }
                            {
                                templatedParent.Column?.CanResize &&
                                (<Panel
                                    OnClick={e => e.stopPropagation()}
                                    OnPointerDown={e => templatedParent.OnSizerPointerDown(e)}
                                    OnPointerUp={e => templatedParent.OnSizerPointerUp(e)}
                                    OnLostPointerCapture={e => templatedParent.OnSizerPointerUp(e)}
                                    OnPointerMove={e => templatedParent.OnSizerPointerMove(e)}
                                    HorizontalAlignment={HorizontalAlignment.Right}
                                    Grid={{ Column: 3 }}
                                    ClassName={DataGridHeaderCell.PART_Resizer}
                                    Width={7} />)
                            }
                            {
                                templatedParent.DataGrid?.IsCondensedMode &&
                                <ContextMenu
                                    GetTarget={() => templatedParent}
                                    IsOpen={new Binding({
                                        Source: templatedParent,
                                        Path: nameof(templatedParent.IsSortMenuOpen)
                                    })}
                                    ItemsSource={templatedParent.DataGrid.GetCondensedSortMenu()} />
                            }
                        </Grid>
                    )
        },
        {
            "@": {
                userSelect: "none",
                background: `${Theme.Value(SemanticColor.BodyBackground)} !important`,
            },
            [`@.${DataGridHeaderCellBase.STATE_Sortable}`]: {
                cursor: "pointer"
            },
            [`@.${DataGridHeaderCellBase.STATE_Sizable}:hover`]: {
                background: Theme.Value(ThemeColor.NeutralLight) // Theme.Value(SemanticColor.ListHeaderBackgroundHovered),
            },
            [`@ .${DataGridHeaderCellBase.PART_Resizer}`]: {
                cursor: "col-resize",
                background: "transparent"
            },
            [`@ .${DataGridHeaderCellBase.PART_Resizer}:hover`]: {
                background: Theme.Value(ThemeColor.NeutralQuaternary)
            },
            [`@ .${DataGridHeaderCellBase.PART_SortIcon}`]: {
                //visibility: "collapse",
                opacity: 0,
                margin: Theme.Value(ThemeLayout.MarginStandardR)
            },
            [`@:hover .${DataGridHeaderCellBase.PART_SortIcon}:not(.${DataGridHeaderCellBase.STATE_IsSorting})`]: {
                //visibility: "visible",
                opacity: 1,
                color: Theme.Value(ThemeColor.NeutralQuaternary),
            },
            [`@ .${DataGridHeaderCellBase.PART_SortIcon}.${DataGridHeaderCellBase.STATE_IsSorting}`]: {
                //visibility: "visible",
                opacity: 1,
                color: Theme.Value(SemanticColor.InputIcon),
            }
        });

    private _isSortMenuOpen: boolean = false;
    public get IsSortMenuOpen(): boolean
    {
        return this._isSortMenuOpen;
    }
    public set IsSortMenuOpen(value: boolean)
    {
        this._isSortMenuOpen = value;
        this.PropertyChanged?.invoke(this, new PropertyChangedEventArgs(nameof(this.IsSortMenuOpen)));
    }

    public get SortDescending(): boolean | undefined
    {
        return this.GetValue(nameof(this.props.SortDescending));
    }

    public get Column(): IDataGridColumn | undefined
    {
        return this.GetValue(nameof(this.props.Column));
    }

    public get ColumnIndex(): number
    {
        return this.GetValue(nameof(this.props.ColumnIndex), 0);
    }

    public get DataGrid(): DataGridBase | undefined
    {
        return this.GetValue(nameof(this.props.DataGrid));
    }

    override constructClasses() : string
    {
        var classes = super.constructClasses();
        if (this.Column?.CanSort)
            classes += `${DataGridHeaderCellBase.STATE_Sortable} `;
        if (this.Column?.CanResize)
            classes += `${DataGridHeaderCellBase.STATE_Sizable} `;
        return classes;
    }

    private OnSizerPointerDown(e: PointerEvent)
    {
        if (this._isDragging)
            return; // should be impossible

        this._element = e.target as HTMLElement;
        if (!this._element)
            return;

        this._isDragging = true;
        this._element?.setPointerCapture(e.pointerId);
        this._capturedPointerID = e.pointerId;
        this._dragStartSize = this.Column?.Width;
        this._dragStartCoord = e.pageX;
    }

    private OnSizerPointerMove(e: PointerEvent)
    {
        if (!this._isDragging || !this._dragStartSize || !this._dragStartCoord)
            return;

        var delta = e.pageX - this._dragStartCoord;
        var newSize = this._dragStartSize + delta;
        this.DataGrid?.ResizeColumn(this.ColumnIndex, newSize, false);
    }

    private OnSizerPointerUp(e: PointerEvent)
    {
        if (!this._isDragging || !this._capturedPointerID || !this._dragStartSize || !this._dragStartCoord)
            return;

        var delta = e.pageX - this._dragStartCoord;
        var newSize = this._dragStartSize + delta;

        this._element?.releasePointerCapture(this._capturedPointerID);
        this._isDragging = false;
        this._capturedPointerID = undefined;
        this.DataGrid?.ResizeColumn(this.ColumnIndex, newSize, true);
    }

    private _isDragging: boolean = false;
    private _element: HTMLElement | null = null;
    private _capturedPointerID?: number;
    private _dragStartSize?: number;
    private _dragStartCoord?: number;
}
export class DataGridHeaderCell extends DataGridHeaderCellBase<IDataGridHeaderCellProps> { }

