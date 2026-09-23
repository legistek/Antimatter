import * as React from 'react';
import { Binding } from "@antimatterjs/react";
import { Control, IControlProps, IControlState } from "../Control";
import { ControlTemplate } from '@antimatterjs/positron/src/FrameworkTemplate';
import { WebStyle } from '@antimatterjs/positron/src/Style';
import { Selector } from './Selector';
import { SelectionMode } from '../../Enums';
import { SemanticColor, Theme, ThemeColor } from '../../Theme';

interface ISelectableItemCommon
{
    Parent?: Selector,
    Item?: any,
    ItemIndex?: number
}
export interface ISelectableItemControlProps extends IControlProps, ISelectableItemCommon
{
    children?: React.ReactNode;
    IsSelected?: boolean | Binding,
    SelectedForeground?: string | Binding | SemanticColor | ThemeColor,
    SelectedBackground?: string | Binding | SemanticColor | ThemeColor
}
export interface ISelectableItemControlState extends IControlState, ISelectableItemCommon
{
    SelectedForeground?: string
}

export class SelectableItemControlBase<
    P extends ISelectableItemControlProps = {},
    S extends ISelectableItemControlState = {}> extends Control<P, S>
{
    public static DefaultStyle: WebStyle<ISelectableItemControlProps> = new WebStyle<ISelectableItemControlProps>(
        {
            Template: new ControlTemplate((tp) => (<>{tp.props.children}</>)),
            TabIndex: 0,
            SelectedBackground: SemanticColor.ListItemBackgroundChecked
        },
        {
            "@": {
                cursor: "pointer"
            },
            "@:hover": {
                background: Theme.Value(SemanticColor.BodyBackgroundHovered)
            },
            "@.selected": {
                background: Theme.Value(ThemeColor.ThemeLighter),
                color: Theme.Value(SemanticColor.BodyTextChecked)
            },
            "@:focus-visible": {
                outline: "none",                
            },
            "@:focus-visible:after": {
                content: "''",
                pointerEvents: "none",
                position: "absolute",
                boxSizing: "border-box",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                borderRadius: "0",
                borderWidth: "1px",
                borderStyle: "dotted",
                borderColor: Theme.Value(SemanticColor.FocusBorder),
            }
        });

    public get Parent(): Selector|undefined
    {
        return this.GetValue(nameof(this.props.Parent));
    }

    public get IsSelected(): boolean
    {
        return this.GetValue(nameof(this.props.IsSelected), false);
    }

    public get SelectedBackground(): string | undefined
    {
        return this.GetValue(nameof(this.props.SelectedBackground));
    }

    public get ItemIndex(): number
    {        
        return this.GetValue(nameof(this.props.ItemIndex), 0);
    }

    public override OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        return super.OnBoundPropertyUpdate(property, value, oldValue);
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
            (this.IsSelected ? "selected " : "");
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
                this.Parent.TryGetItemContainer(down ? index + 1 : index - 1)?.Container?.focus();
            }
            e.stopPropagation();
            e.preventDefault();
        }
        //else if (e.code === 'Space' || e.code === 'Enter')
        //{
        //    var index = this.Parent.ItemsSource.indexOf(this.Item);
        //    if (this.Parent.SelectionMode === SelectionMode.Single)
        //        this.Parent.SetSingleItemSelection(index);
        //    else
        //        this.Parent.ToggleMultiItemSelection(index);
        //    e.stopPropagation();
        //    e.preventDefault();
        //}
    }
}

export class SelectableItemControl extends SelectableItemControlBase<ISelectableItemControlProps, ISelectableItemControlState>
{
}