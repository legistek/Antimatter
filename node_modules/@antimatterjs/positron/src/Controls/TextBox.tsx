import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { Autofill, TextField } from '@fluentui/react';
import { Style } from '../Style';

export interface ITextBoxProps extends IControlProps
{
    Text?: string | Binding,
    Label?: string | Binding,
    IconName?: string | Binding
}

interface ITextBoxState extends IControlState
{
    Text?: string,
    Label?: string,
    ValidationError?: string,
    IconName?: string
}

export class TextBox extends Control<ITextBoxProps, ITextBoxState>
{
    public static DefaultBindings = {
        Text: {
            Mode: BindingMode.TwoWay,
            ValidatesOnDataErrors: true
        }
    };
    static DefaultStyle: Style<ITextBoxProps> = new Style(
        {
            Template: (templatedParent: TextBox) =>
            (
                <TextField
                    iconProps={
                        {
                            iconName: templatedParent.state.IconName
                        }
                    }
                    styles={{
                        field: {
                            fontFamily: templatedParent.state.FontFamily,
                            fontSize: templatedParent.state.FontSize,
                            fontWeight: templatedParent.state.FontWeight,
                            padding: 0,
                            margin: 0
                        },
                        fieldGroup: {
                            height: "auto",
                            padding: templatedParent.state.Padding || "5px"
                        }
                    }}
                    autoAdjustHeight={true}
                    label={templatedParent.state.Label}
                    value={templatedParent.state.Text || ''}
                    onChange={(event, newValue) =>
                        templatedParent.SetValue(nameof(templatedParent.state.Text), newValue)
                    }
                    onGetErrorMessage={(value: string) =>
                    {
                        return templatedParent.state.ValidationError;
                    }} />
            )
        }
    );

    NotifyValidationError(error?: string)
    {
        if (this.state.ValidationError !== error)
        {
            this.setState({ ValidationError: error });
        }
    }
}