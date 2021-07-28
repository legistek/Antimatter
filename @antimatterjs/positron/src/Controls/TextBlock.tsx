import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import * as React from 'react';
import { Binding } from '@antimatterjs/react';
import { getTheme } from '@fluentui/react';
import { Style } from '../Style';

interface ITextBlockProps extends IFrameworkElementProps
{
    Text?: string | Binding | undefined,
    Foreground?: string | Binding,
    FontFamily?: string,    
    FontSize?: number|string,
    FontWeight?: undefined | "bold" | "normal"
}
interface ITextBlockState extends IFrameworkElementState
{
    Text?: string | undefined,
    Foreground?: string,
    FontFamily?: string,
    FontSize?: number|string,
    FontWeight?: undefined | "bold" | "normal"
}
export class TextBlock extends FrameworkElement<ITextBlockProps, ITextBlockState>
{
    static theme = getTheme();
    static displayName = TextBlock.name;

    public static DefaultStyle: Style<ITextBlockProps> = new Style<ITextBlockProps>(
        {
        },
        {
            Selector: "@",
            Rules: {
                fontFamily: TextBlock.theme.fonts.medium.fontFamily,
            }
        });

    public static DialogHeaderStyle = new Style(
        {
            //FontWeight: "bold",
            FontSize: TextBlock.theme.fonts.large.fontSize
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
                color: this.state.Foreground,
                fontFamily: this.state.FontFamily,
                fontSize: this.state.FontSize,
                fontWeight: this.state.FontWeight,                
            });
    }
}