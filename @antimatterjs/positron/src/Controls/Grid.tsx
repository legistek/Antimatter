import * as React from 'react';
import { IPanelProps, IPanelState, Panel } from './Panel';

export interface IGridProps extends IPanelProps
{
    ColumnDefinitions?: IColumNDefinition[],
    RowDefinitions?: IRowDefinition[],
}
export interface IGridState extends IPanelState
{
    ColumnDefinitions?: IColumNDefinition[],
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

export interface IColumNDefinition extends IGridDefinition
{
    Width: IGridLength,
}

export interface IRowDefinition extends IGridDefinition
{
    Height: IGridLength,
}

export class Grid<P extends IGridProps = {}, S extends IGridState = {}> extends Panel<P,S>
{    
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
    public static ColumnDefinition(width?: number, star?: boolean): IColumNDefinition
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

        for (const column of this.state.ColumnDefinitions as Array<IColumNDefinition>)
        {
            if (column.CoercedSize)
                columnTemplate += `${column.CoercedSize}px `;
            else if (column.Width.GridUnitType === GridUnitType.Auto)
                columnTemplate += "auto ";
            else if (column.Width.GridUnitType === GridUnitType.Pixel)
                columnTemplate += `${column.Width.Value}px `;
            else
                columnTemplate += `${column.Width.Value}fr `;
        }

        return columnTemplate;
    }
 }