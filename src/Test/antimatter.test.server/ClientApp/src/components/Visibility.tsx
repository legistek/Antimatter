import * as React from 'react';
import { Binding, AntimatterComponent } from '@antimatterjs/react';

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