import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import * as React from 'react';
import { Binding } from '../../Binding';

interface ITextBlockProps extends IFrameworkElementProps
{
    Text: string | Binding,
    FontFamily?: string,
    FontSize?: number,
    FontWeight?: undefined | "bold" | "normal"
}
interface ITextBlockState extends IFrameworkElementState
{
    Text: string
}
export class TextBlock extends FrameworkElement<ITextBlockProps, ITextBlockState>
{
    static displayName = TextBlock.name;

    public static DefaultBindings = {
        Text: {
            FallbackValue: '...'
        }
    };

    protected /* override */ renderElement()
    {
        return (<>{this.state.Text}</>);
    }

    protected /* override */ getCSSStyles()
    {
        return {
            fontFamily: this.props.FontFamily,
            fontSize: this.props.FontSize,
            fontWeight: this.props.FontWeight
        };
    }
}