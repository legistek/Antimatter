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
import { SemanticColor, Theme, ThemeColor, ThemeEffect, ThemeLayout } from '../Theme';
import { Orientation } from '../Enums';
import { Glyph } from './Glyph';

export interface IGroupBoxProps extends IControlProps
{
    children?: React.ReactNode;
    Header?: string | Binding,
    MinHeight?: number | Binding,
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

    public get MinHeight(): number | undefined {
        return this.GetValue(nameof(this.props.MinHeight));
    }

    static DefaultStyle: WebStyle<IGroupBoxProps> = new WebStyle(
        {
            Background: SemanticColor.BodyBackground,
            BorderBrush: SemanticColor.VariantBorder,
            BorderThickness: "1px",
            BoxShadow: ThemeEffect.CardShadow,
            Padding: ThemeLayout.MarginWideLTRB,
            Template: new ControlTemplate((templatedParent: GroupBox) =>
            (
                <Grid
                    ClassName="gb-main-grid"
                    RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}
                    //Padding={(templatedParent.Header ? ThemeLayout.MarginStandardLRB : ThemeLayout.MarginStandardLTRB)}
                    MinHeight={templatedParent.MinHeight}
                >

                    <StackPanel Grid={{ Row: 0 }}
                        Orientation={Orientation.Horizontal}
                        Style={StackPanel.UnspacedStyle}
                    >
                        {templatedParent.Header ? (() =>
                            <TextBlock
                                FontWeight="bold"
                                FontSize={templatedParent.FontSize}
                                Text={templatedParent.Header} />)()
                            : null}
                        {templatedParent.InfoTip && (
                            <Glyph
                                Style={Glyph.ControlInfoTipStyle}
                                ClassName="gb-infotip"
                                ToolTip={templatedParent.InfoTip}
                            />
                        )}
                    </StackPanel>

                    <Panel
                        Grid={{ Row: 1 }}
                        BorderRadius={templatedParent.BorderRadius}
                        BoxShadow={templatedParent.BoxShadow}
                        Background={templatedParent.Background}
                        BorderBrush={templatedParent.BorderBrush}
                        BorderThickness={templatedParent.BorderThickness}
                        Padding={templatedParent.Padding}>
                        {templatedParent.props.children}
                    </Panel>

                </Grid>
            ))
        },
        {
            "@": {
                overflow: 'visible !important'
            },
            "@ .gb-main-grid": {
                overflow: "visible"
            }
        }
    );

    static SimpleStyle: WebStyle<IGroupBoxProps> = new WebStyle(
        {
            BorderThickness: "0ox",
            BoxShadow: "none",
            Padding: "0px"
        },
        {
        },
        GroupBox.DefaultStyle
    );
}
