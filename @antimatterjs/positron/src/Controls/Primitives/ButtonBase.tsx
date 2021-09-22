import { Antimatter, Binding, ModelObjectReference, ModelValue } from "@antimatterjs/react";
import { Control, IControlProps, IControlState } from "../Control";

export interface IButtonBaseProps extends IControlProps
{
    Command?: ModelObjectReference | Binding | ((commandParameter: any)=>void),
    CommandParameter?: string | number | boolean | ModelObjectReference | Binding
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
    public static LastMouseEvent?: MouseEvent;

    /* virtual */ OnClick(e?: MouseEvent): void
    {
        ButtonBase.LastMouseEvent = e;
        if (this.state.Command)
            this.ExecuteCommand(this.state.Command, this.state.CommandParameter);
    }
}