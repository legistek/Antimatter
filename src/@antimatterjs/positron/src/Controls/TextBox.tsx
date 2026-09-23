import * as React from 'react';
import { Antimatter, Binding, BindingMode, ModelObjectReference, PropertyChangedEventArgs, RelativeSourceMode, Span, Utilities } from '@antimatterjs/react';

import { Control, IControlProps, IControlState } from './Control';
import { Style, TemplateProp, WebStyle } from '../Style';
import { ControlTemplate } from '../FrameworkTemplate';
import { FontStyle, SemanticColor, Theme, ThemeColor, ThemeEffect, ThemeLayout } from '../Theme';
import { Grid } from './Grid';
import { ITextBlockProps, TextBlock } from './TextBlock';
import { Panel } from './Panel';
import { Glyph } from './Glyph';
import { HorizontalAlignment, Orientation, ScrollBarVisibility, VerticalAlignment } from '../Enums';
import { CSSClasses } from '../CSSClasses';
import { FrameworkElement } from '../FrameworkElement';
import { CommandButton } from './CommandButton';
import { StackPanel } from './StackPanel';

export interface ITextBoxProps extends IControlProps
{
    MinWidth?: number | string,
    AutoCompleteID?: string,
    SubmitCommand?: ModelObjectReference | Binding | ((commandParameter: any) => void),
    CancelCommand?: ModelObjectReference | Binding | ((commandParameter: any) => void),
    SaveCommand?: ModelObjectReference | Binding | ((commandParameter: any) => void),
    AcceptsReturn?: boolean | Binding,
    IsPassword?: boolean | Binding,
    IsReadOnly?: boolean | Binding,
    Text?: string | Binding,
    PlaceholderText?: string | Binding,
    Label?: string | Binding,
    CanCopy?: boolean | Binding,
    LabelIsInline?: boolean | Binding,
    LabelWidth?: number | string,
    Icon?: number | string | Binding,
    SelectOnFocus?: boolean | Binding,
    IsFocused?: boolean | Binding,
    AutoFocus?: boolean | Binding,
    EditMode?: boolean | Binding,
    HasEditControls?: boolean,
    HasEditModeToggle?: boolean | Binding,
    HasClearButton?: boolean | Binding,
    HasCopyButton?: boolean | Binding,
    HasPasteButton?: boolean | Binding,
    CanSubmit?: boolean | Binding,
    CancelUnsubmittedEdits?: boolean,
    TextBlockMaxLines?: number,
    BypassPWManager?: boolean         //Only applicable if IsPassword=true; currently Chrome-specific
}
export interface ITextBoxState extends IControlState
{
}
const model: ITextBoxProps = {};

export class TextBox<P extends ITextBoxProps = ITextBoxProps, S extends ITextBoxState = ITextBoxState> extends Control<P, S>
{
    public static readonly PART_BreakAnywhere: string = Antimatter.Identifier("tb-break-anywhere");
    public static readonly PART_CustomPW: string = "tb-custom-password";

    // #region Properties

    public get CanCopy(): boolean
    {
        return this.GetValue(nameof(this.props.CanCopy), false);
    }

    public get AutoCompleteID(): string | undefined
    {
        return this.GetValue(nameof(this.props.AutoCompleteID));
    }

    public get AutoFocus(): boolean
    {
        return this.GetValue(nameof(this.props.AutoFocus));
    }

    public get EditMode(): boolean
    {
        return this.GetValue(nameof(this.props.EditMode), true);
    }
    public get HasEditControls(): boolean
    {
        return this.GetValue(nameof(this.props.HasEditControls), false);
    }
    public get HasEditModeToggle(): boolean
    {
        return this.GetValue(nameof(this.props.HasEditModeToggle), false);
    }
    public get CanSubmit(): boolean
    {
        return this.GetValue(nameof(this.props.CanSubmit), true);
    }
    public get CancelUnsubmitteddEdits(): boolean
    {
        return this.GetValue(nameof(this.props.CancelUnsubmittedEdits), false);
    }
    public get TextBlockMaxLines(): number
    {
        return this.GetValue(nameof(this.props.TextBlockMaxLines), 0);
    }

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
            !this.AcceptsReturn);
        this.PropertyChanged?.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.props.Text)));
    }

    public get SubmitCommand(): ModelObjectReference | ((commandParameter: any) => void) | undefined
    {
        return this.GetValue(nameof(this.props.SubmitCommand));
    }

    public get CancelCommand(): ModelObjectReference | ((commandParameter: any) => void) | undefined
    {
        return this.GetValue(nameof(this.props.CancelCommand));
    }

    public get SaveCommand(): ModelObjectReference | ((commandParameter: any) => void) | undefined
    {
        return this.GetValue(nameof(this.props.SaveCommand));
    }

    public get PlaceholderText(): string | undefined
    {
        return this.GetValue(nameof(this.props.PlaceholderText));
    }

    public get SelectOnFocus(): boolean
    {
        return this.GetValue(nameof(this.props.SelectOnFocus), true);
    }

    public get HasClearButton(): boolean
    {
        return this.GetValue(nameof(this.props.HasClearButton), false);
    }

    public get HasCopyButton(): boolean
    {
        return this.GetValue(nameof(this.props.HasCopyButton), false);
    }

    public get HasPasteButton(): boolean
    {
        return this.GetValue(nameof(this.props.HasPasteButton), false);
    }

    public get IsFocused(): boolean
    {
        return this.GetValue(nameof(this.props.IsFocused), false);
    }
    public set IsFocused(value: boolean)
    {
        if (value === this.IsFocused)
            return;
        this.SetValue(nameof(this.props.IsFocused), value, true);
        // For when this is set from Javascript (other than a binding)
        this.UpdateInputElementFocus(value);
    }

    public get AcceptsReturn(): boolean
    {
        return this.GetValue(nameof(this.props.AcceptsReturn), false);
    }

    public get MinWidth(): string | undefined
    {
        return this.GetValue(nameof(this.props.MinWidth));
    }

    public get Label(): string | undefined
    {
        return this.GetValue(nameof(this.props.Label));
    }

    public get LabelIsInline(): boolean | undefined {
        return this.GetValue(nameof(this.props.LabelIsInline));
    }
    public get LabelWidth(): string | undefined {
        return this.GetValue(nameof(this.props.LabelWidth));
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
    public get BypassPWManager(): boolean
    {
        return this.GetValue(nameof(this.props.BypassPWManager), false);
    }

    protected /* virtual */ get AllowHtmlContent(): boolean
    {
        return false;
    }

    protected get SafeText(): string
    {
        if (!this.Text)
            return '';

        return Utilities.escapeHTML(this.Text).replace('\n', '<br>');
    }

    override getCSSStyles()
    {
        return super.getCSSStyles();
    }

    // #endregion properties

    override async OnComponentMount()
    {
        if (this.Container) {
            this.Container.ondblclick = (e) => {
                if (!this.EditMode)
                    return;
                e.preventDefault();
                e.stopPropagation();
            };
            this.Container.oncontextmenu = (e) =>
            {
                if (!this.EditMode)
                    return;
                e.preventDefault();
                e.stopPropagation();
            };
        }
        await this.TriggerAutoFocus();
    }

    public static DefaultBindings = {
        Text: {
            Mode: BindingMode.TwoWay,
            ValidatesOnDataErrors: true
        },
        CanSubmit: {
            FallbackValue: true
        },
        IsFocused: {
            Mode: BindingMode.TwoWay,
        },
        EditMode: {
            Mode: BindingMode.TwoWay
        }
    };

    static PlaceholderTextBlockStyle: Style<ITextBlockProps> = new WebStyle(
        {
            VerticalAlignment: VerticalAlignment.Center,
            Foreground: SemanticColor.DisabledText,
            //Overlaps: true,
        },
        {
            "@": {
                textOverflow: "ellipsis"
            }
        },
        TextBlock.DefaultStyle
    );

    private ConstructStandardInputElement(): JSX.Element
    {
        let align: string | undefined = undefined;
        if (this.VerticalContentAlignment === VerticalAlignment.Center)
        {
            align = "center";
        }

        var className: string = `tb-input ${CSSClasses.Base}`;
        if (this.VerticalContentAlignment !== VerticalAlignment.Stretch)
            className += ` ${FrameworkElement.GetClassForVerticalAlignment(this.VerticalContentAlignment)}`;

        //For PW inputs to be ignored by the PW manager, use CSS instead of input type
        //(prop has limited browser support & is applied in positron.css since it's not in StandardLonghandProperties)
        const isChrome: boolean = Utilities.GetBrowser().Name == "Chrome";
        const customPW: boolean = isChrome && this.IsPassword && this.BypassPWManager;
        if (customPW)
            className += ` ${TextBox.PART_CustomPW}`;

        const type: React.HTMLInputTypeAttribute = (this.IsPassword && !customPW) ? 'password' : 'text';

        return (
            <input
                value={this.Text}
                autoComplete={this.AutoCompleteID}
                placeholder={this.PlaceholderText}
                className={className}
                readOnly={this.IsReadOnly}
                ref={r => { this._input = r; } }
                style={{
                    alignSelf: align,
                }}
                tabIndex={0}
                id={this.AutoCompleteID}
                disabled={!this.IsEnabled}
                type={type}
                onKeyDown={
                    (e) =>
                        this.OnKeyDown(e)
                }
                onFocus={(() =>
                {
                    if (!this._suspendFocusHandler)
                        this.IsFocused = true;
                    if (this.SelectOnFocus && this._input)
                        (this._input as HTMLInputElement).select();
                }).bind(this)}
                onChange={
                    (e) =>
                        this.Text = e.target.value
                }
                onBlur={(() =>
                {
                    if (!this._suspendFocusHandler)
                        this.IsFocused = false;
                }).bind(this)}
                onClick={e =>
                {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onDoubleClick={e =>
                {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            />
        );
    }

    private ManuallySetText(text?: string)
    {
        if (!this._input)
            return;
        if (!this.AcceptsReturn)
            (this._input as HTMLInputElement).value = text || "";
        else
            (this._input as HTMLSpanElement).innerHTML = text || "";
    }

    private ConstructCustomInputElement(): JSX.Element
    {
        let className: string = "tb-input";
        if (this.IsReadOnly && this.AcceptsReturn)
            className += ` ${TextBox.PART_BreakAnywhere}`;

        return (<span
            className={className}
            contentEditable={!this.IsReadOnly}
            ref={r => { this._input = r; } }            
            tabIndex={0}
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

                var splits = text.split(new RegExp('[\r\n]'));
                for (let i = splits.length - 1; i >= 0; i--)
                {
                    var split = splits[i];
                    if (!split)
                        continue;
                    selection.getRangeAt(0).insertNode(document.createTextNode(split));
                    if (i !== 0)
                        selection.getRangeAt(0).insertNode(document.createElement("br"));
                }

                selection.collapseToEnd();
            }}
            onKeyDown={e => this.OnKeyDown(e, true)}
            onFocus={() =>
            {
                if (!this._suspendFocusHandler)
                    this.IsFocused = true;
                if (this.SelectOnFocus && this._input)
                    Utilities.SelectElementContents(this._input);
            }}
            dangerouslySetInnerHTML={{
                __html: this.SafeText
            }}
            onBlur={() =>
            {
                if (!this._suspendFocusHandler)
                    this.IsFocused = false;
            }}
            onDoubleClick={e =>
            {
                e.preventDefault();
                e.stopPropagation();
            }}
        />);
    }

    public static BuildTemplate(templatedParent: TextBox): JSX.Element | null
    {

        if (!templatedParent.EditMode)
        {
            if ((templatedParent.Text === null || templatedParent.Text === undefined) &&
                !templatedParent.HasEditModeToggle)
                return null;

            //If text height can exceed container, align to top of scrollable area to prevent cutting off text
            //O/w keep middle-aligned to preserve position when switching to/from viewing in edit mode textbox
            const textAlign: VerticalAlignment = templatedParent.MaxHeight == null ?
                VerticalAlignment.Center : VerticalAlignment.Top;

            return (
                <Grid
                    ColumnDefinitions={[Grid.Column_Star, Grid.Column_Auto]}
                    VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                    MaxHeight={templatedParent.MaxHeight}
                    Padding={ThemeLayout.MarginSmallLTRB}
                >
                    <TextBlock Grid={{ Column: 0 }}
                        Text={templatedParent.AllowHtmlContent ? templatedParent.SafeText : templatedParent.Text}
                        DisplayAsHTML={templatedParent.AllowHtmlContent}
                        Foreground={templatedParent.Foreground}
                        FontSize={templatedParent.FontSize}
                        FontFamily={templatedParent.FontFamily}
                        FontWeight={templatedParent.FontWeight}
                        FontStyle={templatedParent.FontStyle}
                        DisplayFormatted={true}
                        CanCopy={templatedParent.CanCopy}
                        MaxLines={templatedParent.TextBlockMaxLines ? `${templatedParent.TextBlockMaxLines}` : undefined}
                        VerticalAlignment={textAlign}
                    />

                    {
                        templatedParent.HasEditModeToggle &&
                        (
                            <CommandButton Grid={{ Column: 1 }}
                                Command={() => templatedParent.EnterEditMode()}
                                Style={CommandButton.IconButtonTightStyle}
                                Icon="Edit"
                                VerticalAlignment={VerticalAlignment.Center}
                                Margin="0px 0px 0px 5px"
                            />
                        )
                    }

                </Grid>
            );
        }

        return (
            <Grid
                ref={e =>
                {
                    if (!e?.Container)
                        return;
                    e.Container.onfocus = () =>
                    {
                        templatedParent.IsFocused = true;
                    };
                    e.Container.onblur = () =>
                    {
                        templatedParent.IsFocused = false;
                    }
                }}
                TabIndex={0}
                ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true), Grid.ColumnDefinition(), Grid.ColumnDefinition(), Grid.ColumnDefinition()]}
                RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}
                Padding="0">
                {
                    templatedParent.Label &&
                    (<TextBlock
                        ClassName="tb-label"
                        FontWeight="bold"
                        Foreground={TemplateProp(nameof<ITextBoxProps>(p => p.Foreground))}
                        Grid={templatedParent.LabelIsInline ? { Column: 0, Row: 1 } : { Column: 1, Row: 0 }}
                        Text={templatedParent.Label}
                        VerticalAlignment={VerticalAlignment.Center}
                        Margin={ThemeLayout.MarginStandardR}
                        MinWidth={templatedParent.LabelWidth}
                    />)
                }

                <Grid
                    TabIndex={templatedParent.AcceptsReturn ? -1 : undefined}
                    ClassName="tb-input-panel"
                    ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition(), Grid.ColumnDefinition()]}
                    Grid={{ Column: 1, Row: 1 }}>

                    {templatedParent.IsPassword || !templatedParent.AcceptsReturn
                        ? templatedParent.ConstructStandardInputElement()
                        : templatedParent.ConstructCustomInputElement()}

                    {
                        templatedParent.AcceptsReturn &&
                        <TextBlock
                            Grid={{ Column: 0 }}
                            ClassName="tb-placeholder"
                            VerticalAlignment={templatedParent.AcceptsReturn ? VerticalAlignment.Stretch : VerticalAlignment.Center}
                            Margin={templatedParent.Icon ? "0px 0px 0px 28px" : undefined}
                            Style={TextBox.PlaceholderTextBlockStyle}
                            Overlaps={templatedParent.AcceptsReturn}
                            IsVisible={new Binding({
                                Path: nameof(templatedParent.Text),
                                Source: templatedParent,
                                Converter: (t?: string) => t === undefined || t.length === 0
                            })}
                            Text={templatedParent.PlaceholderText} />
                    }

                    {
                        templatedParent.HasClearButton &&
                        <Glyph
                            ClassName="tb-clear-button"
                            Icon="Clear"
                            VerticalAlignment={VerticalAlignment.Center}
                            OnClick={() =>
                            {
                                templatedParent.Text = undefined;
                                templatedParent.ManuallySetText(undefined);
                            }}
                            Grid={{ Column: 1 }} />
                    }

                    {
                        templatedParent.IsInvalid &&
                        (<Glyph
                            Grid={{ Column: 2 }}
                            ClassName="tb-warning-glyph"
                            ToolTip={templatedParent.ValidationError}
                            Margin={"0px 5px 0px 5px"}
                            FontSize={FontStyle.Glyph1x}
                            Foreground={ThemeColor.Red}
                            VerticalAlignment={VerticalAlignment.Center}
                            Icon="Warning"
                            HorizontalAlignment={HorizontalAlignment.Right} />)
                    }
                    {
                        templatedParent.Icon !== 0 &&
                        templatedParent.Icon !== undefined &&
                        (<Glyph
                            Grid={{ Column: 0 }}
                            Overlaps={templatedParent.AcceptsReturn}
                            Icon={templatedParent.Icon}
                            Foreground={SemanticColor.DisabledText}
                            Margin="0px 0px 0px 5px"
                            HorizontalAlignment={HorizontalAlignment.Left}
                            VerticalAlignment={VerticalAlignment.Center} />)
                    }
                </Grid>


                {templatedParent.HasEditControls && (
                    <StackPanel Grid={{ Column: 2, Row: 1 }}
                        Orientation={Orientation.Horizontal}
                        VerticalAlignment={VerticalAlignment.Center}
                    >
                        <CommandButton
                            Command={() => templatedParent.SaveEdits()}
                            IsEnabled={templatedParent.CanSubmit}
                            Style={CommandButton.IconButtonTightStyle}
                            Icon="Save"
                            Margin="0px 0px 0px 5px"
                        />
                        <CommandButton
                            Command={() => templatedParent.CancelEdits()}
                            Style={CommandButton.IconButtonTightStyle}
                            Icon="Cancel"
                            Margin="0px 0px 0px 5px"
                        />
                    </StackPanel>
                )}

                {templatedParent.InfoTip && (
                    <Glyph
                        Margin="0px 0px 0px 5px"
                        Grid={{ Column: 3, Row: 1 }}
                        ClassName="tb-infotip"
                        Icon="Info"
                        VerticalAlignment={VerticalAlignment.Center}
                        Foreground={ThemeColor.ThemePrimary}
                        ToolTip={templatedParent.InfoTip}
                    />)}

                {
                    templatedParent.HasCopyButton && (
                        <CommandButton
                            Grid={{ Column: 4, Row: 1 }}
                            Icon="Copy"
                            VerticalAlignment={VerticalAlignment.Center}
                            Style={CommandButton.IconButtonTightStyle}
                            Margin="0px 0px 0px 5px"
                            Command={() =>
                            {
                                if (!templatedParent.Text)
                                    return;
                                navigator.clipboard.writeText(templatedParent.Text);
                            }}
                        />
                    )
                }
                {
                    templatedParent.HasPasteButton && (
                        <CommandButton
                            Grid={{ Column: 4, Row: 1 }}
                            Icon="Paste"
                            VerticalAlignment={VerticalAlignment.Center}
                            Style={CommandButton.IconButtonTightStyle}
                            Margin="0px 0px 0px 5px"
                            Command={async () =>
                            {
                                templatedParent.Text = await navigator.clipboard.readText();
                            }}
                        />
                    )
                }

            </Grid>
        )
    }

    static DefaultStyle = new WebStyle<ITextBoxProps>(
        {
            BorderBrush: SemanticColor.ButtonBorder,
            FontFamily: FontStyle.FontFamily,
            Foreground: SemanticColor.BodyText,
            BorderRadius: ThemeLayout.StandardBorderRadius,
            //MinWidth: "150px",
            Background: SemanticColor.BodyBackground,
            BorderThickness: ThemeLayout.StandardBorder,
            FocusBrush: SemanticColor.FocusBorder,
            Padding: ThemeLayout.MarginStandardLTRB,
            FontSize: FontStyle.Medium,
            BoxShadow: ThemeEffect.ControlInnerShadow,
            CanSubmit: new Binding({
                Path: "IsEnabled",
                RelativeSourceMode: RelativeSourceMode.Self,
                RelativeSource: nameof(model.SubmitCommand),
                AffectsRender: false
            }),
            TextBlockMaxLines: 10,
            Template: new ControlTemplate(TextBox.BuildTemplate)
        },
        {
            "@ .tb-input": {
                gridRow: 1,
                width: "100%",
                overflowX: "auto",
                alignSelf: "center",
                borderWidth: "0px",
                userSelect: "text",
                WebkitUserSelect: "text",
                background: "transparent",
                padding: "0",
                cursor: "text",
                //margin: TemplateProp(nameof<ITextBoxProps>(p => p.Padding)),
                color: TemplateProp(nameof<ITextBoxProps>(p => p.Foreground)),
                fontFamily: TemplateProp(nameof<ITextBoxProps>(p => p.FontFamily)),
                fontSize: TemplateProp(nameof<ITextBoxProps>(p => p.FontSize))
            },
            [`@ .tb-input.${TextBox.PART_BreakAnywhere}`]: {
                lineBreak: 'anywhere',
                whiteSpace: "pre-wrap"
            },
            "@ .tb-clear-button": {
                visibility: "collapse",
                cursor: "pointer"
            },
            "@:hover .tb-clear-button": {
                visibility: "visible"
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
                padding: TemplateProp(nameof<ITextBoxProps>(p => p.Padding)),
                boxShadow: TemplateProp(nameof<ITextBoxProps>(p => p.BoxShadow)),
                borderRadius: TemplateProp(nameof<ITextBoxProps>(p => p.BorderRadius)),
                maxHeight: TemplateProp(nameof<ITextBoxProps>(p => p.MaxHeight)),
                minWidth: TemplateProp(nameof<ITextBoxProps>(p => p.MinWidth)),
                maxWidth: TemplateProp(nameof<ITextBoxProps>(p => p.MaxWidth)),
                background: TemplateProp(nameof<ITextBoxProps>(p => p.Background)),
                borderColor: TemplateProp(nameof<ITextBoxProps>(p => p.BorderBrush)),
                borderWidth: TemplateProp(nameof<ITextBoxProps>(p => p.BorderThickness)),
            },
            "@:not(.read-only) .tb-input-panel:hover": {
                borderColor: Theme.Value(SemanticColor.InputBorderHovered)
            },
            "@.focused:not(.read-only) .tb-input-panel": {
                borderColor: TemplateProp(nameof<ITextBoxProps>(p => p.FocusBrush)),
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
                display: "block",
                pointerEvents: "none",
                fontFamily: TemplateProp("FontFamily"),
                fontSize: TemplateProp("FontSize"),
            },
            "@ .tb-input:focus": {
                outline: "none",
            },
            "@ .tb-infotip": {
                cursor: "pointer"
            },
            "@.has-icon .tb-input": {
                paddingLeft: "28px"
            },
            "@.focused:not(.read-only) .tb-input-panel::after": {
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
                borderWidth: TemplateProp(nameof<ITextBoxProps>(p => p.BorderThickness)),
                borderStyle: "solid",
                borderColor: TemplateProp(nameof<ITextBoxProps>(p => p.FocusBrush)),
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

    static NarrowStyle: Style<ITextBoxProps> = new WebStyle<ITextBoxProps>(
        {
            Padding: ThemeLayout.MarginSmallLTRB,
            VerticalAlignment: VerticalAlignment.Center
        },
        {},
        this.DefaultStyle
    );

    private EnterEditMode()
    {
        this.SetValue(nameof(this.props.EditMode), true);
        this._originalText = this.Text;
    }

    private SaveEdits()
    {
        if (!this.CanSubmit)
            return;
        if (this.SubmitCommand)
            this.ExecuteCommand(this.SubmitCommand);
        this.SetValue(nameof(this.props.EditMode), false);
        this._originalText = this.Text;
    }

    private CancelEdits(): void
    {
        this.SetValue(nameof(this.props.Text), this._originalText, false, false, true);
        this.SetValue(nameof(this.props.EditMode), false);

        if (this.CancelCommand)
            this.ExecuteCommand(this.CancelCommand);
    }

    protected async OnKeyDown(e: React.KeyboardEvent, customInput: boolean = false)
    {
        if (e.key === 'Escape')
            return;

        e.stopPropagation(); // I think we always want to do this

        if (!this.AcceptsReturn || this.SubmitCommand)
        {
            if (e.key == 'Enter') {
                e.preventDefault();
                if (this.SubmitCommand && this.CanSubmit)
                    this.ExecuteCommand(this.SubmitCommand);
                return;
            }
        }

        if (e.key == "s" && e.ctrlKey && this.SaveCommand)
        {
            this.ExecuteCommand(this.SaveCommand);
            e.preventDefault();     //Ctrl+S is also the Chrome shortcut to save page as a .html file
        }

        if (customInput)
        {
            await Utilities.SleepAsync(33);
            this.Text = this._input?.innerText;
        }
    }

    override constructClasses()
    {
        return super.constructClasses()
            + (this.IsFocused ? " focused " : "")
            + (this.IsReadOnly ? " read-only " : "")
            + (this.Icon ? " has-icon " : "")
            + (this.AcceptsReturn ? " accepts-return " : "");
    }

    private UpdateInputElementFocus(newValue?: boolean)
    {
        if (newValue === true)
            this._input?.focus();
        else
            window.focus();
    }

    public override OnBoundPropertyUpdate(prop: string, value: any, oldValue: any) {
        if (prop === nameof(this.props.EditMode) && value === true && oldValue === false)
        {
            this._originalText = this.Text;
            this.TriggerAutoFocus();
        }
        else if (prop === nameof(this.props.IsFocused))
        {
            this.UpdateInputElementFocus(value);
        }
        else if (prop === nameof(this.props.Text) && this.AcceptsReturn)
        {
            this.ManuallySetText(value);
        }

        super.OnBoundPropertyUpdate(prop, value, oldValue);
    }

    override OnComponentWillUnmount()
    {
        super.OnComponentWillUnmount();
        if (this.EditMode && this.CancelUnsubmitteddEdits)
            this.CancelEdits();
    }

    private async TriggerAutoFocus(): Promise<void>
    {
        if (!this.AutoFocus && !this.IsFocused)
            return;
        await Utilities.SleepAsync(1);
        this._input?.focus();
    }

    _input: HTMLElement | null = null;
    _suspendFocusHandler: boolean = false;
    private _originalText: string | undefined;
}

export class PasswordBox extends TextBox
{
    public static DefaultStyle = new WebStyle<ITextBoxProps>(
        {
            IsPassword: true,
            BypassPWManager: true
        },
        undefined,
        TextBox.DefaultStyle
    )
}
