import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { Autofill, IconType, ITextField, TextField } from '@fluentui/react';
import { WebStyle } from '../Style';
import { ControlTemplate } from '../FrameworkTemplate';
import { FontStyle, SemanticColor, Theme } from '../Theme';

interface ITextBoxCommon
{
    IsPassword?: boolean
}

export interface ITextBoxProps extends IControlProps, ITextBoxCommon
{
    Text?: string | Binding,
    PlaceholderText?: string | Binding,
    Label?: string | Binding,
    IconName?: string | Binding,
    ValidationError?: string,
    SelectOnFocus?: boolean|Binding,
}
export interface ITextBoxState extends IControlState, ITextBoxCommon
{
    Text?: string,
    Label?: string,
    ValidationError?: string,
    IconName?: string
}

export class TextBox extends Control<ITextBoxProps, ITextBoxState>
{
    _field: ITextField | null = null;

    public static DefaultBindings = {
        Text: {
            Mode: BindingMode.TwoWay,
            ValidatesOnDataErrors: true
        }
    };
    static DefaultStyle: WebStyle<ITextBoxProps> = new WebStyle(
        {
            BorderBrush: SemanticColor.ButtonBorder,
            FontFamily: FontStyle.FontFamily,
            Foreground: SemanticColor.BodyText,
            Template: new ControlTemplate((templatedParent: TextBox) =>
            (
                <TextField
                    onFocus={(e) =>
                    {
                        if (templatedParent.SelectOnFocus)
                            templatedParent._field?.select();
                    }}
                    componentRef={(cr) =>
                    {
                        templatedParent._field = cr;
                    }}
                    type={templatedParent.state.IsPassword ? "password" : undefined}
                    iconProps={
                        {
                            iconName: templatedParent.IsInvalid ? "Warning" : templatedParent.state.IconName,
                            styles: {
                                root: {
                                    color: templatedParent.IsInvalid ? Theme.Value(SemanticColor.Error) : Theme.Value(SemanticColor.InputIcon)
                                }
                            }
                        }
                    }
                    placeholder={templatedParent.PlaceholderText}
                    deferredValidationTime={1000}
                    styles={{
                        root: {
                            width: "100%",
                        },                        
                        field: {
                            selectors: {                                
                            },
                            color: templatedParent.Foreground,
                            fontFamily: templatedParent.FontFamily,
                            fontSize: templatedParent.FontSize,
                            fontWeight: templatedParent.state.FontWeight,
                            margin: 0,
                            padding: templatedParent.state.Padding || "5px"
                        },
                        fieldGroup: {
                            height: "auto",
                            borderColor: templatedParent.BorderBrush,
                            //selectors: {
                            //    "::after": {
                            //        borderColor: "green"
                            //    }
                            //}
                        },
                    }}
                    autoAdjustHeight={true}
                    label={templatedParent.state.Label}
                    value=
                    {
                        (templatedParent.state.Text === null || templatedParent.state.Text === undefined)
                            ? ''
                            : templatedParent.state.Text
                    }
                    onChange={(event, newValue) =>
                        templatedParent.SetValue(nameof(templatedParent.state.Text), newValue)
                    }
                    //onGetErrorMessage={(value: string) =>
                    //{
                    //    return templatedParent.state.ValidationError;
                    //}}
                />
            ))
        },
        {
            "@ .ms-TextField-field::placeholder": {
                fontFamily: Theme.Value(FontStyle.FontFamily)
            },
            "@.validation-error .ms-TextField-field": {
                background: Theme.Value(SemanticColor.ErrorBackground),                
            },
            "@.validation-error .ms-TextField-fieldGroup": {
                borderColor: Theme.Value(SemanticColor.Error),
            },
            "@ .ms-TextField-fieldGroup:after": {
                borderColor: Theme.Value(SemanticColor.FocusBorder),
            },
            "@.validation-error .ms-TextField-fieldGroup:after": {
                borderColor: Theme.Value(SemanticColor.Error)
            },
            "@ .ms-Label": {
                padding: "0px",
                fontFamily: Theme.Value(FontStyle.FontFamily)
            },
            "@:not(.validation-error) .ms-TextField-fieldGroup:hover": {
                borderColor: Theme.Value(SemanticColor.InputBorderHovered)
            },
            [Control.DisabledElement("ms-Label")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText),
            },
            [Control.DisabledElement("ms-TextField-field")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText),
            },
            [Control.DisabledElement("ms-TextField-fieldGroup")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText),
                background: Theme.Value(SemanticColor.DisabledBackground)
            }
        }
    );

    public get PlaceholderText(): string|undefined
    {
        return this.GetValue(nameof(this.props.PlaceholderText));
    }

    public get SelectOnFocus(): boolean
    {
        return this.GetValue(nameof(this.props.SelectOnFocus), true);
    }

    private get IsInvalid(): boolean
    {
        return this.GetValue(nameof(this.state.ValidationError));
    }

    constructClasses()
    {
        return super.constructClasses() + (this.IsInvalid ? " validation-error " : "");
    }

    NotifyValidationError(error?: string)
    {
        if (this.state.ValidationError !== error)
        {            
            this.setState({ ValidationError: error });
        }
    }
}