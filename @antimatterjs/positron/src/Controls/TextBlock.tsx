import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import * as React from 'react';
import { Binding } from '@antimatterjs/react';
import { Style } from '../Style';
import { FontStyle, PaletteColor, SemanticColor, Theme } from '../Theme';

export interface ITextBlockProps extends IFrameworkElementProps
{
    Text?: string | Binding | undefined,
    Foreground?: string | Binding | PaletteColor | SemanticColor,
    FontFamily?: string | FontStyle,
    FontSize?: number | string | FontStyle,
    FontWeight?: undefined | "bold" | "normal" | number
}
interface ITextBlockState extends IFrameworkElementState
{
    Text?: string | undefined,
    FontWeight?: undefined | "bold" | "normal" | number
}
export class TextBlock extends FrameworkElement<ITextBlockProps, ITextBlockState>
{
    static displayName = TextBlock.name;

    public static DefaultStyle: Style<ITextBlockProps> = new Style<ITextBlockProps>(
        {
        },
        {
            Selector: "@",
            Rules: {
                fontFamily: Theme.Value(FontStyle.FontFamily),
                fontSize: Theme.Value(FontStyle.Medium)
                //margin: "5px",
                //transform: "translate(0, -6%)"
            },
        },
        //{
        //    Selector: ".amx-ptn-wrap-panel:first-child@",
        //    Rules: {
        //        marginLeft: "0px",
        //    }
        //},
        //{
        //    Selector: ".amx-ptn-vstack > @",
        //    Rules: {
        //        marginLeft: "0px",
        //    }
        //}

    );

    public get Foreground(): string | undefined
    {
        return this.GetThemableProperty(nameof(this.props.Foreground));
    }

    public get FontFamily(): string | undefined
    {
        return this.GetThemableProperty(nameof(this.props.FontFamily));
    }

    public get FontSize(): string | undefined
    {
        return this.GetThemableProperty(nameof(this.props.FontSize));
    }

    public static DialogHeaderStyle = new Style(
        {
            //FontWeight: "bold",
            FontSize: FontStyle.Large
        });

    public static DefaultBindings = {
        Text: {
            FallbackValue: '...'
        }
    };

    /* override */ renderElement()
    {
        return (<>{this.state.Text?.toString() || ""}</>);
    }

    /* override */ getCSSStyles()
    {
        return Object.assign(
            super.getCSSStyles(),
            {
                color: this.Foreground,
                fontFamily: this.FontFamily,
                fontSize: this.FontSize,
                fontWeight: this.state.FontWeight
            });
    }
}