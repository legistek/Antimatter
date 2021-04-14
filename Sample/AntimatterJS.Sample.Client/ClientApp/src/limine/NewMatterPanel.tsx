import { Component } from 'react';
import * as React from 'react';
import { Route } from 'react-router';
import { createTheme, getTheme, INavLinkGroup, INavState, INavStyles, Label, loadTheme, MotionAnimations, Nav } from '@fluentui/react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { Window } from '../components/Window';
import { MainAppBar } from './MainAppBar';
import { ListBox } from '../components/ListBox';
import { TextBlock } from '../components/TextBlock';
import { GroupBox } from '../components/GroupBox';
import { TextBox } from '../components/TextBox';
import { ModernButton } from '../components/ModernButton';
import { StackPanel } from '../components/StackPanel';

export class NewMatterPanel extends AntimatterComponent
{
    render()
    {
        const theme = getTheme();

        return (
            <div style={{
                animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            }}>

                <GroupBox Header="Create a New Matter">
                    <TextBox Label="Name" Text={new Binding("UI.NewMatterPanel.NewMatterName")} />

                    <Label>Templates</Label>
                    <TextBlock Text={"You may optionally select a template in order to pre-populate the new matter with commonly used folders, fields, tags, and other content (all of which may be subsequently customized). Otherwise, leave \"Empty Matter\" selected to create a completely blank matter."} />

                    <ListBox ItemsSource={new Binding("UI.OnlineMatterTemplates")}
                        SelectedItem={new Binding("UI.NewMatterPanel.SelectedMatterTemplate")}
                        ItemTemplate={(item) => (
                            <StackPanel>
                                <TextBlock
                                    FontSize={theme.fonts.mediumPlus.fontSize as number}
                                    Text={new Binding({ Path: "Name", Source: item })} />
                                <TextBlock
                                    Text={new Binding({ Path: "Creator", Source: item })} />
                            </StackPanel>
                        )} />
                    
                </GroupBox>

                <div style={{marginLeft: "10px"}}>
                    <ModernButton                    
                        Command={new Binding("UI.NewMatterPanel.CreateCommand")} />
                </div>

            </div>
        );
    }
}