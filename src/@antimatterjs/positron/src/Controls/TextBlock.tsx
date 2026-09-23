import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import * as React from 'react';
import { Antimatter, Binding, BindingMode, Utilities } from '@antimatterjs/react';
import { TemplateProp, WebStyle } from '../Style';
import { FontStyle, ThemeColor, SemanticColor, Theme, ThemeLayout } from '../Theme';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { HorizontalAlignment, ScrollBarVisibility, VerticalAlignment } from '../Enums';
import { Grid } from './Grid';
import { CommandButton } from './CommandButton';
import { CSSClasses } from '../CSSClasses';
import { Application } from '../Application';


export interface ITextBlockProps extends IPanelProps
{
    Text?: string | Binding | undefined,
    Foreground?: string | Binding | ThemeColor | SemanticColor,
    FontFamily?: string | FontStyle | Binding,
    FontSize?: string | FontStyle | Binding,
    MaxLines?: string | Binding,
    FontWeight?: undefined | "bold" | "normal" | number | Binding,
    FontStyle?: undefined | "italic" | "normal" | "oblique" | Binding,
    Decoration?: undefined | string | Binding,
    MinWidth?: number | string,
    DisplayFormatted?: boolean | Binding,
    DisplayAsHTML?: boolean,
    CanSelect?: boolean | Binding,
    CanCopy?: boolean | Binding,
    FullLineIfEmpty?: boolean,
    CopyButtonForeground?: string | Binding | ThemeColor | SemanticColor,
    PreventPreformattedWrapping?: boolean | Binding,
    InvisibleIfEmpty?: boolean,
    HorizontalContentAlignment?: HorizontalAlignment | Binding,
    LineHeight?: number|"normal"
}
interface ITextBlockState extends IPanelState
{
    Text?: string | undefined,
    FontWeight?: undefined | "bold" | "normal" | number,
    FontStyle?: undefined | "italic" | "normal" | "oblique"
}
export class TextBlockBase<P extends ITextBlockProps = {}, S extends ITextBlockState = {}>
    extends PanelBase<P, S>
{
    static displayName = TextBlockBase.name;

    public static PART_TextBlockCopyButton = Antimatter.Identifier("PART_TextBlockCopyButton");

    public static DefaultStyle: WebStyle<ITextBlockProps> = new WebStyle<ITextBlockProps>(
        {
            Foreground: Theme.Value(SemanticColor.BodyText),
            FontFamily: Theme.Value(FontStyle.FontFamily),
            FontSize: Theme.Value(FontStyle.Medium),
            FontWeight: "normal",
            Decoration: "none",
            MaxLines: "1"
        },
        {
            "@": {
                display: "-webkit-box",                
                textDecoration: TemplateProp(nameof<ITextBlockProps>(p => p.Decoration)),
                fontFamily: TemplateProp(nameof<ITextBlockProps>(p => p.FontFamily)),
                color: TemplateProp(nameof<ITextBlockProps>(p => p.Foreground)),
                fontSize: TemplateProp(nameof<ITextBlockProps>(p => p.FontSize)),
                fontWeight: TemplateProp(nameof<ITextBlockProps>(p => p.FontWeight)),
                WebkitLineClamp: TemplateProp(nameof<ITextBlockProps>(p => p.MaxLines)),
                WebkitBoxOrient: "vertical",
                minWidth: TemplateProp(nameof<ITextBlockProps>(p => p.MinWidth))
            },
            "@ .PART_CopyableTextPanel": {
                display: "-webkit-box",
                lineHeight: TemplateProp(nameof<ITextBlockProps>(p => p.LineHeight)),
                WebkitLineClamp: TemplateProp(nameof<ITextBlockProps>(p => p.MaxLines)),
                WebkitBoxOrient: "vertical",
            },
            [`@.${CSSClasses.HACenter}`]: {
                textAlign: "center"
            },
            "@ pre": {
                fontFamily: "unset",
                whiteSpace: "pre-wrap"
            },
            [`@ .${this.PART_TextBlockCopyButton}`]: {
                visibility: "hidden"
            },
            //[`.${CSSClasses.Root}.${CSSClasses.PrefersTouch} @ .${this.PART_TextBlockCopyButton}`]: {
            //    visibility: "visible"
            //},
            [`@:hover .${this.PART_TextBlockCopyButton}`]: {
                visibility: "visible"
            },
        }
    );

    public static DialogHeaderStyle = new WebStyle(
        {
            FontSize: FontStyle.Large
        },
        undefined,
        TextBlockBase.DefaultStyle);

    public static LabelStyle = new WebStyle(
        {
            FontWeight: "bold",
            FontSize: FontStyle.Medium,
        },
        undefined,
        TextBlockBase.DefaultStyle);

    public static ControlSectionHeaderStyle = new WebStyle(
        {
            FontWeight: "bold",
            FontSize: FontStyle.Medium,
            VerticalAlignment: VerticalAlignment.Center
        },
        undefined,
        TextBlockBase.DefaultStyle);

    public static ItalicBodyStyle = new WebStyle(
        {
            FontSize: FontStyle.Medium,
            FontStyle: "italic"
        },
        undefined,
        TextBlockBase.DefaultStyle);

    public static ToolTipStyle = new WebStyle(
        {
            CanSelect: true,
            DisplayFormatted: true,
            MaxLines: "99"
        },
        undefined,
        TextBlockBase.DefaultStyle);

    public static FYIStyle = new WebStyle(
        {
            Foreground: SemanticColor.DisabledBodyText,
            FontWeight: "bold",
            HorizontalAlignment: HorizontalAlignment.Center,
            VerticalAlignment: VerticalAlignment.Center,
            MaxLines: "10"
        },
        undefined,
        TextBlockBase.DefaultStyle);

    public get Text(): string|undefined
    {
        return this.GetValue(nameof(this.props.Text));
    }

    public get CanSelect(): boolean
    {
        return this.GetValue(nameof(this.props.CanSelect), false);
    }

    public get InvisibleIfEmpty(): boolean
    {
        return this.GetValue(nameof(this.props.InvisibleIfEmpty), false);
    }

    public get CanCopy(): boolean
    {
        return this.GetValue(nameof(this.props.CanCopy));
    }

    public get HorizontalContentAlignment(): HorizontalAlignment
    {
        return this.GetValue(nameof(this.props.HorizontalContentAlignment), HorizontalAlignment.Left);
    }

    public get CopyButtonForeground(): string | undefined
    {
        return this.GetValue(nameof(this.props.CopyButtonForeground));
    }

    public get LineHeight(): number | "normal"
    {
        return this.GetValue(nameof(this.props.LineHeight));
    }

    public get Foreground(): string | undefined
    {
        return this.GetValue(nameof(this.props.Foreground));
    }

    public get MaxLines(): string | undefined
    {
        return this.GetValue(nameof(this.props.MaxLines), "1");
    }

    public get PreventPreformattedWrapping(): boolean
    {
        return this.GetValue(nameof(this.props.PreventPreformattedWrapping), false);
    }

    public get FontFamily(): string | undefined
    {
        return this.GetValue(nameof(this.props.FontFamily));
    }

    public get FontSize(): string | undefined
    {
        return this.GetValue(nameof(this.props.FontSize));
    }

    public get MinWidth(): string | undefined
    {
        return this.GetValue(nameof(this.props.MinWidth));
    }

    public get DisplayFormatted(): boolean | undefined
    {
        return this.GetValue(nameof(this.props.DisplayFormatted), false);
    }
    public get DisplayAsHTML(): boolean | undefined
    {
        return this.GetValue(nameof(this.props.DisplayAsHTML), false);
    }
    public get FullLineIfEmpty(): boolean
    {
        return this.GetValue(nameof(this.props.FullLineIfEmpty));
    }

    public override get VisibilityOverride(): boolean
    {
        if (this.InvisibleIfEmpty && !this.Text)
            return false;
        return super.VisibilityOverride;
    }

    public static DefaultBindings = {
        Text: {
            //FallbackValue: '...'
        },
        FontSize: {
            Converter: (size) => typeof (size) === "number" ? `${size}px` : size
        },
        IsClickFocused: {
            Mode: BindingMode.TwoWay
        }
    };

    /* override */ renderElement()
    {
        const text: string = this.state.Text?.toString() ?? '';
        if (!this.CanCopy)
            return this.RenderElementInternal(text);
        else
            return (
                <Grid
                    ItemSpacing={ThemeLayout.GridSpacing}
                    ColumnDefinitions={[
                        //Application.CurrentWindow?.PrefersTouch ? Grid.ColumnDefinition(1,true) : Grid.FittedColumn(),
                        this.HorizontalContentAlignment === HorizontalAlignment.Left
                            ? Grid.FittedColumn()
                            : Grid.Column_Star,
                        Grid.ColumnDefinition()]}>

                    <Panel
                        HorizontalScrollBarVisibility={this.HorizontalScrollBarVisibility}
                        VerticalScrollBarVisibility={this.VerticalScrollBarVisibility}
                        VerticalAlignment={VerticalAlignment.Center}
                        Padding={this.Padding}
                        Grid={{ Column: 0 }}
                        ClassName="PART_CopyableTextPanel">
                        {this.RenderElementInternal(text)}
                    </Panel>

                    {
                        text && text !== ' ' &&
                        <CommandButton
                            ClassName={TextBlock.PART_TextBlockCopyButton}
                            Icon="copy"
                            IconForeground={this.CopyButtonForeground}
                            VerticalAlignment={VerticalAlignment.Center}
                            Grid={{ Column: 1 }}
                            ToolTip="Copy to Clipboard"
                            Command={() =>
                            {
                                navigator.clipboard.writeText(text);
                            }}
                            Style={CommandButton.IconButtonTightStyle}
                        />
                    }
                </Grid>
            );
    }

    private RenderElementInternal(text: string): JSX.Element
    {
        if (this.FullLineIfEmpty && !text)
            return <>&nbsp;</>
        else if (this.DisplayAsHTML)
            return (<span dangerouslySetInnerHTML={{ __html: text }}></span>);
        else if (this.DisplayFormatted)
            return (<pre style={{ whiteSpace: this.PreventPreformattedWrapping ? "pre" : undefined }}>{text}</pre>);     // whitespace pre if scrollable        
        else
            return (<>{text}</>);
    }

    /* override */ getCSSStyles()
    {
        return Object.assign(
            super.getCSSStyles(),
            {
                color: undefined, //this.Foreground,
                padding: this.CanCopy ? undefined : this.Padding,
                //fontFamily: this.FontFamily,
                fontSize: this.props.FontSize ? this.GetValue(nameof(this.props.FontSize)) : undefined,
                //fontWeight: this.state.FontWeight,
                fontStyle: this.state.FontStyle,
                userSelect: this.CanSelect ? "text" : undefined,
                overflow: "hidden"
            });
    }
}

export class TextBlock extends TextBlockBase<ITextBlockProps, ITextBlockState>
{
}