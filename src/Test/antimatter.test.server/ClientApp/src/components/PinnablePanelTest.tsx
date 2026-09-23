import React from "react";

import { Binding, BindingMode, INotifyPropertyChanged, PropertyChangedEventArgs } from "@antimatterjs/react";
import { DefaultEffects } from "@fluentui/react";

import
    {
        CommandButton, DocumentViewer,
        Grid, HorizontalAlignment, IDocument, IViewProps,
        Orientation, Panel, PDFJSDocument, PinnablePanel, ScrollBarVisibility,
        Side, StackPanel, TextBlock, TextBox, VerticalAlignment, View, ViewBase, TabControl, IFrameworkElementState
    } from "@antimatterjs/positron";
import { Employee } from "./Company";

interface IPinnablePanelTestState extends IFrameworkElementState
{
    IsPinned?: boolean;
    IsCollapsed?: boolean;
}

export default class PinnablePanelTest extends ViewBase<IViewProps>
{
    private _isCollapsed: boolean = false;
    public get IsCollapsed(): boolean
    {
        return this._isCollapsed;
    }
    public set IsCollapsed(value: boolean)
    {
        if (this._isCollapsed === value)
            return;
        this._isCollapsed = value;
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.IsCollapsed)));
    }

    private _isPinned: boolean = true;
    public get IsPinned(): boolean
    {
        return this._isPinned;
    }
    public set IsPinned(value: boolean)
    {
        if (this._isPinned === value)
            return;
        this._isPinned = value;
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.IsPinned)));
    }

    View(): JSX.Element
    {
        return (
            <Grid ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}>
                <Grid
                    Grid={{ Column: 0 }}
                    RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}
                    //VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                >
                    <CommandButton Label="Open Panel"
                        Command={() =>
                        {
                            this.IsCollapsed = false;
                            this.IsPinned = false;
                        }}
                        IsEnabled={new Binding({
                            Path: nameof(this.IsCollapsed),
                            Source: this
                        })} />

                    {/*<Employee ViewModel={new Binding("Company.CEO")} />*/}
                    {this.tabControls(Orientation.Vertical)}

                </Grid>

                <PinnablePanel
                    IsCollapsed={new Binding({
                        Path: nameof(this.IsCollapsed),
                        Source: this,
                        Mode: BindingMode.TwoWay
                    })}
                    IsPinned={new Binding({
                        Path: nameof(this.IsPinned),
                        Source: this,
                        Mode: BindingMode.TwoWay
                    })}
                    Size={400}
                    Side={Side.Right}
                    Grid={{ Column: 1 }}>
                    <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                        <TextBlock
                            Margin="5px 5px 5px 30px"
                            Text="Some Panel Content"/>

                        {this.tabControls(Orientation.Horizontal)}

                    </Grid>
                </PinnablePanel>


            </Grid>);
    }

    private tabControls(orientation?: Orientation): JSX.Element {
        return (
            <TabControl Grid={{ Row: 1 }}
                Orientation={orientation}
                MinTabWidth={125}
                Items={
                    [
                        {
                            Key: "overview",
                            Label: "OVERVIEW",
                            Icon: 0xF0F5,
                            Content: (<Employee VerticalAlignment={VerticalAlignment.Top} ViewModel={new Binding("Company.CEO")} />)
                        },
                        {
                            Key: "properties",
                            Label: "PROPERTIES",
                            Icon: 0xF021,
                            Content: (<TextBlock Text="Properties Tab" />)
                        },
                        {
                            Key: "annotations",
                            Label: "ANNOTATIONS",
                            Icon: 0xF0A4,
                            Content: (<TextBlock Text="Annotations Tab" />)
                        },
                        {
                            Key: "citations",
                            Label: "CITATIONS",
                            Icon: 0xF101,
                            Content: (<TextBlock Text="Citations Tab" />)
                        },
                    ]}
            />
        );
    }
}