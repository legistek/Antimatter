import * as React from 'react';
import { Binding } from '@antimatterjs/react';
import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { IFrameworkElementState } from '../FrameworkElement';

export interface IGridProps extends IPanelProps
{
    ColumnDefinitions?: Binding|IColumnDefinition[],
    RowDefinitions?: Binding|IRowDefinition[],
}

export interface IGridChildPosition
{
    Column?: number,
    ColumnSpan?: number,
    Row?: number,
    RowSpan?: number
}

export enum GridUnitType
{
    Auto = 0,
    Pixel = 1,
    Star = 2,
    Fit = 3,
}

export interface IGridLength
{
    GridUnitType: GridUnitType,
    Value?: number
}

export interface IGridDefinition
{
    CoercedSize?: number
}

export interface IColumnDefinition extends IGridDefinition
{
    Width: IGridLength,
}

export interface IRowDefinition extends IGridDefinition
{
    Height: IGridLength,
}

export class GridBase<P extends IGridProps = {}, S extends IFrameworkElementState = {}> extends PanelBase<P, S>
{
    public static FittedRow(): IRowDefinition
    {
        return {
            Height: {
                GridUnitType: GridUnitType.Fit
            }
        };
    }

    public static FittedColumn(): IColumnDefinition
    {
        return {
            Width: {
                GridUnitType: GridUnitType.Fit
            }
        }
    }

    public static RowDefinition(height?: number , star?: boolean): IRowDefinition
    {
        return {
            Height: {
                GridUnitType: star
                    ? GridUnitType.Star
                    : (height !== undefined ? GridUnitType.Pixel : GridUnitType.Auto),
                Value: height
            }
        };
    }
    public static ColumnDefinition(width?: number, star?: boolean): IColumnDefinition
    {
        return {
            Width: {
                GridUnitType: star
                    ? GridUnitType.Star
                    : (width !== undefined ? GridUnitType.Pixel : GridUnitType.Auto),
                Value: width
            }
        };
    }

    public static get Row_Star(): IRowDefinition { return this.RowDefinition(1, true) }
    public static get Row_Auto(): IRowDefinition { return this.RowDefinition(); }
    public static get Column_Star(): IColumnDefinition { return this.ColumnDefinition(1, true) }
    public static get Column_Auto(): IColumnDefinition  { return this.ColumnDefinition(); }

    public get ColumnDefinitions(): IColumnDefinition[]
    {
        return this.GetValue(nameof(this.props.ColumnDefinitions), []);
    }

    public get RowDefinitions(): IRowDefinition[]
    {
        return this.GetValue(nameof(this.props.RowDefinitions), []);
    }

    /* override */ constructClasses(): string
    {
        return super.constructClasses() + " amx-ptn-grid";
    }

    /* override */ getCSSStyles(): React.CSSProperties
    {
        var styles = super.getCSSStyles();
        styles.gridTemplateColumns = this.ConstructGridColumnTemplate();
        styles.gridTemplateRows = this.ConstructGridRowTemplate();
        styles.gap = this.ItemSpacing;
        return styles;
    }

    ConstructGridRowTemplate(): string | undefined
    {
        if (!this.RowDefinitions || this.RowDefinitions.length === 0)
            return undefined;

        let rowTemplate: string = "";

        if (this.RowDefinitions)
        {
            for (const row of this.RowDefinitions as Array<IRowDefinition>)
            {
                if (row.CoercedSize)
                    rowTemplate += `${row.CoercedSize}px `;
                else if (row.Height.GridUnitType === GridUnitType.Auto)
                    rowTemplate += "max-content ";
                else if (row.Height.GridUnitType === GridUnitType.Pixel)
                    rowTemplate += `${row.Height.Value}px `;
                else if (row.Height.GridUnitType === GridUnitType.Fit)
                    rowTemplate += `fit-content(100%) `;
                else
                    rowTemplate += `${row.Height.Value}fr `;
            }
        }

        return rowTemplate;
    }

    ConstructGridColumnTemplate(): string|undefined
    {
        if (!this.ColumnDefinitions || this.ColumnDefinitions.length === 0)
            return undefined;

        let columnTemplate: string = "";

        for (const column of this.ColumnDefinitions as Array<IColumnDefinition>)
        {
            if (column.CoercedSize)
                columnTemplate += `${column.CoercedSize}px `;
            else if (column.Width.GridUnitType === GridUnitType.Auto)
                columnTemplate += "max-content ";
            else if (column.Width.GridUnitType === GridUnitType.Pixel)
                columnTemplate += `${column.Width.Value}px `;
            else if (column.Width.GridUnitType === GridUnitType.Fit)
                columnTemplate += `fit-content(100%) `
            else
                columnTemplate += `${column.Width.Value}fr `;
        }

        return columnTemplate;
    }
}

export class Grid extends GridBase<IGridProps, IFrameworkElementState>
{
    public static readonly C2: IColumnDefinition[] = [Grid.ColumnDefinition(1, true), Grid.ColumnDefinition(1, true)];
    public static readonly C1W1S: IColumnDefinition[] = [Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()];
    public static readonly C1S1W: IColumnDefinition[] = [Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)];
    public static readonly R1S1W: IRowDefinition[] = [Grid.RowDefinition(), Grid.RowDefinition(1, true)];
}