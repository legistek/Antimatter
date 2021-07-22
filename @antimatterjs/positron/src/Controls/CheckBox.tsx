import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Checkbox as FluentCheckBox } from '@fluentui/react'
import { IToggleButtonProps, IToggleButtonState, ToggleButtonBase } from './Primitives/ToggleButton';
import { ControlTemplate } from '../FrameworkTemplate';
import { Style } from '../Style';

export interface ICheckBoxProps extends IToggleButtonProps
{
}

interface ICheckBoxState extends IToggleButtonState
{
}

export class CheckBox extends ToggleButtonBase<ICheckBoxProps, ICheckBoxState>
{
    public static DefaultBindings = {
        IsEnabled: {
            FallbackValue: true
        },
        IsChecked: {
            Mode: BindingMode.TwoWay,
            FallbackValue: false
        },
        Label: {
            FallbackValue: '...'
        }
    };
    static DefaultStyle: Style<ICheckBoxProps> = new Style(
        {
            Template: new ControlTemplate((templatedParent: CheckBox) =>
            (
                <FluentCheckBox
                    styles={{
                        root: {
                            width: "fit-content"
                        }
                    }}
                    disabled={templatedParent.state.IsEnabled === undefined ? false : !templatedParent.state.IsEnabled}
                    label={templatedParent.state.Label}
                    checked={templatedParent.state.IsChecked}
                    indeterminate={templatedParent.state.IsThreeState}
                    onChange={(checked, newValue) =>
                    {
                        templatedParent.OnClick(checked?.nativeEvent as MouseEvent);
                    }}
                />
            ))
        }
    );
}