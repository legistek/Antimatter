import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import * as React from 'react';
import { Binding } from '@antimatterjs/react';
import { Style } from '@antimatterjs/positron/src/Style';
import { getTheme } from '@fluentui/react';

interface ITextBlockProps extends IFrameworkElementProps
{
    Text: string | Binding | undefined,
    FontFamily?: string,
    FontSize?: number,
    FontWeight?: undefined | "bold" | "normal"
}
interface ITextBlockState extends IFrameworkElementState
{
    Text: string | undefined,
    FontFamily?: string,
    FontSize?: number,
    FontWeight?: undefined | "bold" | "normal"
}
export class TextBlock extends FrameworkElement<ITextBlockProps, ITextBlockState>
{
    static theme = getTheme();
    static displayName = TextBlock.name;

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
        return (<>{this.state.Text}</>);
    }

    /* override */ getCSSStyles()
    {
        return Object.assign(
            super.getCSSStyles(),
            {
                fontFamily: this.state.FontFamily,
                fontSize: this.state.FontSize,
                fontWeight: this.state.FontWeight
            });
    }
}