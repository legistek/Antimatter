import { Antimatter, Binding, ModelValueType, Utilities } from '@antimatterjs/react';
import * as React from 'react';
import { CSSClasses } from '../../CSSClasses';
import { HorizontalAlignment, VerticalAlignment } from '../../Enums';
import { IFrameworkElementState } from "../../FrameworkElement";
import { DataTemplate } from '../../FrameworkTemplate';
import { Ellipse } from '../../Shapes/Ellipse';
import { WebStyle } from '../../Style';
import { ThemeLayout } from '../../Theme';
import { CheckBox } from '../CheckBox';
import { ContentPresenterBase, IContentPresenterProps, IContentPresenterState } from "../ContentPresenter";
import { TextBlock } from '../TextBlock';
import { DataGrid, DataGridBase, IDataGridColumn } from "./DataGrid";
import { DataGridRow } from './DataGridRow';

export interface IDataGridCellProps extends IContentPresenterProps
{
    Column?: IDataGridColumn;
    Row?: DataGridRow;
    ColumnIndex?: number;
    ItemIndex?: number;
    IsEditing?: boolean;
    IsSelected?: boolean;
    DataGrid?: DataGridBase;
    CanEdit?: boolean | Binding;
}

export class DataGridCellBase<P extends IDataGridCellProps = {}>
    extends ContentPresenterBase<P, IContentPresenterState>
{    
    public static readonly STATE_FrozenLast: string = Antimatter.Identifier("dgcell-frozenlast");
    public static readonly STATE_Selector: string = "dgcell-selector";
    public static readonly STATE_CanEdit: string = "dgcell-can-edit";
    public static readonly STATE_IsEditing: string = "dgcell-is-editing";
    public static readonly STATE_ReadOnly: string = "dgcell-read-only";

    constructor(props)
    {
        super(props);
        if (this.Column?.IsSelector)
        {
            (this.state as any).OnClick = (e: React.MouseEvent) =>
            {
                if (!this.DataGrid?.CanSelect || e.shiftKey)
                    return;
                this.DataGrid?.ToggleMultiItemSelection(this.ItemIndex);
                e.stopPropagation();
            };
        }
        else
        {
            var existingOnClick = (this.state as any).OnClick;

            (this.state as any).OnClick = (e: React.MouseEvent) =>
            {
                if (existingOnClick)
                    existingOnClick(e);
                if (!this.DataGrid?.EditMode)
                    return;
                e.stopPropagation();
                //this.BeginEditing();
            };
        }
    }

    public get CanEdit(): boolean
    {
        return this.GetValue(nameof(this.props.CanEdit), false);
    }

    public get Row(): DataGridRow | undefined
    {
        return this.GetValue(nameof(this.props.Row));
    }

    public get Column(): IDataGridColumn | undefined
    {
        return this.GetValue(nameof(this.props.Column));
    }

    public get ColumnIndex(): number
    {
        return this.GetValue(nameof(this.props.ColumnIndex), 0);
    }

    public get ItemIndex(): number
    {
        return this.GetValue(nameof(this.props.ItemIndex), 0);
    }

    public get IsSelected(): boolean
    {
        return this.GetValue(nameof(this.props.IsSelected), false);
    }

    public get IsEditing(): boolean
    {
        return this.GetValue(nameof(this.props.IsEditing), false);
    }

    public get DataGrid(): DataGridBase | undefined
    {
        return this.GetValue(nameof(this.props.DataGrid));
    }

    public async BeginEditing()
    {
        //this.Container?.focus();
        if (!this.CanEdit)
            return;
        this.SetValue(nameof(this.props.IsEditing), true, true, true);
        //this.OnClickOutsideMe(() =>
        //{
        //    this.EndEditing();
        //});
        if (!!this.DataGrid)
            this.DataGrid.NowEditingCell = this;
        await Utilities.SleepAsync(33);
        var next = Utilities.FindFirstDescendant(this.Container, e => e.tabIndex >= 0);
        if (next)
            next.focus();
    }

    public async EndEditing()
    {
        if (!this.IsEditing)
            return;
        this.Container?.blur();
        await Utilities.SleepAsync(1);
        this.SetValue(nameof(this.props.IsEditing), false, true, true);
        if (!!this.DataGrid && (this.DataGrid.NowEditingCell == this))
            this.DataGrid.NowEditingCell = undefined;
    }

    private static _emptyTemplate = (item) => (<></>);

    override OnElementRendered()
    {
        if (this.Container == null)
            return;
        this.Container.tabIndex = this.CanEdit ? 0 : -1;
    }

    protected override GetTemplate(): DataTemplate
    {        
        if (!this.Column)
            return this.ContentTemplate;
        else if (this.Column.IsSelector)
        {
            return (item) => (
                <CheckBox
                    IsChecked={this.IsSelected}
                    IsHitTestVisible={false}
                    HorizontalAlignment={HorizontalAlignment.Center}
                    VerticalAlignment={VerticalAlignment.Center} />);
        }
        else if (this.Column.IsColorIndicator)
        {
            return (item) => (
                <Ellipse
                    Width={32}
                    Height={32}
                    HorizontalAlignment={HorizontalAlignment.Center}
                    VerticalAlignment={VerticalAlignment.Center}
                    Fill={new Binding(this.Column?.BindingPath)}
                />
            );
        }
        else if (!this.Column.Template)
        {
            if (!this.Column.BindingPath || !this.Column.Type)
                return DataGridCell._emptyTemplate;;

            var elem = this.ConstructDefaultTemplate(
                this.Column.BindingPath,
                this.Column.Type);
            return (item) => elem;
        }

        if (!this.IsEditing || !this.Column.EditTemplate || !this.DataGrid?.EditMode)
            return this.Column.Template;
        else
            return this.Column.EditTemplate;
    }

    public override constructClasses(): string
    {
        return super.constructClasses()
            + ` ${CSSClasses.DataGridCell} `
            + (this.CanEdit ? ` ${DataGridCell.STATE_CanEdit} ` : ` ${DataGridCell.STATE_ReadOnly} `)
            + (this.IsEditing ? `${DataGridCell.STATE_IsEditing} ` : '')
            + (this.Column?.IsSelector ? ` ${DataGridCell.STATE_Selector} ` : '')
            + (this.Column?.IsFrozen && this.ColumnIndex === 0 ? ` ${CSSClasses.DataGridCellFrozenFirst} ` :
                this.Column?.IsFrozen && this.ColumnIndex === (this.DataGrid?.Columns?.length || 0) - 1 ? ` ${DataGridCell.STATE_FrozenLast} ` :
                '')
    }

    private ConstructDefaultTemplate(bindingPath: string, type: ModelValueType): JSX.Element
    {
        switch (type)
        {
            case ModelValueType.String:
                return (<TextBlock
                    Text={new Binding(bindingPath)}
                    VerticalAlignment={VerticalAlignment.Center}
                    Margin={ThemeLayout.MarginStandardTB}
                    MaxLines="4" />);
            case ModelValueType.Bool:
                return (<CheckBox
                    IsEnabled={false}
                    VerticalAlignment={VerticalAlignment.Center}
                    IsChecked={new Binding(bindingPath)} />);
            case ModelValueType.DateTime:
                const format: Intl.DateTimeFormatOptions = {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                };
                return (
                    <TextBlock
                        Text={new Binding({
                            Path: bindingPath,
                            Converter: (x: Date) => x?.toLocaleString(undefined, format)
                        })}
                        VerticalAlignment={VerticalAlignment.Center}
                        MaxLines="2"
                    />
                );
            default:
                return (<></>);
        }
    }

    override OnComponentMount()
    {
        if (!this.Container)
            return;
        this.Container.onfocus = (e) =>
        {
            if (this.CanEdit)
                this.BeginEditing();
        }
        (this.Container).addEventListener("focusout", e =>
        {
            var target = (e as FocusEvent).relatedTarget as Node;
            if (!this.Container || !target)
                return;
            if (!this.Container.contains(target) &&
                (target instanceof HTMLBodyElement || this.FindWindowRootContainer()?.contains(target)))
                this.EndEditing();
        });
        this.Container.onkeydown = (e) =>
        {
            let stop: boolean = true;
            if (e.key == "ArrowDown")
                this.ShiftEditRow(0, 1);
            else if (e.key == "ArrowUp")
                this.ShiftEditRow(0, -1);
            else if (e.key == "PageDown")
                this.ShiftEditRow(0, 10);
            else if (e.key == "PageUp")
                this.ShiftEditRow(0, -10);
            //else if (e.key == "Tab")
            //{
            //    this.ShiftEditRow(e.shiftKey ? -1 : 1, 0);
            //    stop = false;
            //}
            else if (e.key == "Enter")
                this.ShiftEditRow(0, 1);
            else if (e.key == "Escape")
                this.EndEditing();
            // not yet; need to deal with virtualization
            //else if (e.key == "Home" && e.ctrlKey)
            //    this.ShiftEditRow(0, -Number.MAX_SAFE_INTEGER);
            //else if (e.key == "End" && e.ctrlKey)
            //    this.ShiftEditRow(0, Number.MAX_SAFE_INTEGER);
            else
                return;

            if (stop)
            {
                e.preventDefault();
                e.stopPropagation();
            }
        };
    }




    private async ShiftEditRow(columnShift: number, rowShift: number)
    {
        if (!this.DataGrid ||
            columnShift === 0 && rowShift === 0)
            return;

        let currentRow: number = this.ItemIndex + rowShift;
        var currentColumn = Utilities.BoundNumber(this.ColumnIndex + columnShift, 0, this.DataGrid.Columns.length - 1);
        if (currentColumn < 0)
        {
            currentColumn = this.DataGrid.Columns.length - 1;
            currentRow--;
        }
        else if (currentColumn >= this.DataGrid.Columns.length - 1)
        {
            currentColumn = 0;
            currentRow++;
        }
        currentRow = Utilities.BoundNumber(currentRow, 0, this.DataGrid.ItemsSource.length - 1);

        // After the initial shift, only go in steps of +/- 1 for purposes
        // of finding the next editable cell
        if (rowShift !== 0)
            rowShift = rowShift > 0 ? 1 : -1;
        if (columnShift !== 0)
            columnShift = columnShift > 0 ? 1 : -1;

        for (currentRow;
            currentRow >= 0 && currentRow < this.DataGrid.ItemsSource.length;
            currentRow += rowShift)
        {
            for (currentColumn;
                currentColumn >= 0 && currentColumn < this.DataGrid.Columns.length;
                currentColumn += columnShift)
            {
                var cell = this.DataGrid.TryGetCell(currentColumn, currentRow);
                if (cell && cell.CanEdit)
                {
                    if (cell === this)
                        return;
                    //this.EndEditing();
                    //cell.BeginEditing();
                    cell.Container?.focus();
                    return;
                }
                else if (columnShift === 0)
                    break;
            }

            // No editable cells on this row, change columns before
            // moving rows
            if (currentColumn < 0)
                currentColumn = this.DataGrid.Columns.length - 1;
            else if (currentColumn >= this.DataGrid.Columns.length - 1)
                currentColumn = 0;

            // If we've been through a whole row with no hits, we need to ensure
            // we go to a new row to avoid an infinite loop.
            rowShift = columnShift > 0 ? 1 : -1;
        }

        // No more editable cells; do nothing
    }
}

export class DataGridCell extends DataGridCellBase<IDataGridCellProps> {}
