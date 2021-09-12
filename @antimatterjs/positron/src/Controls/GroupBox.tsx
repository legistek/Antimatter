import * as React from 'react';
import { Binding } from '@antimatterjs/react';
import { DefaultEffects } from '@fluentui/react';

import { StackPanel } from './StackPanel';
import { TextBlock } from './TextBlock';
import { Control, IControlProps, IControlState } from './Control';
import { Style } from '../Style';
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
    Header?: string,
}

export class GroupBox extends Control<IGroupBoxProps, IGroupBoxState>
{    
    static defaultProps: IGroupBoxProps = {
        Background: SemanticColor.BodyBackground,
        BorderBrush: "#C0C0C0",
        BorderThickness: "1px",
        Padding: "10px"
    }
    static DefaultStyle: Style<IGroupBoxProps> = new Style(
        {
            Background: SemanticColor.BodyBackground,
            BorderBrush: SemanticColor.InputBorder,
            BorderThickness: "1px",
            Padding: "10px",
            Template: new ControlTemplate((templatedParent: GroupBox) =>
            (
                <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}
                    Padding={(templatedParent.state.Header ? "0px 10px 10px 10px" : "10px")}>

                    {templatedParent.state.Header ? (() =>
                        <TextBlock FontWeight="bold" Text={templatedParent.state.Header} />)()
                        : null}

                    <Panel
                        BoxShadow={DefaultEffects.elevation8}
                        Background={templatedParent.Background}
                        BorderBrush={templatedParent.BorderBrush}
                        BorderThickness={templatedParent.state.BorderThickness}
                        Padding={templatedParent.props.Padding}>
                        {templatedParent.props.children}
                    </Panel>

                </Grid>
            ))
        }
    );
}
