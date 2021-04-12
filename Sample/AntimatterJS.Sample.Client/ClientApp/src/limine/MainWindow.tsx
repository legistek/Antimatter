import { Component } from 'react';
import * as React from 'react';
import { Route } from 'react-router';
import { createTheme, getTheme, INavLinkGroup, loadTheme, Nav } from '@fluentui/react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { Window } from '../components/Window';
import { MainAppBar } from './MainAppBar';
import { ListBox } from '../components/ListBox';
import { TextBlock } from '../components/TextBlock';

import { initializeIcons } from '@fluentui/react/lib/Icons';

import '../custom.css'
import { Grid } from '../components/Grid';

const theme = createTheme({
    // You can also modify certain other properties such as fontWeight if desired
    defaultFontStyle: { fontFamily: 'Roboto' },
    palette: {
        themePrimary: '#2e70e0',
        themeLighterAlt: '#f6f9fe',
        themeLighter: '#dae6fa',
        themeLight: '#bcd1f6',
        themeTertiary: '#a1b6e3',
        themeSecondary: '#2e70e0',
        themeDarkAlt: '#0056b8',
        themeDark: '#0056b8',
        themeDarker: '#1e295b',
        neutralLighterAlt: '#f0f1f5',
        neutralLighter: '#f0f1f5',
        neutralLight: '#d7d9e1',
        neutralQuaternaryAlt: '#d7d9e1',
        neutralQuaternary: '#594747',
        neutralTertiaryAlt: '#494955',
        neutralTertiary: '#a0a0a0',
        neutralSecondary: '#606060',
        neutralPrimaryAlt: '#101010',
        neutralPrimary: '#101010',
        neutralDark: '#101010',
        black: '#000000',
        white: '#ffffff',
    }
});

initializeIcons(/* optional base url */);
loadTheme(theme);

export class MainWindow extends AntimatterComponent<{ Session: ModelObjectReference }>
{
    static theme = getTheme();

    static navLinkGroups: INavLinkGroup[] = [
        {
            links: [
                {
                    name: "Open",
                    url: "#open"
                },
                {
                    name: "New",
                    url: "#new"
                }
            ]
        }
    ];

    render()
    {
        return (
            <Window>
                <Grid RowDefinitions="auto 1fr">
                
                    <MainAppBar />

                    <Grid ColumnDefinitions="auto 1fr">

                        <Nav groups={MainWindow.navLinkGroups} />

                        <ListBox
                            ItemsSource={new Binding("UI.OnlineLimineFiles")}
                            SelectedItem={new Binding("UI.OpenMatterPanel.SelectedOnlineMatter")}
                            ItemTemplate={(item) => (
                                <TextBlock Text={new Binding({ Path: "Name", Source: item })}/>
                                )} />

                    </Grid>

                </Grid>
            </Window>
            );
    }
}
