import { Component } from 'react';
import * as React from 'react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { PrimaryButton } from '@fluentui/react';
import { ModelValue } from '@antimatterjs/react/src/ModelValue';

export interface IModernButtonProps
{
    Label?: string | Binding,
    Command?: ModelObjectReference | Binding,
    CommandParameter?: any,
    className?: string
    IsEnabled?: boolean | Binding;
}
interface IModernButtonState
{
    Label?: string
    Command?: ModelObjectReference,
    CommandParameter?: any
    IsEnabled?: boolean;
}
export class ModernButton extends AntimatterComponent<IModernButtonProps, IModernButtonState>
{
    constructor(props)
    {
        super(props);        
    }

    public static DefaultBindings = {
        IsEnabled: {
            FallbackValue: true
        }
    };

    render()
    {
        //this.BindState({ Path: "IsVisible", Source: this.state.Command }, "buttonIsVisible");
        //if (!this.state["buttonIsVisible"])
        //    return null;

        return (
            <PrimaryButton className={this.props.className}
                disabled={this.state.IsEnabled === undefined ? false : !this.state.IsEnabled}
                onClick={() => this.onClick()}>
                {this.state.Label}
            </PrimaryButton>
            );
    }

    private onClick()
    {
        if (this.state.Command)
            Antimatter.Server.ExecuteICommand(
                this.state.Command,
                ModelValue.Get(this.state.CommandParameter));
    }
}