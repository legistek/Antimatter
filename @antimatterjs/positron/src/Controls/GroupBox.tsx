import * as React from 'react';
import { Binding } from '@antimatterjs/react';
import { DefaultEffects } from '@fluentui/react';

import { StackPanel } from './StackPanel';
import { TextBlock } from './TextBlock';
import { Control, IControlProps, IControlState } from './Control';
import { WebStyle } from '../Style';
import { ControlTemplate } from '../FrameworkTemplate';
import { Panel } from './Panel';
import { Grid } from './Grid';
import { SemanticColor, Theme } from '../Theme';

export interface IGroupBoxProps extends IControlProps
{
    Header?: string | Binding,
}
export interface IGroupBoxState extends IControlState
{
}

export class GroupBox extends Control<IGroupBoxProps, IGroupBoxState>
{
    public get Header(): string | undefined
    {
        return this.GetValue(nameof(this.props.Header));
    }        

    static DefaultStyle: WebStyle<IGroupBoxProps> = new WebStyle(
        {
            Background: SemanticColor.BodyBackground,
            BorderBrush: SemanticColor.InputBorder,
            BorderThickness: "1px",
            Padding: "10px",
            Template: new ControlTemplate((templatedParent: GroupBox) =>
            (
                <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}
                    Padding={(templatedParent.Header ? "0px 10px 10px 10px" : "10px")}>

                    {templatedParent.Header ? (() =>
                        <TextBlock FontWeight="bold" Text={templatedParent.Header} />)()
                        : null}

                    <Panel
                        BoxShadow={DefaultEffects.elevation8}
                        Background={templatedParent.Background}
                        BorderBrush={templatedParent.BorderBrush}
                        BorderThickness={templatedParent.BorderThickness}
                        Padding={templatedParent.Padding}>
                        {templatedParent.props.children}
                    </Panel>

                </Grid>
            ))
        }
    );
}
