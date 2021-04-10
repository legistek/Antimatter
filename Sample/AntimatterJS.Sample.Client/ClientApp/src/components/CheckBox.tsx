import * as React from 'react';
import { Binding, ModelObjectReference, AntimatterComponent, Antimatter, BindingMode } from '@antimatterjs/react';
import { Checkbox as FluentCheckBox } from '@fluentui/react'
import { ModelValue } from '@antimatterjs/react/src/ModelValue';

export interface ICheckBoxProps
{
    IsChecked?: boolean | Binding,
    Label?: string | Binding,
    Command?: ModelObjectReference | Binding,
    CommandParameter?: any,
    className?: string
    IsEnabled?: boolean | Binding;
    IsIndeterminate?: boolean;
}
interface ICheckBoxState
{
    IsChecked?: boolean,
    IsIndeterminate: boolean,
    Label?: string,
    Command?: ModelObjectReference,
    CommandParameter?: any
    IsEnabled?: boolean;
}
export class CheckBox extends AntimatterComponent<ICheckBoxProps, ICheckBoxState>
{
    public static DefaultBindings = {
        IsEnabled: {
            FallbackValue: true
        },
        IsChecked: {
            Mode: BindingMode.TwoWay,
            FallbackValue: false
        },
        Label: {
            FallbackValue: '...'
        }
    };

    render()
    {
        return (
            <FluentCheckBox
                className={this.props.className}
                disabled={this.state.IsEnabled === undefined ? false : !this.state.IsEnabled}
                label={this.state.Label}
                checked={this.state.IsChecked}
                indeterminate={this.props.IsIndeterminate}                
                onChange={(checked, newValue) =>
                {
                    this.OnTargetChanged(nameof(this.state.IsChecked), newValue);
                    if (this.state.Command)
                        Antimatter.Server.ExecuteICommand(
                            this.state.Command,
                            ModelValue.Get(this.state.CommandParameter));
                }}
            />);
    }
}