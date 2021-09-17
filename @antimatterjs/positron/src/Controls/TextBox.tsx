import * as React from 'react';
import { Binding, BindingMode, PropertyChangedEventArgs, Utilities } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { Autofill, IconType, ITextField, TextField } from '@fluentui/react';
import { TemplateProp, WebStyle } from '../Style';
import { ControlTemplate } from '../FrameworkTemplate';
import { FontStyle, SemanticColor, Theme, ThemeColor, ThemeEffect, ThemeLayout } from '../Theme';
import { Grid } from './Grid';
import { ITextBlockProps, TextBlock } from './TextBlock';
import { Panel } from './Panel';
import { Glyph } from './Glyph';
import { HorizontalAlignment, ScrollBarVisibility, VerticalAlignment } from '../Enums';
import { CSSClasses } from '../CSSClasses';

export interface ITextBoxProps extends IControlProps
{
    MinWidth?: string,
    MaxHeight?: string,
    AcceptsReturn?: boolean | Binding,
    IsPassword?: boolean | Binding,
    IsReadOnly?: boolean,
    Text?: string | Binding,
    PlaceholderText?: string | Binding,
    Label?: string | Binding,
    Icon?: number | string | Binding,    
    SelectOnFocus?: boolean|Binding,
}
export interface ITextBoxState extends IControlState
{    
}

export class TextBox extends Control<ITextBoxProps, ITextBoxState>
{
    // #region Properties

    public get Text(): string | undefined
    {
        return this.GetValue(nameof(this.props.Text));
    }
    public set Text(value: string | undefined)
    {
        if (this.Text === value)
            return;
        this.SetValue(
            nameof(this.props.Text),
            value,
            false);
        this.PropertyChanged?.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.props.Text)));
    }

    public get PlaceholderText(): string | undefined
    {
        return this.GetValue(nameof(this.props.PlaceholderText));
    }

    public get SelectOnFocus(): boolean
    {
        return this.GetValue(nameof(this.props.SelectOnFocus), true);
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

    public get AcceptsReturn(): boolean
    {
        return this.GetValue(nameof(this.props.AcceptsReturn), false);
    }

    public get MinWidth(): string | undefined
    {
        return this.GetValue(nameof(this.props.MinWidth));
    }

    public get MaxHeight(): string | undefined
    {
        return this.GetValue(nameof(this.props.MaxHeight));
    }

    public get Label(): string | undefined
    {
        return this.GetValue(nameof(this.props.Label));
    }

    public get IsReadOnly(): boolean
    {
        return this.GetValue(nameof(this.props.IsReadOnly), false);
    }

    public get Icon(): string | number | undefined
    {
        return this.GetValue(nameof(this.props.Icon));
    }

    public get IsPassword(): boolean
    {
        return this.GetValue(nameof(this.props.IsPassword), false);
    }
    
    private get SafeText(): string
    {
        if (!this.Text)
            return '';

        return Utilities.escapeHTML(this.Text).replace('\n', '<br>');
    }

    // #endregion properties

    public static DefaultBindings = {
        Text: {
            Mode: BindingMode.TwoWay,
            ValidatesOnDataErrors: true
        }
    };

    static PlaceholderTextBlockStyle: WebStyle<ITextBlockProps> = new WebStyle(
        {
            FontFamily: TemplateProp("FontFamily"),
            FontSize: TemplateProp("FontSize"),
            VerticalAlignment: VerticalAlignment.Center,
            Foreground: SemanticColor.DisabledText,
            Overlaps: true,
        },
        {
            "@": {
                whiteSpace: "nowrap"
            }
        }
    );

    static DefaultStyle: WebStyle<ITextBoxProps> = new WebStyle(
        {
            BorderBrush: SemanticColor.ButtonBorder,
            FontFamily: FontStyle.FontFamily,
            Foreground: SemanticColor.BodyText,
            MinWidth: "150px",
            Background: SemanticColor.BodyBackground,
            BorderThickness: ThemeLayout.StandardBorder,
            Padding: "5px",
            FontSize: FontStyle.Medium,
            Template: new ControlTemplate((templatedParent: TextBox) => (
                <Grid
                    ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}
                    RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                    {
                        templatedParent.Label &&
                        (<TextBlock
                            ClassName="tb-label"
                            FontWeight="bold"
                            Foreground={TemplateProp(nameof<ITextBoxProps>(p => p.Foreground))}
                            Grid={{ Column: 0, Row: 0 }}                            
                            Text={templatedParent.Label} />)
                    }

                    <Panel
                        TabIndex={-1} ClassName="tb-input-panel"                        
                        Grid={{ Column: 0, Row: 1 }}>
                        <span
                            className="tb-input"
                            contentEditable={!templatedParent.IsReadOnly}
                            ref={r => templatedParent._input = r}
                            placeholder={templatedParent.PlaceholderText}

                            onPaste={(e) =>
                            {
                                e.preventDefault();
                                if (!e.nativeEvent.clipboardData)
                                    return;
                                var text = e.nativeEvent.clipboardData.getData('text');
                                if (!text)
                                    return;
                                const selection = window.getSelection();
                                if (!selection)
                                    return;
                                if (!selection.rangeCount)
                                    return false;
                                selection.deleteFromDocument();
                                selection.getRangeAt(0).insertNode(document.createTextNode(text));
                                selection.collapseToEnd();
                            }}
                            onKeyDown={async (e) =>
                            {
                                if (!templatedParent.AcceptsReturn && e.key === 'Enter')
                                {
                                    e.preventDefault();
                                    return;
                                }
                                await Utilities.SleepAsync(1);
                                templatedParent.Text = templatedParent._input?.innerText;
                            }}
                            onFocus={() =>
                            {
                                if (!templatedParent._suspendFocusHandler)
                                    templatedParent.IsFocused = true;
                                if (templatedParent.SelectOnFocus && templatedParent._input)
                                    Utilities.SelectElementContents(templatedParent._input);       
                            }}
                            dangerouslySetInnerHTML={{
                                __html: templatedParent.SafeText
                            }}
                            onBlur={() =>
                            {
                                if (!templatedParent._suspendFocusHandler)
                                    templatedParent.IsFocused = false;
                            }} />
                                                    
                        <TextBlock
                            ClassName="tb-placeholder"
                            Margin={templatedParent.Icon ? "0px 0px 0px 28px" : "0px"}
                            Style={TextBox.PlaceholderTextBlockStyle}                            
                            IsVisible={new Binding({
                                Path: nameof(templatedParent.Text),
                                Source: templatedParent,
                                Converter: (t?: string) => t === undefined || t.length === 0
                            })}                            
                            Overlaps={true}
                            Text={templatedParent.PlaceholderText} />                        

                        {
                            templatedParent.IsInvalid &&
                            (<Glyph
                                ClassName="tb-warning-glyph"
                                ToolTip={templatedParent.ValidationError}
                                Margin={"0px 5px 0px 5px"}
                                Overlaps={true}
                                FontSize={FontStyle.Glyph1x}
                                Foreground={ThemeColor.Red}
                                VerticalAlignment={VerticalAlignment.Center}
                                Icon="Warning"
                                HorizontalAlignment={HorizontalAlignment.Right} />)
                        }
                        {
                            templatedParent.Icon &&
                            (<Glyph
                                Icon={templatedParent.Icon}
                                Foreground={SemanticColor.DisabledText}
                                Overlaps={true}
                                Margin="0px 0px 0px 5px"
                                HorizontalAlignment={HorizontalAlignment.Left}
                                VerticalAlignment={VerticalAlignment.Center} />)
                        }
                    </Panel>

                    {templatedParent.InfoTip && (
                        <Glyph
                            Margin="0px 0px 0px 5px"
                            Grid={{Column: 1, Row: 1}}
                            ClassName="tb-infotip"
                            Icon="Info"
                            VerticalAlignment={VerticalAlignment.Center}
                            Foreground={ThemeColor.ThemePrimary}
                            ToolTip={templatedParent.InfoTip} />)}

                </Grid>
            ))
        },
        {
            "@ .tb-input": {
                gridRow: 2,
                width: "100%",
                overflowX: "auto",
                alignSelf: "center",
                margin: TemplateProp(nameof<ITextBoxProps>(p => p.Padding)),
                color: TemplateProp(nameof<ITextBoxProps>(p => p.Foreground)),
                fontFamily: TemplateProp(nameof<ITextBoxProps>(p => p.FontFamily)),
                fontSize: TemplateProp(nameof<ITextBoxProps>(p => p.FontSize)),
            },
            "@.accepts-return .tb-input": {
                overflowX: "hidden",
                alignSelf: "unset"
            },
            "@:not(.accepts-return) .tb-input::-webkit-scrollbar": {
                width: 0,
                height: 0
            },
            "@ .tb-input-panel": {
                borderStyle: "solid",
                boxShadow: Theme.Value(ThemeEffect.ControlInnerShadow),
                borderRadius: Theme.Value(ThemeLayout.StandardBorderRadius),
                maxHeight: TemplateProp(nameof<ITextBoxProps>(p => p.MaxHeight)),
                minWidth: TemplateProp(nameof<ITextBoxProps>(p => p.MinWidth)),
                background: TemplateProp(nameof<ITextBoxProps>(p => p.Background)),
                borderColor: TemplateProp(nameof<ITextBoxProps>(p => p.BorderBrush)),
                borderWidth: TemplateProp(nameof<ITextBoxProps>(p => p.BorderThickness)),
            },
            "@ .tb-input-panel:hover": {
                borderColor: Theme.Value(SemanticColor.InputBorderHovered)
            },
            "@.focused .tb-input-panel": {
                borderColor: Theme.Value(SemanticColor.FocusBorder),
            },
            "@:not(.accepts-return) span": {
                whiteSpace: "nowrap !important" as any
            },
            [`@:not(.${CSSClasses.HAStretch}) .tb-input`]: {
                width: "fit-content",
            },
            "@.read-only .tb-input-panel": {
                background: Theme.Value(SemanticColor.DisabledBackground),
            },
            "@ .tb-placeholder": {
                pointerEvents: "none"
            },
            "@ .tb-input:focus": {
                outline: "none",
            },
            "@ .tb-infotip": {
                cursor: "pointer"
            },
            "@.has-icon .tb-input": {
                marginLeft: "28px"
            },
            "@.focused .tb-input-panel::after": {
                content: "''",
                pointerEvents: "none",
                position: "absolute",
                boxSizing: "border-box",
                top: "0",
                left: "0",
                minWidth: "fit-content",
                width: "100%",
                height: "100%",
                borderRadius: "0",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: Theme.Value(SemanticColor.FocusBorder)
            },
            [`@.${Control.STATE_ValidationError} .tb-input`]: {
                marginRight: "24px"
            },
            [`@.${Control.STATE_ValidationError} .tb-input-panel`]: {
                background: Theme.Value(SemanticColor.ErrorBackground),
                borderColor: Theme.Value(SemanticColor.Error),
                boxShadow: "none"
            },
            [`@.${Control.STATE_ValidationError}.focused .tb-input-panel::after`]: {
                borderColor: Theme.Value(SemanticColor.Error)
            },
            [`@.${Control.STATE_ValidationError} .tb-warning-glyph`]: {
                cursor: "pointer"
            },
            [Control.DisabledElement("tb-label")]: {
                color: `${Theme.Value(SemanticColor.DisabledBodyText)} !important`,
            },
            [Control.DisabledElement("tb-input-panel")]: {                
                background: Theme.Value(SemanticColor.DisabledBackground),
                boxShadow: "none"
            },
            [Control.DisabledElement("tb-input")]: {
                color: Theme.Value(SemanticColor.DisabledText),
            }
        }
    );
    
    override constructClasses()
    {
        return super.constructClasses()            
            + (this.IsFocused ? " focused " : "")
            + (this.IsReadOnly ? " read-only " : "")
            + (this.Icon ? " has-icon " : "")
            + (this.AcceptsReturn ? " accepts-return " : "");
    }

    _field: ITextField | null = null;
    _input: HTMLSpanElement | null = null;
    _suspendFocusHandler: boolean = false;
}