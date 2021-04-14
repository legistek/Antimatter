import { Component } from 'react';
import * as React from 'react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent, BindingParameters, BindingMode } from '@antimatterjs/react';
import { CheckboxVisibility, DetailsList, DetailsRow, IColumn, IDetailsListProps, IDetailsRowStyles, Selection, List, PrimaryButton, SelectionMode, DefaultEffects, getTheme, Label } from '@fluentui/react';
import { ModelValue } from '@antimatterjs/react/src/ModelValue';
import { StackPanel } from './StackPanel';
import { Grid } from './Grid';
import { TextBlock } from './TextBlock';

export interface IGroupBoxProps
{
    Header?: string | Binding,    
}
export interface IGroupBoxState
{
    Header?: string,
}

export class GroupBox extends AntimatterComponent<IGroupBoxProps, IGroupBoxState>
{
    render()
    {
        const theme = getTheme();

        return (
            <StackPanel style={{
                padding: (this.state.Header ? "0px 10px 10px 10px" : "10px")
            }}>
                {this.state.Header ? (() =>
                    <Label>{this.state.Header}</Label>)()
                    : null}

                <StackPanel style={{
                    padding: "10px",
                    background: theme.semanticColors.cardStandoutBackground,
                    boxShadow: DefaultEffects.elevation8,
                    border: "1px solid #C0C0C0"}}>
                    {this.props.children}
                </StackPanel>

            </StackPanel>
        );
    }

}