import * as React from "react";
import { Binding, BindingMode } from "@antimatterjs/react";
import { Style } from '@antimatterjs/positron/src/Style';
import { ControlTemplate } from '@antimatterjs/positron/src/FrameworkTemplate';
import { ButtonBase, IButtonBaseProps, IButtonBaseState } from "@antimatterjs/positron/src/Controls/Primitives/ButtonBase";
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
    IsThreeState?: boolean
}

export interface IToggleButtonState extends IButtonBaseState
{
    IsChecked?: boolean,
    CheckedText?: string,
    UncheckedText?: string,
    Label?: string,
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
            else // this.state.IsChecked === true
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
    static DefaultStyle: Style<IToggleButtonProps> = new Style<IToggleButtonProps>(
        {
            IsThreeState: false,
            Template: new ControlTemplate((templatedParent: ToggleButton) => templatedParent.template)
        }

    );

    private get template(): JSX.Element {
        const textStyle: IStyle = {
            fontFamily: this.state.FontFamily,
            color: this.state.Foreground
        };
        if (this.state.FontSize)
            textStyle.fontSize = `${this.state.FontSize}px`;

        //const style: IToggleStyles = {
        const styles: any = {
            label: textStyle,
            text: textStyle
        };

        return (
            <Toggle
                checked={this.state.IsChecked}
                onChange={() => super.OnClick()}
                label={this.state.Label}
                onText={this.state.CheckedText}
                offText={this.state.UncheckedText}
                styles={styles}
                //inlineLabel={true}
            />
        );
    }
}