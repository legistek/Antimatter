import { Binding } from '@antimatterjs/react';
import { getTheme, Icon } from '@fluentui/react';
import * as React from 'react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { Style } from '../Style';
import { IPanelProps, IPanelState, Panel } from './Panel';

export interface IGlyphProps extends IFrameworkElementProps
{
    Icon?: number | string | Binding,
    FontSize?: number | string | Binding,
    Foreground?: string | Binding,
    FontWeight?: undefined | "bold" | "normal"
}
export interface IGlyphState extends IFrameworkElementState
{
    Icon?: number | string,
    FontSize?: number | string,
    Foreground?: string,
    FontWeight?: undefined | "bold" | "normal"
}

export class Glyph extends FrameworkElement<IGlyphProps, IGlyphState>
{
    static theme = getTheme();

    public static DefaultStyle: Style<IGlyphProps> = new Style<IGlyphProps>
    (
        {
            FontSize: Glyph.theme.fonts.medium.fontSize as number,
            Foreground: Glyph.theme.semanticColors.bodyText,
        },
        {
            Selector: "@ .icon",
            Rules: {
                alignSelf: "center",
                margin: "0px",
                padding: "0px"
            }
        }
    );

    renderElement(): JSX.Element
    {
        return (
            <Icon
                className="icon"
                iconName={this.GetIconString()}
                style={{
                    color: this.state.Foreground,
                    fontSize: this.state.FontSize,
                    fontWeight: this.state.FontWeight
                }}
            />)
    }

    /* override */ getCSSStyles(): React.CSSProperties
    {
        var styles = super.getCSSStyles();
        styles.height = this.state.FontSize;        
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