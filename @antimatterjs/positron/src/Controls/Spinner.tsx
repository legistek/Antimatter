import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { IStyle, Position, SpinButton } from '@fluentui/react';
import { Control, IControlProps, IControlState } from './Control';
import { ControlTemplate } from '../FrameworkTemplate';
import { Style } from '../Style';
import { FontStyle, Theme } from '../Theme';

interface ISpinnerProps extends IControlProps {
    Value?: number | Binding,
    MaxValue?: number | Binding,
    MinValue?: number | Binding,
    StepIncrement?: number | Binding,
    Label?: string | Binding,
    LabelIsInline?: boolean | Binding
}
interface ISpinnerState extends IControlState {
    Value?: number,
    MaxValue?: number,
    MinValue?: number,
    StepIncrement?: number,
    Label?: string,
    LabelIsInline?: boolean
}
export class Spinner extends Control<ISpinnerProps, ISpinnerState>
{

    public static DefaultStyle: Style<ISpinnerProps> = new Style<ISpinnerProps>(
        {
            Value: 0,
            FontFamily: FontStyle.FontFamily,
            Template: new ControlTemplate((templatedParent: Spinner) => templatedParent.template)
        }
    );

    private get template(): JSX.Element
    {
        const textValue: string = this.state.Value?.toString() || '0';
        const labelPosition: Position = this.props.LabelIsInline ? Position.start : Position.top;

        return (
            <SpinButton
                value={textValue}
                onChange={(event, newValue?: string) => this.OnChange(newValue)}
                max={this.state.MaxValue}
                min={this.state.MinValue}
                step={this.state.StepIncrement}
                label={this.state.Label}
                labelPosition={labelPosition}
                styles={{
                    label: {
                        fontFamily: this.FontFamily,
                        color: this.Foreground,
                        fontSize: this.FontSize,
                        lineHeight: "unset",
                        alignSelf: "center",
                        padding: "0px"
                    },
                    input: {
                        fontFamily: this.FontFamily,
                        color: this.Foreground,
                        fontSize: this.FontSize,
                        lineHeight: "unset",
                        alignSelf: "center",
                    },
                    spinButtonWrapper: {
                        height: "fit-content"
                    }
                }}
                disabled={this.state.IsEnabled === false}
            />
        );
    }

    public static DefaultBindings = {
        Value: {
            FallbackValue: 0,
            Mode: BindingMode.TwoWay
        }
    };

    private OnChange(newValue?: string): void {
        if (!newValue)
            return;
        const numericValue: number = +newValue;
        this.SetValue(nameof(this.state.Value), numericValue);
    }
}