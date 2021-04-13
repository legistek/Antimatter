import { Component } from 'react';
import * as React from 'react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent, BindingParameters, BindingMode } from '@antimatterjs/react';
import { CheckboxVisibility, DetailsList, DetailsRow, IColumn, IDetailsListProps, IDetailsRowStyles, Selection, List, PrimaryButton, SelectionMode, DefaultEffects, getTheme } from '@fluentui/react';
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
            }}>
                {this.state.Header ? (() => 
                    <TextBlock Text={this.state.Header || ""} />)()
                    : null}

                <StackPanel style={{
                    background: theme.semanticColors.cardStandoutBackground,
                    boxShadow: DefaultEffects.elevation8,
                    border: "1px solid #C0C0C0"}}>
                    {this.props.children}
                </StackPanel>

            </StackPanel>
        );
    }

}