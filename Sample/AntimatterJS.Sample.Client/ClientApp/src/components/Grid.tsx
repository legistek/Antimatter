import { Component } from 'react';
import * as React from 'react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent, BindingParameters, BindingMode } from '@antimatterjs/react';
import { CheckboxVisibility, DetailsList, DetailsRow, IColumn, IDetailsListProps, IDetailsRowStyles, Selection, List, PrimaryButton, SelectionMode } from '@fluentui/react';
import { ModelValue } from '@antimatterjs/react/src/ModelValue';

export interface IGridProps
{
    ColumnDefinitions?: string,
    RowDefinitions?: string,
    Background?: string
}

export class Grid extends AntimatterComponent<IGridProps>
{
    render()
    {
        return (
            <div style={{
                display: "grid",
                gridTemplateColumns: this.props.ColumnDefinitions,
                gridTemplateRows: this.props.RowDefinitions,
                background: this.props.Background
            }}>
                {this.props.children}
            </div>
            );
    }
}

