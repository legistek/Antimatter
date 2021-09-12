import { Component } from 'react';
import * as React from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Company, Employee } from './components/Company';
import { createTheme, Icon, loadTheme } from '@fluentui/react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { DialogBox, Grid, HorizontalAlignment, MultitouchTransform, Orientation, Panel, PinnablePanel, PinnablePanelBase, ResizePanel, Side, StackPanel, NavMenu, TextBlock, TreeView, VerticalAlignment, Window, WindowLayout } from '@antimatterjs/positron';
import { initializeIcons } from '@fluentui/react/lib/Icons';

//import './custom.css'
import { DataTemplate } from '@antimatterjs/positron/src/FrameworkTemplate';
import ViewerTest from './components/ViewerTest';
import DataGridTest from './components/DataGridTest';
import PinnablePanelTest from './components/PinnablePanelTest';


const theme = createTheme({
    // You can also modify certain other properties such as fontWeight if desired
    //defaultFontStyle: { fontFamily: 'Roboto' },
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
                <Panel VerticalAlignment={VerticalAlignment.Top} >
                    <Employee Value={new Binding({ Path: "Employee", Source: vm })}/>
                </Panel>
            )
        )
    }

    private employeeTemplate: DataTemplate = new DataTemplate(
        (item) => (
            <StackPanel Orientation={Orientation.Horizontal}>
                <Icon iconName="e96a"
                    style={{
                        alignSelf: "center",
                        margin: "0px 5px 0px 0px"
                    }}/>
                <TextBlock Text={new Binding({ Path: "FullName", Source: item })}
                    Foreground={new Binding({ Path: "Color", Source: item })}  />
            </StackPanel>),
        {
            Layout: WindowLayout.Tablet,
            VisualTree: (item) => (
                <StackPanel Orientation={Orientation.Horizontal}>
                    <Icon iconName="e96a"
                        style={{
                            alignSelf: "center",
                            margin: "0px 5px 0px 0px"
                        }} />
                    <TextBlock Text={new Binding({ Path: "FullName", Source: item })}/>
                    <TextBlock Text="Tablet!" />
                </StackPanel>
            )
        });

    render()
    {
        return (
            <Window
                Model={this.state.Model}
                Dialogs={new Binding({ Path: "Dialogs", Source: this.state.Model, NotifyCollectionChanged: true })}>
                    <NavMenu Style={NavMenu.DefaultStyle}
                        Items={
                            [
                                {
                                    Label: "Company",
                                    Icon: 0xF084,
                                    IconForeground: "white",
                                    IconBackground: "blue",
                                    Key: "company",
                                    Description: "Edit company details",
                                    Content: (
                                        <DataContext Value={new Binding("Company")}>
                                            <Company />
                                        </DataContext>
                                    )
                                },
                                {
                                    Label: "PDF Viewer",
                                    Icon: 0xF038,
                                    Padding: "0px",
                                    IconForeground: "white",
                                    IconBackground: "red",
                                    Key: "pdfviewer",
                                    Description: "Test PDF Viewer",
                                    Content: (<ViewerTest />)
                                },
                                {
                                    Label: "Data Grid",
                                    Icon: "GridViewSmall",
                                    IconBackground: "green",
                                    IconForeground: "white",
                                    Key: "datagrid",
                                    Content: (                                        
                                        <DataGridTest ViewModel={new Binding("Company")} />                                        
                                    )
                                },
                                {
                                    Label: "Panels",
                                    Icon: "SidePanelMirrored",
                                    IconBackground: "orange",
                                    IconForeground: "white",
                                    Key: "panels",
                                    Padding: "0px",
                                    Content: (
                                        <PinnablePanelTest />
                                    )
                                }
                            ]} />


                
            </Window>

            //<Layout>
            //    <Route exact path='/' component={Home} />
            //    <Route path='/counter' component={Company} />
            //    <Route path='/fetch-data' component={FetchData} />
            //</Layout>
        );
    }
}
