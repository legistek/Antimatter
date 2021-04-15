import { Component } from 'react';
import * as React from 'react';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, getTheme, INavLinkGroup, INavState, INavStyles, loadTheme, Nav } from '@fluentui/react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { Window } from '../components/Window';
import { MainAppBar } from './MainAppBar';
import { ListBox } from '../components/ListBox';
import { TextBlock } from '../components/TextBlock';
import { Tabs, TabItem } from '@fluentui/react-tabs';

import '../custom.css'
import { Grid } from '../components/Grid';
import { GroupBox } from '../components/GroupBox';
import { OpenMatterPanel } from './OpenMatterPanel';
import { Orientation, StackPanel } from '../components/StackPanel';
import { NewMatterPanel } from './NewMatterPanel';
import { AccountSettingsPanel } from './AccountSettingsPanel';
import { NavigationBar } from '../components/NavigationBar';
import { Tab } from 'bootstrap';

export class MainWindow extends AntimatterComponent<{ Session: ModelObjectReference }, { selectedKey: string }>
{
    static theme = getTheme();

    constructor(props)
    {
        super(props);
    }

    static navStyles: Partial<INavStyles> = {
        //navItem: {
        //    background: "green"
        //},
        root: {
            width: 150,
        }
    };
    static navLinkGroups: INavLinkGroup[] = [
        {
            links: [
                {
                    name: "Open",
                    url: "#/open",
                    key: "open",
                },
                {
                    name: "New",
                    url: "#/new",
                    key: "new"
                },
                {
                    name: "Account",
                    url: "#/account",
                    key: "account"
                }
            ]
        }
    ];

    render()
    {
        const theme = getTheme();

        /**/
        // background: theme.semanticColors.disabledBackground
        return (
            <Window Background={theme.palette.neutralLighter}>
                <Grid RowDefinitions="auto 1fr">

                    <MainAppBar />

                    <Grid ColumnDefinitions="auto 1fr">
                        <div style={{ marginLeft: "10px" }}>
                            <Nav groups={MainWindow.navLinkGroups}
                                styles={MainWindow.navStyles}/>
                        </div>

                        <div>
                            <Route path='/open' component={OpenMatterPanel} />
                            <Route path='/new' component={NewMatterPanel} />
                            <Route path='/account' component={AccountSettingsPanel} />
                        </div>
                    </Grid>

                </Grid>
            </Window>
        );
    }
}


/*
 * 
 * 
 *SelectedTabName=
                                {
                                    new Binding({
                                        Path: "UI.CurrentAppMenuTab",
                                        Converter: tab =>
                                        {
                                            switch (tab as number)
                                            {
                                                case 0:
                                                    return "NewMatter";
                                                case 1:
                                                    return "OpenMatter";
                                                case 2:
                                                    return "MatterSettings";
                                                case 3:
                                                    return "ServerAdmin";
                                                case 4:
                                                    return "AccountSettings";
                                                default:
                                                    return "";
                                            }
                                        },
                                        ConverterBack: tab =>
                                        {
                                            switch (tab as string)
                                            {
                                                case "NewMatter":
                                                    return 0;
                                                case "OpenMatter":
                                                    return 1;
                                                case "MatterSettings":
                                                    return 2;
                                                case "ServerAdmin":
                                                    return 3;
                                                case "AccountSettings":
                                                    return 4;
                                                default:
                                                    return 0;
                                            }
                                        }
                                    })
                                }
 * */