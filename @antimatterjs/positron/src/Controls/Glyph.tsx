import { Binding } from '@antimatterjs/react';
import { Icon } from '@fluentui/react';
import * as React from 'react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { Style } from '../Style';
import { FontStyle, PaletteColor, SemanticColor, Theme } from '../Theme';
import { IPanelProps, IPanelState, Panel } from './Panel';

export interface IGlyphProps extends IFrameworkElementProps
{
    Icon?: number | string | Binding,
    FontSize?: number | string | Binding | FontStyle,
    Foreground?: string | Binding | PaletteColor | SemanticColor,
    FontWeight?: undefined | "bold" | "normal"
}
export interface IGlyphState extends IFrameworkElementState
{
    Icon?: number | string,    
    FontWeight?: undefined | "bold" | "normal"
}

export class Glyph extends FrameworkElement<IGlyphProps, IGlyphState>
{    
    public static DefaultStyle: Style<IGlyphProps> = new Style<IGlyphProps>
    (
        {
            FontSize: FontStyle.Medium,
            Foreground: SemanticColor.BodyText,
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

    public get FontSize(): string | number | undefined
    {
        return this.GetThemableProperty(nameof(this.props.FontSize));
    }

    public get Foreground(): string | undefined
    {
        return this.GetThemableProperty(nameof(this.props.Foreground));
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