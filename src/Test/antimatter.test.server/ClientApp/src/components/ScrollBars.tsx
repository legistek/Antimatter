import React from "react";

import * as Model from '../model/Model';

import { Binding, BindingMode, DataContext, INotifyPropertyChanged, PropertyChangedEventArgs } from "@antimatterjs/react";
import { Button, DefaultEffects } from "@fluentui/react";

import
{
    CommandButton, DocumentViewer, RadioButton, ButtonScrollPanel,
    Grid, HorizontalAlignment, IDocument, IViewProps,
    Orientation, Panel, PDFJSDocument, PinnablePanel, ScrollBarVisibility,
    Side, StackPanel, TextBlock, TextBox, VerticalAlignment, View, ViewBase, TabControl, WrapPanel, ComboBox, CommandBar, IconCommandButton, FontStyle, DataTemplate, SelectionMode, CheckBox, PasswordBox, ScrollBar,
} from "@antimatterjs/positron";
import { Employee } from "./Company";
import { Icon } from "@fluentui/react";

export default class ScrollBars extends View
{
    private _hscroll?: ScrollBar | null;
    private _vscroll?: ScrollBar | null;
    private _hpanel?: Panel | null;
    private _vpanel?: Panel | null;

    override OnComponentMount()
    {
        if (this._hscroll)
            this._hpanel?.LinkDetachedScrollers([this._hscroll]);
        if (this._vscroll)
            this._vpanel?.LinkDetachedScrollers([this._vscroll]);
    }

    override View()
    {
        return (
            <Grid RowDefinitions={ [Grid.RowDefinition(1,true), Grid.RowDefinition(1,true)]}>
                <StackPanel>
                    <TextBlock Text="Scrollable Contnet" />

                    <ButtonScrollPanel>

                        <StackPanel                                        
                            VerticalAlignment={VerticalAlignment.Center}
                            HorizontalAlignment={HorizontalAlignment.Left}
                            Orientation={Orientation.Horizontal}>

                            <Panel
                                Width={300}
                                Height={150}
                                Background="red" />
                            <Panel
                                Width={300}
                                Height={150}
                                Background="orange" />
                            <Panel
                                Width={300}
                                Height={150}
                                Background="red" />

       
                        </StackPanel>

                    </ButtonScrollPanel>

                    <TextBlock Text="The Detached Scrollbar" />

                    <ScrollBar
                        ref={
                            r =>
                                this._hscroll = r
                        }
                        Orientation={Orientation.Horizontal} />

                </StackPanel>

                <Grid Grid={{ Row: 1 }} ColumnDefinitions={[Grid.ColumnDefinition(1,true),Grid.ColumnDefinition(1,true)] }>
                    
                    <StackPanel
                        ref={r => this._vpanel = r}
                        Grid={{ Column: 0 }} Orientation={Orientation.Vertical}
                        VerticalScrollBarVisibility={ScrollBarVisibility.Auto}>
                        <Panel
                            Width={300}
                            Height={150}
                            Background="red" />
                        <Panel
                            Width={300}
                            Height={150}
                            Background="orange" />
                        <Panel
                            Width={300}
                            Height={150}
                            Background="yellow" />
                        <Panel
                            Width={300}
                            Height={150}
                            Background="green" />
                        <Panel
                            Width={300}
                            Height={150}
                            Background="blue" />
                        <Panel
                            Width={300}
                            Height={150}
                            Background="purple" />
                    </StackPanel>

                    <ScrollBar
                        HorizontalAlignment={HorizontalAlignment.Center}
                        Margin="50px 0px"
                        ref={r => this._vscroll = r}
                        Grid={{ Column: 1 }} Orientation={Orientation.Vertical} />
                    

                </Grid>

            </Grid>
        );
    }
}