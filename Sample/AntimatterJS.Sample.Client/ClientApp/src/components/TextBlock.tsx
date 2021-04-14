import { Binding, AntimatterComponent } from '@antimatterjs/react';
import * as React from 'react';

interface ITextBlockProps
{
    Text: string | Binding,
    FontFamily?: string,
    FontSize?: number,
    className?: string,    
}
interface ITextBlockState
{
    Text: string
}
export class TextBlock extends AntimatterComponent<ITextBlockProps, ITextBlockState>
{
    static displayName = TextBlock.name;

    public static DefaultBindings = {
        Text: {
            FallbackValue: '...'
        }
    };

    render()
    {
        return (<div
            style={{
                fontFamily: this.props.FontFamily,
                fontSize: this.props.FontSize
            }}
            className={"amx-standard-control " + this.props.className}>{this.state.Text}</div>);
    }
}