import * as React from 'react';
import { Style, WebStyle } from '../Style';
import { ThemeLayout } from '../Theme';
import { IPanelProps, IPanelState, PanelBase } from './Panel';

export interface IGridProps extends IPanelProps
{
    ColumnDefinitions?: IColumnDefinition[],
    RowDefinitions?: IRowDefinition[],
}
export interface IGridState extends IPanelState
{
    ColumnDefinitions?: IColumnDefinition[],
    RowDefinitions?: IRowDefinition[]
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

export class GridBase<P extends IGridProps = {}, S extends IGridState = {}> extends PanelBase<P,S>
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
        if (!this.state.RowDefinitions || this.state.RowDefinitions.length === 0)
            return undefined;

        let rowTemplate: string = "";
        
        if (this.state.RowDefinitions)
        {            
            for (const row of this.state.RowDefinitions as Array<IRowDefinition>)
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
        if (!this.props.ColumnDefinitions || this.props.ColumnDefinitions.length === 0)
            return undefined;

        let columnTemplate: string = "";

        for (const column of this.state.ColumnDefinitions as Array<IColumnDefinition>)
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

export class Grid extends GridBase<IGridProps, IGridState>
{
}