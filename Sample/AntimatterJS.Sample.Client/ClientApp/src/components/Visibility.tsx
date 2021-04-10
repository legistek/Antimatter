import * as React from 'react';
import { Binding, ModelObjectReference, AntimatterComponent, Antimatter, BindingMode } from '@antimatterjs/react';
import { Checkbox as FluentCheckBox } from '@fluentui/react'
import { ModelValue } from '@antimatterjs/react/src/ModelValue';

export interface IVisibilityProps
{
    IsVisible?: boolean|Binding
}
export interface IVisibilityState
{
    IsVisible?: boolean
}
export class Visibility extends AntimatterComponent<IVisibilityProps, IVisibilityState>
{
    public static DefaultBindings = {
        IsVisible: {
            FallbackValue: false
        }
    };

    render()
    {
        if (this.state.IsVisible)
            return this.props.children;
        else
            return null;
    }
}