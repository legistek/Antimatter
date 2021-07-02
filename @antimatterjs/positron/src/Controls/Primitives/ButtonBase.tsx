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

export abstract class ButtonBase<
    P extends IButtonBaseProps = {},
    S extends IButtonBaseState = {}>
    extends Control<P, S>
{
    public static LastMouseEvent?: MouseEvent;

    /* virtual */ OnClick(e?: MouseEvent): void
    {
        ButtonBase.LastMouseEvent = e;
        if (typeof (this.state.Command) === "function")
        {
            (this.state.Command as any)(this.state.CommandParameter);
        }
        else if (this.state.Command instanceof ModelObjectReference)
        {
            Antimatter.Server.ExecuteICommand(
                this.state.Command as ModelObjectReference,
                ModelValue.Get(this.state.CommandParameter));
        }
    }
}