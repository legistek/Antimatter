import { Antimatter, Binding, ModelObjectReference } from "@antimatterjs/react";
import { FrameworkElement } from "../../FrameworkElement";
import { Control, IControlProps, IControlState } from "../Control";
import { Window } from "../Window";

export interface IButtonBaseProps extends IControlProps
{
    Command?: ModelObjectReference | Binding | ((commandParameter: any)=>void),
    CommandParameter?:
        Binding | string | number | boolean | ModelObjectReference |
        (() => string | number | boolean | ModelObjectReference),
    PreventBlurOnClick?: boolean | Binding,
    MenuOnRightClickOnly?: boolean,
}

export interface IButtonBaseState extends IControlState
{
    Command?: ModelObjectReference | ((commandParameter: any) => void),
    CommandParameter?: string | number | boolean | ModelObjectReference
}

export class ButtonBase<
    P extends IButtonBaseProps = {},
    S extends IButtonBaseState = {}>
    extends Control<P, S>
{
    public get Command(): ModelObjectReference | ((commandParameter: any) => void) | undefined
    {
        return this.GetValue(nameof(this.props.Command));
    }

    public get MenuOnRightClickOnly(): boolean
    {
        return this.GetValue(nameof(this.props.MenuOnRightClickOnly), false);
    }

    public get PreventBlurOnClick(): boolean
    {
        return this.GetValue(nameof(this.props.PreventBlurOnClick), false);
    }

    /* virtual */ OnClick(e?: React.MouseEvent): void
    {
        if (e)
            FrameworkElement.LastMouseEvent = { X: e?.clientX, Y: e?.clientY };
        if (!this.PreventBlurOnClick)
        {
            if (e?.currentTarget)
                (e.currentTarget as any).blur();
            document.body.focus();
        }

        if (this.ContextMenuCommands && !this.MenuOnRightClickOnly)
        {
            this.IsContextMenuOpen = true;
            e?.stopPropagation();
            return;
        }

        var cmdParam = this.state.CommandParameter as any;

        if (this.state.Command)
            this.ExecuteCommand(
                this.state.Command,
                typeof cmdParam === 'function'
                    ? cmdParam()
                    : cmdParam);
        e?.stopPropagation();
    }

    override OnComponentMount()
    {
        if (!this.Container)
            return;
        this.Container.onpointerdown = (e) =>
        {
            e.stopPropagation();
        };
        this.Container.onpointerup = (e) =>
        {
            e.stopPropagation();
        };
        this.Container.ondblclick = (e) =>
        {
            e.preventDefault();
            e.stopPropagation();
        };
    }
}