import * as React from 'react';
import { Binding } from "@antimatterjs/react";
import { Control, IControlProps, IControlState } from "../Control";
import { ControlTemplate } from '@antimatterjs/positron/src/FrameworkTemplate';
import { WebStyle } from '@antimatterjs/positron/src/Style';
import { ISelectorProps, ISelectorState, Selector } from './Selector';
import { SelectionMode } from '../../Enums';

interface ISelectableItemCommon
{
    Parent?: Selector,
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
            Template: new ControlTemplate((tp) => (<>{tp.props.children}</>)),
            TabIndex: 0
        });

    public get Parent(): Selector|undefined
    {
        return this.GetValue(nameof(this.props.Parent));
    }

    public get Item(): any
    {
        return this.GetValue(nameof(this.props.Item));
    }

    constructor(props)
    {
        super(props);
        if (!this.state.OnKeyDown)
            this.SetValue(nameof(this.state.OnKeyDown), (e: KeyboardEvent) => this.OnKeyDown(e),
                false,
                true);
    }

    override constructClasses()
    {
        return super.constructClasses() +
            (this.props.IsSelected ? "selected " : "");
    }

    private OnKeyDown(e: KeyboardEvent)
    {
        if (!this.Parent?.ItemsSource)
            return;

        let down: boolean = e.code === "ArrowDown";
        let up: boolean = e.code === "ArrowUp";

        if (down || up)
        {
            var index = this.Parent.ItemsSource.indexOf(this.Item);
            if (up && index > 0 ||
                down && index < this.Parent.ItemsSource.length - 1)
            {
                this.Parent.ItemContainers[down ? index + 1 : index - 1].Container?.focus();
            }
            e.stopPropagation();
            e.preventDefault();
        }
        else if (e.code === 'Space' || e.code === 'Enter')
        {
            var index = this.Parent.ItemsSource.indexOf(this.Item);
            if (this.Parent.SelectionMode === SelectionMode.Single)
                this.Parent.SetSingleItemSelection(index);
            else
                this.Parent.ToggleMultiItemSelection(index);
            e.stopPropagation();
            e.preventDefault();
        }
    }
}

export class SelectableItemControl extends SelectableItemControlBase<ISelectableItemControlProps, ISelectableItemControlState>
{
}