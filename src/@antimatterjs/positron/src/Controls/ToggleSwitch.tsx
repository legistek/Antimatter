import * as React from "react";
import { Binding, BindingMode } from "@antimatterjs/react";
import { WebStyle } from '../Style';
import { ControlTemplate } from '../FrameworkTemplate';

import
    {
        IStyle,
        IToggleStyles,
        Toggle
    } from '@fluentui/react';
import { FontStyle, SemanticColor, Theme, ThemeColor, ThemeLayout } from '../Theme';
import { IToggleButtonProps, IToggleButtonState, ToggleButtonBase } from "./Primitives/ToggleButton";

export interface IToggleSwitchProps extends IToggleButtonProps
{
    NoActiveStyle?: boolean,
    CheckedText?: string | Binding,
    UncheckedText?: string | Binding,
}

export class ToggleSwitch extends ToggleButtonBase<IToggleSwitchProps, IToggleButtonState> {
    static DefaultStyle: WebStyle<IToggleButtonProps> = new WebStyle<IToggleButtonProps>(
        {
            IsThreeState: false,
            FontFamily: FontStyle.FontFamily,
            Template: new ControlTemplate((templatedParent: ToggleSwitch) => templatedParent.template)
        }
    );

    public get NoActiveStyle(): boolean
    {
        return this.GetValue(nameof(this.props.NoActiveStyle), false);
    }

    public get CheckedText(): string | undefined
    {
        return this.GetValue(nameof(this.props.CheckedText));
    }

    public get UncheckedText(): string | undefined
    {
        return this.GetValue(nameof(this.props.UncheckedText));
    }

    private get template(): JSX.Element
    {
        const textStyle: IStyle = {
            fontFamily: this.FontFamily,
            fontSize: this.FontSize,
            fontWeight: this.FontWeight,
            color: this.Foreground
        };
        var pillStyle: IStyle = {};
        var thumbStyle: IStyle = {};

        if (this.NoActiveStyle)
        {
            pillStyle = {
                backgroundColor: Theme.Value(ThemeColor.White),
                borderColor: Theme.Value(ThemeColor.NeutralSecondary),
                selectors: {
                    ":hover": {
                        backgroundColor: Theme.Value(ThemeColor.White),
                        borderColor: Theme.Value(ThemeColor.Black),
                    }
                }
            };
            thumbStyle = {
                backgroundColor: Theme.Value(ThemeColor.NeutralSecondary),
                selectors: {
                    ":hover": {
                        backgroundColor: Theme.Value(ThemeColor.Black)
                    }
                }
            };
        }

        return (
            <Toggle
                checked={this.state.IsChecked}
                onChange={() => super.OnClick()}
                disabled={!this.IsEnabled}
                label={this.Label}
                onText={this.CheckedText}
                offText={this.UncheckedText}
                inlineLabel={this.LabelIsInline}
                styles={{
                    label: textStyle,
                    text: textStyle,
                    pill: pillStyle,
                    thumb: thumbStyle,
                    root: {
                        margin: "0px"   // we set margins, not Microsoft
                    }
                }}
            />
        );
    }

    //Disable normal click handler, which is covered by Toggle element's onChange callback here
    override OnClick(e?: React.MouseEvent)
    {
        e?.preventDefault();
    }
}