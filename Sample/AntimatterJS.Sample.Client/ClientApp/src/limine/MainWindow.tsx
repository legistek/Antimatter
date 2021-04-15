import { Component } from 'react';
import * as React from 'react';
import { Route, withRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
//import { withRouter } from "react-router";
import { useLocation, Switch } from 'react-router-dom';
import { createTheme, getTheme, Icon, INavLinkGroup, INavState, INavStyles, loadTheme, Nav } from '@fluentui/react';
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

@withRouter     // need this so Nav gets updates on route changes - TODO - sub-class that out
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
                    url: "/open",
                    key: "key1",
                },
                {
                    name: "New",
                    url: "/new",
                    key: "key2"
                },
                {
                    name: "Account",
                    url: "/account",
                    key: "key3"
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
                                styles={MainWindow.navStyles}                                
                                linkAs={(props) =>                                
                                (
                                    <Link className={props.className} style={{ color: 'inherit', boxSizing: 'border-box' }} to={props.href}>
                                        <span style={{ display: 'flex' }}>
                                            {!!props.iconProps && <Icon style={{ margin: '0 4px' }} {...props.iconProps} />}
                                            {props.children}
                                        </span>
                                    </Link>
                                )}
                            />
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

