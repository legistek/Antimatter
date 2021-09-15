import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import * as React from 'react';
import { Binding } from '@antimatterjs/react';
import { WebStyle } from '../Style';
import { FontStyle, ThemeColor, SemanticColor, Theme } from '../Theme';

export interface ITextBlockProps extends IFrameworkElementProps
{
    Text?: string | Binding | undefined,
    Foreground?: string | Binding | ThemeColor | SemanticColor,
    FontFamily?: string | FontStyle,
    FontSize?: string | FontStyle,
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

    public static DefaultStyle: WebStyle<ITextBlockProps> = new WebStyle<ITextBlockProps>(
        {
            Foreground: Theme.Value(SemanticColor.BodyText),
            FontFamily: Theme.Value(FontStyle.FontFamily),
            FontSize: Theme.Value(FontStyle.Medium),
            FontWeight: "normal"
        },    
    );

    public static DialogHeaderStyle = new WebStyle(
        {            
            FontSize: FontStyle.Large
        },
        undefined,
        TextBlock.DefaultStyle);

    public static ControlSectionHeaderStyle = new WebStyle(
        {
            FontWeight: "bold"
        },
        undefined,
        TextBlock.DefaultStyle);

    public get Foreground(): string | undefined
    {
        return this.GetValue(nameof(this.props.Foreground));
    }

    public get FontFamily(): string | undefined
    {
        return this.GetValue(nameof(this.props.FontFamily));
    }

    public get FontSize(): string | undefined
    {
        return this.GetValue(nameof(this.props.FontSize));
    }

    public static DefaultBindings = {
        Text: {
            FallbackValue: '...'
        },
        FontSize: {
            Converter: (size) => typeof(size) === "number" ? `${size}px` : size
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