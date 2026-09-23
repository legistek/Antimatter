import * as React from "react";
import { Binding, BindingMode } from "@antimatterjs/react";
import { WebStyle } from '../../Style';
import { ButtonBase, IButtonBaseProps, IButtonBaseState } from "./ButtonBase";

export interface IToggleButtonProps extends IButtonBaseProps
{
    IsChecked?: boolean | Binding,
    Label?: string | Binding,
    IsThreeState?: boolean,
    ThirdStateReadOnly?: boolean,
    LabelIsInline?: boolean | Binding,
}

export interface IToggleButtonState extends IButtonBaseState
{
    IsChecked?: boolean,
    Label?: string,
    IsThreeState?: boolean,
    ThirdStateReadOnly?: boolean
}

export class ToggleButtonBase<P extends IToggleButtonProps = {},
    S extends IToggleButtonState = {}>
    extends ButtonBase<P, S>
{
    public static DefaultBindings = {
        IsChecked: {
            Mode: BindingMode.TwoWay
        }
    };

    protected static readonly STATE_Checked: string = "tgl-chk";
    protected static readonly STATE_Indeterminate: string = "tgl-ind";

    public get IsChecked(): boolean|undefined
    {
        var val = this.GetValue(nameof(this.props.IsChecked));
        if (val !== undefined)
            return val as boolean;
        else if (!this.IsThreeState)
            return false;
        else
            return undefined;
    }

    public get LabelIsInline(): boolean
    {
        return this.GetValue(nameof(this.props.LabelIsInline), false);
    }

    public get Label(): string | undefined
    {
        return this.GetValue(nameof(this.props.Label));
    }

    public get IsThreeState(): boolean
    {
        return this.GetValue(nameof(this.props.IsThreeState), false);
    }
    public get ThirdStateReadOnly(): boolean
    {
        return this.GetValue(nameof(this.props.ThirdStateReadOnly), true);
    }

    override OnClick(e?: React.MouseEvent)
    {
        let newValue: boolean | undefined = undefined;
        if (this.props.IsThreeState && !this.ThirdStateReadOnly)
        {
            if (this.state.IsChecked === undefined)
                newValue = true;
            else if (this.state.IsChecked === false)
                newValue = undefined;
            else
                newValue = false;
        }
        else
        {
            newValue = this.IsChecked ? false : true;
        }
        super.OnClick(e);
        this.SetValue(nameof(this.state.IsChecked), newValue);
    }

    override constructClasses()
    {
        let state: string = '';
        if (this.IsChecked)
            state = ToggleButton.STATE_Checked;
        else if (this.IsChecked === undefined)
            state = ToggleButton.STATE_Indeterminate;
        return super.constructClasses() + ' ' + state;
    }
}

export class ToggleButton extends ToggleButtonBase<IToggleButtonProps, IToggleButtonState> {
    static DefaultStyle: WebStyle<IToggleButtonProps> = new WebStyle<IToggleButtonProps>(
        {
            IsThreeState: false,
        }
    );
}