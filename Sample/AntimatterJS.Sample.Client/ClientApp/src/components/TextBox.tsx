import * as React from 'react';
import { Binding, AntimatterComponent, BindingMode } from '@antimatterjs/react';
import { TextField } from '@fluentui/react';

export interface ITextBoxProps
{
    Text?: string | Binding,
    Label?: string | Binding
}
interface ITextBoxState
{
    Text: string,
    Label: string,
    ValidationError?: string
}

export class TextBox extends AntimatterComponent<ITextBoxProps, ITextBoxState>
{
    public static DefaultBindings = {
        Text: {
            Mode: BindingMode.TwoWay,
            ValidatesOnDataErrors: true
        }
    };
    
    render()
    {
        return (
            <TextField
                label={this.state.Label}
                value={this.state.Text || ''}
                onChange={(event, newValue) =>
                    this.OnTargetChanged(nameof(this.state.Text), newValue)
                }
                onGetErrorMessage={(value: string) => {
                    return this.state.ValidationError;
                }}
            />);
    }

    NotifyValidationError(error?: string)
    {
        if (this.state.ValidationError !== error)
        {
            this.setState({ ValidationError: error });
        }                
    }
}
