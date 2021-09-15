import * as React from "react";
import { Binding, BindingMode } from "@antimatterjs/react";
import { WebStyle } from '../../Style';
import { ControlTemplate } from '../../FrameworkTemplate';
import { ButtonBase, IButtonBaseProps, IButtonBaseState } from "./ButtonBase";
import {
    IStyle,
    IToggleStyles,
    Toggle
} from '@fluentui/react'

export interface IToggleButtonProps extends IButtonBaseProps
{
    IsChecked?: boolean | Binding,
    CheckedText?: string | Binding,
    UncheckedText?: string | Binding,
    Label?: string | Binding,
    LabelIsInline?: boolean | Binding,
    IsThreeState?: boolean
}

export interface IToggleButtonState extends IButtonBaseState
{
    IsChecked?: boolean,
    CheckedText?: string,
    UncheckedText?: string,
    Label?: string,
    LabelIsInline?: boolean
    IsThreeState?: boolean
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

    /* override */ OnClick(e?: MouseEvent)
    {
        let newValue: boolean | undefined = undefined;
        if (this.props.IsThreeState)
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
            newValue = this.state.IsChecked ? false : true;
        }
        super.OnClick(e);
        this.SetValue(nameof(this.state.IsChecked), newValue);
    }
}


export class ToggleButton extends ToggleButtonBase<IToggleButtonProps, IToggleButtonState> {
    static DefaultStyle: WebStyle<IToggleButtonProps> = new WebStyle<IToggleButtonProps>(
        {
            IsThreeState: false,
            Template: new ControlTemplate((templatedParent: ToggleButton) => templatedParent.template)
        }
    );

    private get template(): JSX.Element
    {
        const textStyle: IStyle = {
            fontFamily: this.FontFamily,
            fontSize: this.FontSize,
            color: this.Foreground
        };

        return (
            <Toggle
                checked={this.state.IsChecked}
                onChange={() => super.OnClick()}
                disabled={this.state.IsEnabled === false}
                label={this.state.Label}
                onText={this.state.CheckedText}
                offText={this.state.UncheckedText}
                inlineLabel={this.state.LabelIsInline}
                styles={{
                    label: textStyle,
                    text: textStyle
                }}
            />
        );
    }
}