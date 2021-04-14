import { Component } from 'react';
import * as React from 'react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent, BindingParameters, BindingMode } from '@antimatterjs/react';
import { CheckboxVisibility, DetailsList, DetailsRow, IColumn, IDetailsListProps, IDetailsRowStyles, Selection, List, PrimaryButton, SelectionMode } from '@fluentui/react';
import { ModelValue } from '@antimatterjs/react/src/ModelValue';

export interface IGridProps
{
    ColumnDefinitions?: string,
    RowDefinitions?: string,
    Background?: string,
    GridGap?: number 
}

export class Grid extends AntimatterComponent<IGridProps>
{
    render()
    {
        return (
            <div className="amx-panel"
                style={{
                    display: "grid",
                    gridGap: (this.props.GridGap || 5) + "px",
                    gridTemplateColumns: this.props.ColumnDefinitions,
                    gridTemplateRows: this.props.RowDefinitions,
                    background: this.props.Background
                }}>
                {this.props.children}
            </div>
            );
    }
}

