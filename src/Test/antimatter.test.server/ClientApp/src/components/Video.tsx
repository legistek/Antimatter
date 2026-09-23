import React from "react";

import * as Model from '../model/Model';

import { Binding, BindingMode, DataContext, INotifyPropertyChanged, PropertyChangedEventArgs } from "@antimatterjs/react";
import { Button, DefaultEffects } from "@fluentui/react";

import
{
    CommandButton, DocumentViewer, RadioButton, ButtonScrollPanel,
    Grid, HorizontalAlignment, IDocument, IViewProps,
    Orientation, Panel, PDFJSDocument, PinnablePanel, ScrollBarVisibility,
    Side, StackPanel, TextBlock, TextBox, VerticalAlignment, View, ViewBase, TabControl, WrapPanel, ComboBox, CommandBar, IconCommandButton, FontStyle, DataTemplate, SelectionMode, CheckBox, PasswordBox, ScrollBar, MultimediaPresenter,
} from "@antimatterjs/positron";
import { Employee } from "./Company";
import { Icon } from "@fluentui/react";

export default class Video extends View
{
    override View()
    {
        return (
            <Grid RowDefinitions={[Grid.RowDefinition(1, true), Grid.RowDefinition(), Grid.RowDefinition()]}>
                <MultimediaPresenter
                    DefaultControls={true}
                    StopAt={new Binding("StopPoint", pt => pt * 1000)}
                    StatusCallbackCommand={new Binding("MediaStatusCommand")}
                    LoadedCommand={new Binding("LoadedCommand")}
                    Uri="/data/samplevideo" />
                <TextBlock
                    Grid={{Row: 2}}
                    Text={new Binding("Status")} />
                <TextBox
                    Text={new Binding("StopPoint")}
                    Grid={{ Row: 3 }}
                />
                

            </Grid>
            );
    }
}