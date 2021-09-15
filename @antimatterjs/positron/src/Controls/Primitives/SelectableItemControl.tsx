import * as React from 'react';
import { Binding } from "@antimatterjs/react";
import { Control, IControlProps, IControlState } from "../Control";
import { ControlTemplate } from '@antimatterjs/positron/src/FrameworkTemplate';
import { WebStyle } from '@antimatterjs/positron/src/Style';
import { ISelectorProps, ISelectorState, Selector } from './Selector';

interface ISelectableItemCommon
{
    Parent?: Selector<ISelectorProps, ISelectorState>,
    Item?: any,
    ItemIndex?: number
}
export interface ISelectableItemControlProps extends IControlProps, ISelectableItemCommon
{
    IsSelected?: boolean | Binding,
    IsEnabled?: boolean | Binding,
    SelectedForeground?: string | Binding,
    SelectedBackground?: string | Binding
}
export interface ISelectableItemControlState extends IControlState, ISelectableItemCommon
{
    IsSelected?: boolean,
    IsEnabled?: boolean,
    SelectedForeground?: string,
    SelectedBackground?: string
}

export class SelectableItemControlBase<
    P extends ISelectableItemControlProps = {},
    S extends ISelectableItemControlState = {}> extends Control<P, S>
{
    public static DefaultStyle: WebStyle<ISelectableItemControlProps> = new WebStyle<ISelectableItemControlProps>(
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