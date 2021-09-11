import React from "react";

import { Binding, BindingMode, INotifyPropertyChanged, PropertyChangedEventArgs } from "@antimatterjs/react";
import { DefaultEffects } from "@fluentui/react";

import
    {
        CommandButton, PinnablePanelState, DocumentViewer,
        Grid, HorizontalAlignment, IDocument, IViewProps, IViewState,
        Orientation, Panel, PDFJSDocument, PinnablePanel, ScrollBarVisibility,
        Side, StackPanel, TextBlock, TextBox, VerticalAlignment, View, ViewBase, TabControl
    } from "@antimatterjs/positron";
import { Employee } from "./Company";

interface IPinnablePanelTestState extends IViewState
{
    PanelState?: PinnablePanelState,
}

export default class PinnablePanelTest extends ViewBase<IViewProps, IPinnablePanelTestState>    
{
    constructor(props)
    {
        super(props);
        (this.state as any)["PanelState"] = PinnablePanelState.Pinned;
    }
    
    private _pinState: PinnablePanelState = PinnablePanelState.Pinned;
    public get PinState(): PinnablePanelState
    {
        return this._pinState;
    }
    public set PinState(value: PinnablePanelState)
    {
        if (this._pinState === value)
            return;
        this._pinState = value;
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.PinState)));
    }  
    
    View(): JSX.Element
    {        
        return (
            <Grid ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}>
                <StackPanel
                    Grid={{ Column: 0 }}
                    VerticalScrollBarVisibility={ScrollBarVisibility.Auto}>
                    <CommandButton Label="Open Panel"
                        Command={() => this.PinState = PinnablePanelState.Floating}
                        IsEnabled={new Binding({
                            Path: nameof(this.PinState),
                            Source: this,
                            Converter: (state: PinnablePanelState) => state === PinnablePanelState.Collapsed
                        })} />

                    <Employee Value={new Binding("Company.CEO")} />


                </StackPanel>

                <PinnablePanel
                    State={new Binding({
                        Path: nameof(this.PinState),
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
                        <TabControl Grid={{ Row: 1 }}
                            MinTabWidth={125}
                            Items={
                                [
                                    {
                                        Key: "overview",
                                        Label: "OVERVIEW",
                                        Icon: 0xF0F5,
                                        Content: (<Employee Value={new Binding("Company.CEO")} />)
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
                                ]} />
                    </Grid>
                </PinnablePanel>


            </Grid>);
    }
}