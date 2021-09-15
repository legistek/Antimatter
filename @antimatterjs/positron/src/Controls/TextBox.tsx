import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { Autofill, IconType, ITextField, TextField } from '@fluentui/react';
import { TemplateProp, WebStyle } from '../Style';
import { ControlTemplate } from '../FrameworkTemplate';
import { FontStyle, SemanticColor, Theme, ThemeLayout } from '../Theme';
import { Grid } from './Grid';
import { TextBlock } from './TextBlock';
import { Panel } from './Panel';

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
    ValidationError?: string,
    IconName?: string
}

export class TextBox extends Control<ITextBoxProps, ITextBoxState>
{
    public get Text(): string | undefined
    {
        return this.GetValue(nameof(this.props.Text));
    }

    public get Label(): string | undefined
    {
        return this.GetValue(nameof(this.props.Label));
    }

    public get ValidationError(): string | undefined
    {
        return this.GetValue(nameof(this.props.ValidationError));
    }

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
            Background: SemanticColor.BodyBackground,
            BorderThickness: ThemeLayout.StandardBorder,
            Padding: "5px",
            FontSize: FontStyle.Medium,
            Template: new ControlTemplate((templatedParent: TextBox) => (
                <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                    <TextBlock
                        ClassName="tb-label"
                        FontWeight="bold"
                        Foreground={TemplateProp(nameof<ITextBoxProps>(p => p.Foreground))}
                        Text={templatedParent.Label} />

                    <Panel TabIndex={-1} ClassName="tb-input-panel">
                        <input
                            ref={r => templatedParent._input = r}
                            value={templatedParent.Text}
                            onChange={(e) =>
                            {
                                templatedParent.SetValue(nameof(templatedParent.Text), templatedParent._input?.value)
                            }}
                            onFocus={() =>
                            {
                                templatedParent.IsFocused = true;
                                if (templatedParent.SelectOnFocus)
                                    templatedParent._input?.select();
                            }}
                            onBlur={() => templatedParent.IsFocused = false}
                            className="tb-input" />
                    </Panel>
                </Grid>
            ))
        },
        {
            "@": {
            },
            "@ .tb-label": {
                gridRow: 1,
            },
            "@ .tb-input": {
                gridRow: 2,
                background: TemplateProp(nameof<ITextBoxProps>(p => p.Background)),
                borderColor: TemplateProp(nameof<ITextBoxProps>(p => p.BorderBrush)),
                borderWidth: TemplateProp(nameof<ITextBoxProps>(p => p.BorderThickness)),
                padding: TemplateProp(nameof<ITextBoxProps>(p => p.Padding)),
                borderStyle: "solid",
                color: TemplateProp(nameof<ITextBoxProps>(p => p.Foreground)),
                fontFamily: TemplateProp(nameof<ITextBoxProps>(p => p.FontFamily)),
                fontSize: TemplateProp(nameof<ITextBoxProps>(p => p.FontSize)),
            },
            "@ .tb-input:focus": {
                outline: "none",
                //borderStyle: "none"
            },
            "@.focused .tb-input-panel::after": {
                content: "''",
                pointerEvents: "none",
                position: "absolute",
                boxSizing: "border-box",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                borderRadius: "0",
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: Theme.Value(SemanticColor.FocusBorder)
            },
            "@.validation-error .tb-input": {
                background: Theme.Value(SemanticColor.ErrorBackground),
                borderColor: Theme.Value(SemanticColor.Error)
            },
            "@.validation-error.focused .tb-input-panel::after": {
                borderColor: Theme.Value(SemanticColor.Error)
            }
        }
    );

    static DefaultStyle_a: WebStyle<ITextBoxProps> = new WebStyle(
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
                            fontWeight: templatedParent.FontWeight,
                            margin: 0,
                            padding: templatedParent.Padding || "5px"
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
                    label={templatedParent.Label}
                    value=
                    {
                        (templatedParent.Text === null || templatedParent.Text === undefined)
                            ? ''
                            : templatedParent.Text
                    }
                    onChange={(event, newValue) =>
                        templatedParent.SetValue(nameof(templatedParent.Text), newValue)
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
        return this.ValidationError !== undefined;
    }

    private _isFocused: boolean = false;
    public get IsFocused(): boolean
    {
        return this._isFocused;
    }
    public set IsFocused(value: boolean)
    {
        if (value === this._isFocused)
            return;
        this._isFocused = value;
        this.InvalidateRender();
    }

    constructClasses()
    {
        return super.constructClasses()
            + (this.IsInvalid ? " validation-error " : "")
            + (this.IsFocused ? " focused " : "");
    }

    NotifyValidationError(error?: string)
    {
        if (this.ValidationError !== error)
            this.SetValue(nameof(this.props.ValidationError), error, true, true);
    }

    _field: ITextField | null = null;
    _input: HTMLInputElement | null = null;
}