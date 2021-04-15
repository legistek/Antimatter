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
import { Orientation, StackPanel } from '../components/StackPanel';
import { Grid } from '../components/Grid';

export class AccountSettingsPanel extends AntimatterComponent
{
    render()
    {
        return (
            <GroupBox Header="Account Settings">
                <Grid ColumnDefinitions="150px 1fr"
                    RowDefinitions="1fr 1fr 1fr 1fr 1fr 1fr">
                    <TextBlock Text="Login" FontWeight="bold"/>
                    <TextBlock Text={new Binding("Identity.Login")} />

                    <TextBlock Text="Email" FontWeight="bold" />
                    <TextBlock Text={new Binding("Identity.Email")} />

                    <TextBlock Text="Name" FontWeight="bold" />
                    <TextBlock Text={new Binding("Identity.DisplayName")} />

                    <TextBlock Text="Company" FontWeight="bold" />
                    <TextBlock Text={new Binding("Identity.Company")} />

                    <TextBlock Text="Password" FontWeight="bold" />
                    <StackPanel Orientation={Orientation.Horizontal}>
                        <TextBlock Text="******" />                       
                    </StackPanel>

                    <TextBlock Text="Security Question" FontWeight="bold" />
                    <TextBlock Text={new Binding("Identity.SecurityQuestion")} />
                </Grid>
            </GroupBox>
            );
    }
}