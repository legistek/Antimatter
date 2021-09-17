import { Binding } from '@antimatterjs/react';
import { Icon } from '@fluentui/react';
import * as React from 'react';
import { VerticalAlignment } from '../Enums';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { WebStyle } from '../Style';
import { FontStyle, ThemeColor, SemanticColor, Theme } from '../Theme';
import { IPanelProps, IPanelState, Panel } from './Panel';

export interface IGlyphProps extends IFrameworkElementProps
{
    Icon?: number | string | Binding,
    FontSize?: number | string | Binding | FontStyle,
    Foreground?: string | Binding | ThemeColor | SemanticColor,
    FontWeight?: undefined | "bold" | "normal"
}
export interface IGlyphState extends IFrameworkElementState
{
    Icon?: number | string,    
    FontWeight?: undefined | "bold" | "normal"
}

export class Glyph extends FrameworkElement<IGlyphProps, IGlyphState>
{    
    public static DefaultStyle: WebStyle<IGlyphProps> = new WebStyle<IGlyphProps>
    (
        {
            FontSize: FontStyle.Glyph1x,
            Foreground: SemanticColor.BodyText,
        },
        {
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

    public get FontSize(): string | number | undefined
    {
        return this.GetValue(nameof(this.props.FontSize));
    }

    public get Foreground(): string | undefined
    {
        return this.GetValue(nameof(this.props.Foreground));
    }

    renderElement(): JSX.Element
    {
        return (
            <Icon
                className="icon"
                iconName={this.GetIconString()}
                style={{
                    color: this.Foreground,
                    fontSize: this.FontSize,
                    fontWeight: this.state.FontWeight
                }}
            />)
    }

    /* override */ getCSSStyles(): React.CSSProperties
    {
        var styles = super.getCSSStyles();
        styles.height = this.FontSize;        
        return styles;
    }

    private GetIconString(): string
    {
        if (typeof (this.state.Icon) === "string")
            return this.state.Icon as string;
        else if (typeof (this.state.Icon) === "number")
            return (this.state.Icon as number).toString(16);
        else
            return "";
    }
}