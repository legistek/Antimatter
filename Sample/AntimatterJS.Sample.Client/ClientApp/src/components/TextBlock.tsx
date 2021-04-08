import { Binding, AntimatterComponent } from '@antimatterjs/react';
import * as React from 'react';

interface ITextBlockProps
{
    Text: string | Binding,
    className?: string
}
interface ITextBlockState
{
    Text: string
}
export class TextBlock extends AntimatterComponent<ITextBlockProps, ITextBlockState>
{
    static displayName = TextBlock.name;

    render()
    {
        return (<div className={this.props.className}>{this.state.Text}</div>);
    }
}