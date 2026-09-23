import React from "react";

import * as Model from '../model/Model';

import { Binding, BindingMode, DataContext, INotifyPropertyChanged, ModelValueType, PropertyChangedEventArgs } from "@antimatterjs/react";
import { Button, DefaultEffects } from "@fluentui/react";

import
{
    CommandButton, DocumentViewer, RadioButton, ButtonScrollPanel,
    Grid, HorizontalAlignment, IDocument, IViewProps,
    Orientation, Panel, PDFJSDocument, PinnablePanel, ScrollBarVisibility,
    Side, StackPanel, TextBlock, TextBox, VerticalAlignment, View, ViewBase, TabControl, WrapPanel, ComboBox, CommandBar, IconCommandButton, FontStyle, DataTemplate, SelectionMode, CheckBox, PasswordBox, ScrollBar, MultimediaPresenter, LinedTextGrid,
} from "@antimatterjs/positron";

export class TextGridView extends View
{
    override View()
    {
        return (<LinedTextGrid
            CanSelect={false}
            CanSelectText={true}
            RowHeight={20}
            TextSelection={new Binding({
                Path: "Selection",
                Mode: BindingMode.TwoWay,
            }) }
            ItemsSource={new Binding("Lines")}
            Columns={[
                {
                    Header: "Text",
                    BindingPath: "Text",
                    Type: ModelValueType.String,
                    Key: "text",
                    Template: (item) => <TextBlock
                        Cursor="text"
                        CanSelect={true}
                        DisplayAsHTML={true}
                        Text={new Binding("Text")} />
                }
            ]}
        />);
    }
}