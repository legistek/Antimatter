import React from "react";

import { Binding, BindingMode, INotifyPropertyChanged, PropertyChangedEventArgs } from "@antimatterjs/react";
import { DefaultEffects } from "@fluentui/react";

import
{
    CommandButton, PinnablePanelState, DocumentViewer,
    Grid, HorizontalAlignment, IDocument, IViewProps, IViewState,
    Orientation, Panel, PDFJSDocument, PinnablePanel, ScrollBarVisibility,
    Side, StackPanel, TextBlock, TextBox, VerticalAlignment, View, ViewBase, TabControl, WrapPanel, ComboBox
} from "@antimatterjs/positron";
import { Employee } from "./Company";
import { Icon } from "@fluentui/react";

export default class ControlGallery1 extends View
{
    override View()
    {
        return (
            <StackPanel
                VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                Orientation={Orientation.Vertical}>
                <TextBlock Text="Buttons" Style={TextBlock.ControlSectionHeaderStyle} />
                <WrapPanel>
                    <CommandButton Label="Basic" />
                    <CommandButton Label="Icon"
                        Icon={"People"}/>
                    <CommandButton
                        IsEnabled={false}
                        Label="Disabled"/>

                    <StackPanel>
                        <TextBlock Text="Icon Button" Style={TextBlock.ControlSectionHeaderStyle}/>
                        <CommandButton
                            HorizontalAlignment={HorizontalAlignment.Center}
                            Style={CommandButton.IconButtonStyle}
                            Label="Icon Button"
                            Icon="ReportHacked" />
                    </StackPanel>

                    <CommandButton
                        IsDefault={true}
                        Style={CommandButton.DialogButtonStyle}
                        Label="Dialog Button (Default)" />

                    <CommandButton
                        Style={CommandButton.DialogButtonStyle}
                        Label="Dialog Button" />

                </WrapPanel>
            </StackPanel>);
    }
}