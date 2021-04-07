import { Component } from 'react';
import * as React from 'react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { PrimaryButton } from '@fluentui/react';

export interface IModernButtonProps
{
    Label?: string | Binding,
    Command?: ModelObjectReference | Binding,
    CommandParameter?: any
}
interface IModernButtonState
{
    Label?: string
    Command?: ModelObjectReference,
    CommandParameter?: any
}
export class ModernButton extends AntimatterComponent<IModernButtonProps, IModernButtonState>
{
    constructor(props)
    {
        super(props);        
    }

    render()
    {
        return (
            <PrimaryButton onClick={() => this.onClick()}>
                {this.state.Label}
            </PrimaryButton>
            );
    }

    private onClick()
    {
        if (this.state.Command)
            Antimatter.Server.ExecuteICommand(this.state.Command);
    }
}