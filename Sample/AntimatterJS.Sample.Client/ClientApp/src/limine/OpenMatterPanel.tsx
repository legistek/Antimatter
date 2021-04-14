import { Component } from 'react';
import * as React from 'react';
import { Route } from 'react-router';
import { CommandBar, createTheme, getTheme, INavLinkGroup, INavState, INavStyles, loadTheme, MotionAnimations, Nav } from '@fluentui/react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { Window } from '../components/Window';
import { MainAppBar } from './MainAppBar';
import { ListBox } from '../components/ListBox';
import { TextBlock } from '../components/TextBlock';
import { Tabs, TabItem } from '@fluentui/react-tabs';
import { GroupBox } from '../components/GroupBox';
import { Grid } from '../components/Grid';
import { ModernButton } from '../components/ModernButton';
import { Orientation, StackPanel } from '../components/StackPanel';

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
                    <Grid RowDefinitions="auto 1fr">

                        <ListBox
                            ItemsSource={new Binding("UI.OnlineLimineFiles")}
                            SelectedItem={new Binding("UI.OpenMatterPanel.SelectedOnlineMatter")}
                            ItemTemplate={(item) => (
                                <TextBlock
                                    FontSize={theme.fonts.mediumPlus.fontSize as number}
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