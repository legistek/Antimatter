import React from "react";

import { Binding, BindingMode, INotifyPropertyChanged, PropertyChangedEventArgs } from "@antimatterjs/react";
import { DefaultEffects } from "@fluentui/react";

import { CommandButton, PinnablePanelState, DocumentViewer, Grid, HorizontalAlignment, IDocument, IViewProps, IViewState, Orientation, Panel, PDFJSDocument, PinnablePanel, ScrollBarVisibility, Side, StackPanel, TextBlock, TextBox, VerticalAlignment, View, ViewBase } from "@antimatterjs/positron";

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
    
    Template(): JSX.Element
    {        
        return (
            <Grid ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}>
                <StackPanel
                    Grid={{ Column: 0 }}
                    VerticalScrollBarVisibility={ScrollBarVisibility.Auto}>
                    <TextBlock Text="Some Content" />
                    <CommandButton Label="Open Panel"
                        Command={() => this.PinState = PinnablePanelState.Floating}
                        IsEnabled={new Binding({
                            Path: nameof(this.PinState),
                            Source: this,
                            Converter: (state: PinnablePanelState) => state === PinnablePanelState.Collapsed
                        })} />
                </StackPanel>

                <PinnablePanel
                    State={new Binding({
                        Path: nameof(this.PinState),
                        Source: this,
                        Mode: BindingMode.TwoWay
                    })}
                    Side={Side.Right}
                    Grid={{ Column: 1 }}>
                    <TextBlock Margin="5px 5px 5px 30px" Text="Pinned Content" />
                </PinnablePanel>


            </Grid>);
    }
}