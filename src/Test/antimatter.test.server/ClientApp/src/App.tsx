import * as React from 'react';
import { Company, Employee } from './components/Company';
import { createTheme, Icon, loadTheme } from '@fluentui/react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent, Utilities } from '@antimatterjs/react';
import
{
    DataTemplate, DialogBox, Grid, HorizontalAlignment, MultitouchTransform,
    Application,
    Orientation, Panel, PinnablePanel, PinnablePanelBase, ResizePanel, Side, StackPanel, NavMenu, TextBlock, TreeView, VerticalAlignment, Window, WindowLayout, MessageBar, ThemeLayout, ScrollBarVisibility, ThemeColor, PositronTheme
} from '@antimatterjs/positron';
import { initializeIcons } from '@fluentui/react/lib/Icons';

import * as Model from './model/Model';

//import './custom.css'

import ViewerTest from './components/ViewerTest';
import DataGridTest from './components/DataGridTest';
import PinnablePanelTest from './components/PinnablePanelTest';
import ControlGallery1 from './components/ControlGallery1';
import Files from './components/Files';
import DragDrop from './components/DragDrop';
import Images from './components/Images';
import ScrollBars from './components/ScrollBars';
import { Drawing } from './components/Drawing';
import Video from './components/Video';
import { TextGridView } from './components/TextGrid';


const theme = createTheme({
    // You can also modify certain other properties such as fontWeight if desired
    palette: {
        themePrimary: '#2e70e0',
        themeLighterAlt: '#f6f9fe',
        themeLighter: '#dae6fa',
        themeLight: '#bcd1f6',
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
        Application.SetTheme(new PositronTheme());
    }

    RegisterDialogs()
    {
        DialogBox.RegisterTemplate(
            "EmployeeDialog",
            (vm) =>
            (
                <Panel VerticalAlignment={VerticalAlignment.Stretch} VerticalScrollBarVisibility={ScrollBarVisibility.Auto} >
                    <Employee
                        VerticalAlignment={VerticalAlignment.Top}
                        ViewModel={new Binding({ Path: "Employee", Source: vm })}

                    />
                </Panel>
            )
        )
    }

    private static DialogTemplate: DataTemplate = (item) => (
        <DataContext Value={item}>
            <DialogBox
                Title={new Binding(nameof<Model.DialogViewModel>(m => m.Title))}
                CancelCommand={new Binding(nameof<Model.DialogViewModel>(m => m.CancelCommand))}
                PrimaryCommands={new Binding(nameof<Model.DialogViewModel>(m => m.PrimaryCommands))}
                SecondaryCommands={new Binding(nameof<Model.DialogViewModel>(m => m.SecondaryCommands))}
                DialogTemplate={new Binding(nameof<Model.DialogViewModel>(m => m.DialogTemplate))}
                Icon={new Binding(nameof<Model.DialogViewModel>(m => m.Icon))}
                IsBusy={false}
                ViewModel={item} />
        </DataContext>
    );

    private static ToastTemplate: DataTemplate = (params: ModelObjectReference) => (
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

    private employeeTemplate: DataTemplate = {
        [WindowLayout.Default]:
            (item) => (
                <StackPanel Orientation={Orientation.Horizontal}>
                    <Icon iconName="e96a"
                        style={{
                            alignSelf: "center",
                            margin: "0px 5px 0px 0px"
                        }} />
                    <TextBlock Text={new Binding({ Path: "FullName", Source: item })}
                        Foreground={new Binding({ Path: "Color", Source: item })} />
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
                    <TextBlock Text={new Binding({ Path: "FullName", Source: item })} />
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
                Background={ThemeColor.NeutralLight}
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
                                Label: "Images",
                                Icon: "PictureFill",
                                IconForeground: "white",
                                IconBackground: "black",
                                Key: "images",
                                Description: "Images in various configurations",
                                Content: (<Images />)
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
                                Label: "Scrolling",
                                Icon: 0xF03B,
                                IconForeground: "white",
                                IconBackground: "purple",
                                Key: "scrollbars",
                                Description: "Demonstrates detached scrollbars independent of the scrolling panel",
                                Content: (<ScrollBars />)
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
                            },
                            {
                                Label: "Drawing",
                                Key: "drawing",
                                Icon: "DragObject",
                                Content: (<Drawing ViewModel={new Binding("Drawing")} />)
                            },
                            {
                                Label: "Video",
                                Key: "video",
                                Icon: "Movie",
                                Content: (<Video ViewModel={new Binding("Video")} />)
                            },
                            {
                                Label: "Text Grid",
                                Key: "textgrid",
                                Icon: "Grid",
                                Content: (<TextGridView ViewModel={new Binding("TextGrid")} />)
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



/*
import { useEffect, useState } from 'react';
import * as AmxReact from '@antimatterjs/react';

import './App.css';

interface Forecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}

function App()
{
    var foo = new AmxReact.Binding();

    let s = nameof(foo);

    const [forecasts, setForecasts] = useState<Forecast[]>();

    useEffect(() => {
        populateWeatherData();
    }, []);

    const contents = forecasts === undefined
        ? <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></p>
        : <table className="table table-striped" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Temp. (C)</th>
                    <th>Temp. (F)</th>
                    <th>Summary</th>
                </tr>
            </thead>
            <tbody>
                {forecasts.map(forecast =>
                    <tr key={forecast.date}>
                        <td>{forecast.date}</td>
                        <td>{forecast.temperatureC}</td>
                        <td>{forecast.temperatureF}</td>
                        <td>{forecast.summary}</td>
                    </tr>
                )}
            </tbody>
        </table>;

    return (
        <div>
            <h1 id="tableLabel">Weather forecast</h1>
            <p>This component demonstrates fetching data from the server.</p>
            {contents}
        </div>
    );

    async function populateWeatherData() {
        const response = await fetch('weatherforecast');
        if (response.ok) {
            const data = await response.json();
            setForecasts(data);
        }
    }
}

export default App;

*/