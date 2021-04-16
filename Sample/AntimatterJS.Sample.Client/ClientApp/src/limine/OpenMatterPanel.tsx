import { Component } from 'react';
import * as React from 'react';
import { Route } from 'react-router';
import { CommandBar, createTheme, getTheme, INavLinkGroup, INavState, INavStyles, loadTheme, MotionAnimations, Nav } from '@fluentui/react';
import { Antimatter, TextBlock, DataContext, Binding, ModelObjectReference, AntimatterComponent, Grid, GroupBox, StackPanel, Orientation} from '@antimatterjs/react';
import { ListBox } from '../components/ListBox';
import { ModernButton } from '../components/ModernButton';

export class OpenMatterPanel extends AntimatterComponent
{
    render()
    {
        const theme = getTheme();
        return (
            <div style={{
                animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            }}>
                <GroupBox Header="Open Existing Matter">
                    <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>

                        <ListBox
                            ItemsSource={new Binding("UI.OnlineLimineFiles")}
                            SelectedItem={new Binding("UI.OpenMatterPanel.SelectedOnlineMatter")}
                            ItemTemplate={(item) => (
                                <TextBlock
                                    FontSize={theme.fonts.medium.fontSize as number}
                                    Text={new Binding({ Path: "Name", Source: item })} />
                                )} />
                    </Grid>
                </GroupBox>

                <div style={{marginLeft: "10px"}}>
                    <ModernButton                    
                        Command={new Binding("UI.OpenMatterWebCommand")}
                        CommandParameter={new Binding("UI.OpenMatterPanel.SelectedOnlineMatter")} />
                </div>
            </div>
        );
    }
}