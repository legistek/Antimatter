import { Binding, RelativeSourceMode } from '@antimatterjs/react';
import { Icon, ImageIcon } from '@fluentui/react';
import * as React from 'react';
import { VerticalAlignment } from '../Enums';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { WebStyle } from '../Style';
import { FontStyle, ThemeColor, SemanticColor, Theme } from '../Theme';
import { Control, IControlProps } from './Control';
import { IPanelProps, IPanelState, Panel } from './Panel';

export interface IGlyphProps extends IFrameworkElementProps
{
    Icon?: number | string | Binding,
    FontSize?: number | string | Binding | FontStyle,
    Foreground?: string | Binding | ThemeColor | SemanticColor,
    FontWeight?: undefined | "bold" | "normal",
    PreferImage?: boolean | Binding,
    IsShaking?: boolean | Binding,
    KeepDefaultCursor?: boolean | Binding,
}
export interface IGlyphState extends IFrameworkElementState
{
    Icon?: number | string,
    FontWeight?: undefined | "bold" | "normal"
}

export type FontSizeMap =
    {
        [key: number]: number;
    };

type AltFontFamily =
    {
        Family: string,
        AvailableIcons: Set<number>
    };



export class Glyph extends FrameworkElement<IGlyphProps, IGlyphState>
{
    private static _registeredURLs: Map<string, string> = new Map<string, string>();
    public static RegisterURL(key: string, url: string)
    {
        Glyph._registeredURLs.set(key, url);
    }

    private static _altSizes: Map<any, FontSizeMap> = new Map<any, FontSizeMap>();

    public static RegisterAltSizes(size: FontStyle, map: FontSizeMap)
    {
        this._altSizes.set(
            Theme.Value(size as number),
            map);
    }

    public static GetAltSize(size: any, iconNumber: number) : number|undefined
    {
        var set = this._altSizes.get(size);
        if (!set)
            return undefined;
        return set[iconNumber];
    }

    public static DefaultStyle: WebStyle<IGlyphProps> = new WebStyle<IGlyphProps>
        (
            {
                FontSize: FontStyle.Glyph1x,
                Foreground: SemanticColor.BodyText,
            },
            {
                "@": {
                    overflowY: "hidden !important"      // in case browser font weirdness causes slight overflow of height
                } as any,
                "@ .icon": {
                    alignSelf: "center",
                    margin: "0px",
                    padding: "0px"
                }
            }
        );

    public static ControlInfoTipStyle = new WebStyle<IGlyphProps>(
        {
            Foreground: ThemeColor.ThemePrimary,
            VerticalAlignment: VerticalAlignment.Center,
            FontSize: FontStyle.Glyph1x,
            FontWeight: "normal",
            Icon: "Info",
            IsVisible: new Binding(
                {
                    RelativeSourceMode: RelativeSourceMode.Self,
                    Path: nameof<IControlProps>(p => p.ToolTip),
                    Converter: t => t
                }
            ),
            Margin: "0px 0px 0px 5px"
        },
        {
        },
        this.DefaultStyle
    );

    public static ControlValidationErrorStyle = new WebStyle<IGlyphProps>(
        {
            Foreground: SemanticColor.Error,
            Margin: "0px 0px 0px 5px",
            Icon: "Warning",
            VerticalAlignment: VerticalAlignment.Center
        },
        {

        },
        this.DefaultStyle);

    public static WarningGlyphStyle = new WebStyle<IGlyphProps>(
        {
            Foreground: SemanticColor.Warning,
            Icon: "Warning",
            VerticalAlignment: VerticalAlignment.Center
        },
        {
        },
        this.DefaultStyle);

    public get FontSize(): string | number | undefined
    {
        return this.GetValue(nameof(this.props.FontSize));
    }

    public get IsActive(): boolean
    {
        return this.ToolTip !== undefined;
    }

    public get IsShaking(): boolean
    {
        return this.GetValue(nameof(this.props.IsShaking), false);
    }

    public get KeepDefaultCursor(): boolean
    {
        return this.GetValue(nameof(this.props.KeepDefaultCursor), false);
    }

    public get Icon(): number | string | undefined
    {
        return this.GetValue(nameof(this.props.Icon));
    }

    public get Foreground(): string | undefined
    {
        return this.GetValue(nameof(this.props.Foreground));
    }

    public get PreferImage(): boolean
    {
        return this.GetValue(nameof(this.props.PreferImage), false);
    }

    renderElement(): JSX.Element
    {
        var imageUrl = this.PreferImage &&
            Glyph._registeredURLs.get(this.GetIconString());

        if (this.PreferImage && imageUrl)
            return (
                <img src={Glyph._registeredURLs.get(this.GetIconString())}
                    style={{
                        height: this.FontSize
                    }}
                    height={this.FontSize} />
            );
        else if (this.Icon === undefined || this.Icon === 0 || this.Icon === "0")
            return (<></>);
        else 
            return (
                <Icon
                    className="icon"
                    iconName={this.GetIconString()}
                    style={{
                        color: this.Foreground,
                        fontSize: this.FontSize,
                        fontWeight: this.state.FontWeight
                    }}
                />);        
    }

    /* override */ getCSSStyles(): React.CSSProperties
    {
        var styles = super.getCSSStyles();
        styles.height = this.FontSize;  // mainly needed for SVGs
        if (this.IsActive && !this.KeepDefaultCursor)
        {
            styles.cursor = "pointer";
            if (this.IsEnabled)
                styles.pointerEvents = "all";   //Exempt tooltip usability from ancestors' disabled states
        }
        return styles;
    }

    override constructClasses(): string
    {
        return super.constructClasses() +
            (this.IsShaking ? " amx-ptn-animate-shake " : "");
    }

    public static GetIconString(
        icon: string | number | undefined,
        fontSize?: string | number | undefined)
    {
        if (typeof (icon) === "string")
            return icon as string;
        else if (typeof (icon) === "number")
        {
            var altNumber = Glyph.GetAltSize(fontSize, icon as number);
            if (altNumber !== undefined)
                return altNumber.toString(16);
            return (icon as number).toString(16);
        }
        else
            return "";
    }

    private GetIconString(): string
    {
        return Glyph.GetIconString(this.Icon, this.FontSize);
    }
}