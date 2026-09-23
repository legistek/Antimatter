import * as React from 'react';

import { Antimatter, Binding, BindingMode } from '@antimatterjs/react';

import { TemplateProp, WebStyle } from '../Style';
import { FontStyle, SemanticColor, Theme, ThemeColor, ThemeEffect, ThemeLayout } from '../Theme';
import { Grid } from './Grid';
import { Control, IControlProps, IControlState } from './Control';
import { Glyph } from './Glyph';
import { Panel } from './Panel';
import { TextBlock } from './TextBlock';
import { StackPanel } from './StackPanel';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';

export interface IExpanderProps extends IControlProps
{
    children?: React.ReactNode;
    IsExpanded?: boolean | Binding,
    Label?: string | JSX.Element | Binding,
}

export class Expander extends Control<IExpanderProps, IControlState>
{
    public static DefaultStyle = new WebStyle<IExpanderProps>(
        {
            FontFamily: FontStyle.FontFamily,
            FontSize: FontStyle.Medium,
            FontWeight: "bold",
            Padding: "0px",
            Template: (templatedParent: Expander) => (
                <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                    <Grid
                        Cursor="pointer"
                        ItemSpacing={ThemeLayout.GridSpacing}                        
                        OnClick={(e) =>
                            templatedParent.SetValue(
                                nameof(templatedParent.props.IsExpanded),
                                !templatedParent.IsExpanded,
                                true)}
                        ColumnDefinitions={[Grid.Column_Auto, Grid.Column_Star]}>

                        <Glyph
                            Icon={templatedParent.IsExpanded ? "ChevronDown" : "ChevronRight"}
                            FontSize={FontStyle.Glyph1x}
                            VerticalAlignment={VerticalAlignment.Center}
                            Grid={{ Row: 0, Column: 0 }} />

                        {
                            typeof templatedParent.Label === 'string'
                                ? <TextBlock
                                    Grid={{ Row: 0, Column: 1 }}
                                    VerticalAlignment={VerticalAlignment.Center}
                                    FontFamily={templatedParent.FontFamily}
                                    FontStyle={templatedParent.FontStyle}
                                    FontWeight={templatedParent.FontWeight}
                                    FontSize={templatedParent.FontSize}
                                    Text={templatedParent.Label} />
                                : <Panel Grid={{ Row: 0, Column: 1 }}>
                                    {templatedParent.Label}
                                </Panel>
                        }
                    </Grid>

                    {
                        templatedParent.IsExpanded &&
                        <Panel Grid={{ Row: 1 }} Margin={templatedParent.Padding}>
                            {templatedParent.props.children}
                        </Panel>
                    }
                </Grid>
            )
        });

    public get IsExpanded(): boolean
    {
        return this.GetValue(nameof(this.props.IsExpanded), false);
    }

    public get Label(): string | JSX.Element | undefined
    {
        return this.GetValue(nameof(this.props.Label));
    }
}