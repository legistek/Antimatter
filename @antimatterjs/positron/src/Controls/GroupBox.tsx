import * as React from 'react';
import { Binding } from '@antimatterjs/react';
import { DefaultEffects, getTheme } from '@fluentui/react';

import { StackPanel } from './StackPanel';
import { TextBlock } from './TextBlock';
import { Control, IControlProps, IControlState } from './Control';
import { Style } from '../Style';
import { ControlTemplate } from '../FrameworkTemplate';

export interface IGroupBoxProps extends IControlProps
{
    Header?: string | Binding,
}
export interface IGroupBoxState extends IControlState
{
    Header?: string,
}

export class GroupBox extends Control<IGroupBoxProps, IGroupBoxState>
{
    static theme = getTheme();
    static defaultProps: IGroupBoxProps = {
        Background: GroupBox.theme.semanticColors.bodyBackground,
        BorderBrush: "#C0C0C0",
        BorderThickness: "1px",
        Padding: "10px"
    }
    static DefaultStyle: Style<IGroupBoxProps> = new Style(
        {
            Background: GroupBox.theme.semanticColors.bodyBackground,
            BorderBrush: GroupBox.theme.semanticColors.inputBorder,
            BorderThickness: "1px",
            Padding: "10px",
            Template: new ControlTemplate((templatedParent: GroupBox) =>
            (
                <StackPanel
                    Padding={(templatedParent.state.Header ? "0px 10px 10px 10px" : "10px")}>
                    {templatedParent.state.Header ? (() =>
                        <TextBlock FontWeight="bold" Text={templatedParent.state.Header} />)()
                        : null}

                    <StackPanel
                        BoxShadow={DefaultEffects.elevation8}
                        Background={templatedParent.state.Background}
                        BorderBrush={templatedParent.state.BorderBrush}
                        BorderThickness={templatedParent.state.BorderThickness}
                        Padding={templatedParent.props.Padding}>
                        {templatedParent.props.children}
                    </StackPanel>

                </StackPanel>
            ))
        }
    );
}
