import { Component } from 'react';
import * as React from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Company, Employee } from './components/Company';
import { createTheme, Icon, loadTheme } from '@fluentui/react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { DialogBox, Grid, Orientation, StackPanel, TextBlock, TreeView, Window } from '@antimatterjs/positron';
import { initializeIcons } from '@fluentui/react/lib/Icons';

import './custom.css'


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

export default class App extends AntimatterComponent<{ Model: ModelObjectReference }, { Model: ModelObjectReference }>
{
    static displayName = App.name;

    constructor(props)
    {
        super(props);
        this.RegisterDialogs();
    }

    RegisterDialogs()
    {
        DialogBox.RegisterTemplate(
            "EmployeeDialog",
            (vm) =>
            (
                <Employee Value={new Binding({ Path: "Employee", Source: vm })} />
            )
        )
    }

    render()
    {
        return (
            <Window Dialogs={new Binding({ Path: "Dialogs", Source: this.state.Model, NotifyCollectionChanged: true })}>
                <DataContext Value={new Binding({ Path: "Company", Source: this.state.Model })}>
                    <Grid ColumnDefinitions={[Grid.ColumnDefinition(400), Grid.ColumnDefinition(1, true)]}>
                        <TreeView
                            ItemsSource={new Binding("CEO.Underlings")}
                            ChildrenPath="Underlings"
                            Background="Green"
                            IsExpandedPath="IsExpanded"
                            ItemTemplate={
                                (item) =>
                                (<StackPanel Orientation={Orientation.Horizontal}>
                                    <Icon iconName="e96a"
                                        style={{                                                                                        
                                            alignSelf: "center",
                                            margin: "0px 5px 0px 0px"
                                        }}
                                    />
                                    <TextBlock Text={new Binding({ Path: "FullName", Source: item })} />
                                </StackPanel>
                                )}>
                        </TreeView>
                    
                        <Company />
                    </Grid>
                </DataContext>
            </Window>
            
            //<Layout>
            //    <Route exact path='/' component={Home} />
            //    <Route path='/counter' component={Company} />
            //    <Route path='/fetch-data' component={FetchData} />
            //</Layout>
        );
    }
}
