import * as React from 'react';
import { Binding, AntimatterComponent, BindingMode } from '@antimatterjs/react';
import { TextField } from '@fluentui/react';

export interface ITextBoxProps
{
    Text: string | Binding,
    Label: string | Binding
}
interface ITextBoxState
{
    Text: string,
    Label: string
}

export class TextBox extends AntimatterComponent<ITextBoxProps, ITextBoxState>
{
    constructor(props)
    {
        super(props, { Text: BindingMode.TwoWay });
    }

    render()
    {
        return (
            <TextField
                label={this.state.Label}
                value={this.state.Text || ''}
                onChange={(event, newValue) =>
                    this.OnTargetChanged(nameof(this.state.Text), newValue)
                } />);
    }
}
