import { Component } from 'react';
import * as React from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Company, Employee } from './components/Company';
import { createTheme, Icon, loadTheme } from '@fluentui/react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { DialogBox, Grid, HorizontalAlignment, MultitouchTransform, Orientation, Panel, PinnablePanel, PinnablePanelBase, ResizePanel, Side, StackPanel, NavMenu, TextBlock, TreeView, VerticalAlignment, Window, WindowLayout, MessageBar, ThemeLayout } from '@antimatterjs/positron';
import { initializeIcons } from '@fluentui/react/lib/Icons';

import * as Model from './model/Model';

//import './custom.css'
import { DataTemplate, DataTemplateValue } from '@antimatterjs/positron/src/FrameworkTemplate';
import ViewerTest from './components/ViewerTest';
import DataGridTest from './components/DataGridTest';
import PinnablePanelTest from './components/PinnablePanelTest';
import ControlGallery1 from './components/ControlGallery1';
import Files from './components/Files';
import DragDrop from './components/DragDrop';


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
                    <Employee ViewModel={new Binding({ Path: "Employee", Source: vm })} />
                </Panel>
            )
        )
    }

    private static DialogTemplate: DataTemplateValue = (item) => (
        <DataContext Value={item}>
            <DialogBox
                Title={new Binding(nameof<Model.DialogViewModel>(m => m.Title))}
                CancelCommand={new Binding(nameof<Model.DialogViewModel>(m => m.CancelCommand))}
                PrimaryCommands={new Binding(nameof<Model.DialogViewModel>(m => m.PrimaryCommands))}
                SecondaryCommands={new Binding(nameof<Model.DialogViewModel>(m => m.SecondaryCommands))}
                DialogTemplate={new Binding(nameof<Model.DialogViewModel>(m => m.DialogTemplate))}
                Icon={new Binding(nameof<Model.DialogViewModel>(m => m.Icon))}
                ViewModel={item} />
        </DataContext>
    );

    private static ToastTemplate: DataTemplateValue = (params: ModelObjectReference) => (
        <MessageBar
            Content={new Binding({ Path: "Content", Source: params })}
            MessageBarType={new Binding({ Path: "MessageBarType", Source: params })}
            PrimaryCommand={new Binding({ Path: "PrimaryCommand", Source: params })}
            SecondaryCommand={new Binding({ Path: "SecondaryCommand", Source: params })}
            ShowCloseButton={new Binding({ Path: "ShowCloseButton", Source: params })}
            Duration={new Binding({ Path: "Duration", Source: params })}
            IsVisible={new Binding({ Path: "IsVisible", Source: params })}
            Animate={true}
            Margin={ThemeLayout.MarginWideLTRB}
        />);

    private employeeTemplate: DataTemplateValue = {
        [WindowLayout.Default]:
            (item) => (
                <StackPanel Orientation={Orientation.Horizontal}>
                    <Icon iconName="e96a"
                        style={{
                            alignSelf: "center",
                            margin: "0px 5px 0px 0px"
                        }}/>
                    <TextBlock Text={new Binding({ Path: "FullName", Source: item })}
                        Foreground={new Binding({ Path: "Color", Source: item })}  />
                </StackPanel>
            ),
        [WindowLayout.Tablet]: 
            (item) => (
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
        };

    render()
    {
        return (
            <Window
                ToastTemplate={App.ToastTemplate}
                Toasts={new Binding({
                    Source: this.state.Model,
                    Path: "Company.Toasts",
                    NotifyCollectionChanged: true
                })}
                Model={this.state.Model}
                DialogTemplate={App.DialogTemplate}
                Dialogs={new Binding({
                    Path: "Dialogs",
                    Source: this.state.Model,
                    NotifyCollectionChanged: true
                })}>
                    <NavMenu Style={NavMenu.DefaultStyle}
                        Items={
                            [
                                {
                                    Label: "Empty",
                                    Icon: 0xF03B,
                                    IconForeground: "white",
                                    IconBackground: "black",
                                    Key: "empty",
                                    Description: "Nothing to see here",
                                    Content: (<Grid> </Grid>)
                                },
                                {
                                    Label: "Control Gallery 1",
                                    Icon: 0xF03B,
                                    IconForeground: "white",
                                    IconBackground: "purple",
                                    Key: "controls1",
                                    Description: "Gallery of Positron controls",
                                    Content: (<ControlGallery1 />)
                                },
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
                                },
                                {
                                    Label: "Files",
                                    Icon: "Save",
                                    IconBackground: "#00FFFF",
                                    IconForeground: "white",
                                    Key: "files",
                                    Content: (
                                        <Files ViewModel={new Binding("Files")} />
                                    )
                                },
                                {
                                    Label: "Drag & Drop",
                                    Key: "dragdrop",
                                    Icon: "DragObject",
                                    Content: (<DragDrop ViewModel={new Binding("Company.DragDrop")} />)
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
