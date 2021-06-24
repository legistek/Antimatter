import * as React from 'react';
import { Binding } from "@antimatterjs/react";
import { Control, IControlProps, IControlState } from "../Control";
import { ControlTemplate } from '@antimatterjs/positron/src/FrameworkTemplate';
import { Style } from '@antimatterjs/positron/src/Style';

export interface ISelectableItemControlProps extends IControlProps
{
    IsSelected?: boolean | Binding,
    SelectedForeground?: string | Binding,
    SelectedBackground?: string | Binding
}
export interface ISelectableItemControlState extends IControlState
{
    IsSelected?: boolean,
    SelectedForeground?: string,
    SelectedBackground?: string
}

export class SelectableItemControlBase<
    P extends ISelectableItemControlProps = {},
    S extends ISelectableItemControlState = {}> extends Control<P, S>
{
    public static DefaultStyle: Style<ISelectableItemControlProps> = new Style<ISelectableItemControlProps>(
        {
            Template: new ControlTemplate((tp) => (<>{tp.props.children}</>))
        });

    /* override */ constructClasses()
    {
        return super.constructClasses() +
            (this.props.IsSelected ? "selected " : "");
    }
}

export class SelectableItemControl extends SelectableItemControlBase<ISelectableItemControlProps, ISelectableItemControlState>
{
}