import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Checkbox as FluentCheckBox } from '@fluentui/react'
import { IToggleButtonProps, IToggleButtonState, ToggleButtonBase } from './Primitives/ToggleButton';
import { ControlTemplate } from '../FrameworkTemplate';
import { WebStyle } from '../Style';
import { FontStyle, Theme } from '../Theme';

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
    static DefaultStyle: WebStyle<ICheckBoxProps> = new WebStyle(
        {
            Template: new ControlTemplate((templatedParent: CheckBox) =>
            (
                <FluentCheckBox
                    styles={{
                        root: {
                            width: "fit-content"
                        },
                        text: {
                            fontFamily: Theme.Value(FontStyle.FontFamily),
                            marginTop: "auto",
                            marginBottom: "auto",
                            marginLeft: "0px",
                            lineHeight: "unset"
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