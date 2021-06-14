import { Binding } from "@antimatterjs/react";
import { Control, IControlProps, IControlState } from "../Control";

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
    /* override */ constructClasses()
    {
        return super.constructClasses() +
            (this.props.IsSelected ? "selected " : "");
    }
}

export class SelectableItemControl extends SelectableItemControlBase
{
}