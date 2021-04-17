import { Component } from 'react';
import * as React from 'react';
import { Route, withRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useLocation, Switch } from 'react-router-dom';
import { createTheme, getTheme, Icon, INavLinkGroup, INavState, INavStyles, loadTheme, Nav } from '@fluentui/react';
import { ModelObjectReference } from '@antimatterjs/react';
import { MainAppBar } from './MainAppBar';
import { Window, Grid, HorizontalAlignment, VerticalAlignment, IWindowProps } from '@antimatterjs/positron'

import { OpenMatterPanel } from './OpenMatterPanel';
import { NewMatterPanel } from './NewMatterPanel';
import { AccountSettingsPanel } from './AccountSettingsPanel';
import { NavigationBar } from '../components/NavigationBar';

import '../custom.css'

interface IMainWindowProps extends IWindowProps
{
    Session: ModelObjectReference,
}

export class MainWindow extends Window<IMainWindowProps, {}>
{
    static theme = getTheme();

    constructor(props)
    {
        super(props);
        const theme = getTheme();
        (this.state as any).Background = theme.palette.neutralLighter;
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
                    key: "key1"
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

    renderElement()
    {
        /**/
        // background: theme.semanticColors.disabledBackground
        return (
            <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}
                HorizontalAlignment={HorizontalAlignment.Stretch}
                VerticalAlignment={VerticalAlignment.Stretch}>

                <MainAppBar />


                <Grid ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}>
                    <div style={{ marginLeft: "10px" }}>
                        <NavigationBar groups={MainWindow.navLinkGroups}
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

        );
    }
}

