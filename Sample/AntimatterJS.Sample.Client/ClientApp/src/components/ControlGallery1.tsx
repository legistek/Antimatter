import React from "react";

import { Binding, BindingMode, INotifyPropertyChanged, PropertyChangedEventArgs } from "@antimatterjs/react";
import { DefaultEffects } from "@fluentui/react";

import
{
    CommandButton, PinnablePanelState, DocumentViewer,
    Grid, HorizontalAlignment, IDocument, IViewProps, IViewState,
    Orientation, Panel, PDFJSDocument, PinnablePanel, ScrollBarVisibility,
    Side, StackPanel, TextBlock, TextBox, VerticalAlignment, View, ViewBase, TabControl, WrapPanel, ComboBox, CommandBar, IconCommandButton, FontStyle
} from "@antimatterjs/positron";
import { Employee } from "./Company";
import { Icon } from "@fluentui/react";

export default class ControlGallery1 extends View
{
    override View()
    {
        return (
            <TabControl Items={[
                {
                    Label: "Buttons",
                    Key: "buttons",
                    Content: (<StackPanel
                        VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                        Orientation={Orientation.Vertical}>
                        <TextBlock Text="Normal Buttons" Style={TextBlock.ControlSectionHeaderStyle} />
                        <WrapPanel>
                            <CommandButton Label="No Icon" VerticalAlignment={VerticalAlignment.Center} />
                            <CommandButton Label="Icon"
                                VerticalAlignment={VerticalAlignment.Center}
                                Icon={"People"} />
                            <CommandButton Label="Menu"
                                VerticalAlignment={VerticalAlignment.Center}
                                SecondaryCommandsSource={new Binding("Company.CEO.Commands")}
                                Icon={0xF000} />
                            <CommandButton
                                VerticalAlignment={VerticalAlignment.Center}
                                IsEnabled={false}
                                Label="Disabled" />
                            <CommandButton
                                VerticalAlignment={VerticalAlignment.Center}
                                Label="Customized"
                                Foreground="#80FF80"
                                FontSize={FontStyle.SuperLarge}
                                FontFamily="Times New Roman"
                                BorderThickness="4px"
                                Background="Purple"
                                BorderBrush="Yellow" />
                        </WrapPanel>

                        <TextBlock Text="Dialog Buttons" Style={TextBlock.ControlSectionHeaderStyle} />
                        <WrapPanel>

                            <CommandButton
                                IsDefault={true}
                                Style={CommandButton.DialogButtonStyle}
                                Label="OK" />

                            <CommandButton
                                Style={CommandButton.DialogButtonStyle}
                                Label="Cancel" />

                            <CommandButton
                                IsDefault={true}
                                IsEnabled={false}
                                Style={CommandButton.DialogButtonStyle}
                                Label="OK (Disabled)" />

                            <CommandButton
                                IsEnabled={false}
                                Style={CommandButton.DialogButtonStyle}
                                Label="Cancel (Disabled)" />

                        </WrapPanel>

                        <TextBlock Text="Command Bar" Style={TextBlock.ControlSectionHeaderStyle} />
                        <CommandBar ItemsSource={new Binding("Company.CEO.Commands")} />

                        <TextBlock Text="Specialty Buttons" Style={TextBlock.ControlSectionHeaderStyle} />
                        <WrapPanel>
                            <StackPanel>
                                <TextBlock Text="Icon Button" Style={TextBlock.ControlSectionHeaderStyle} />
                                <IconCommandButton
                                    HorizontalAlignment={HorizontalAlignment.Center}
                                    Style={CommandButton.IconButtonStyle}
                                    Label="Icon Button"
                                    Icon="ReportHacked" />

                                <IconCommandButton
                                    HorizontalAlignment={HorizontalAlignment.Center}
                                    Style={CommandButton.IconButtonStyle}
                                    SecondaryCommandsSource={new Binding("Company.CEO.Commands")}
                                    Icon={0xF000} />

                                <IconCommandButton
                                    IsEnabled={false}
                                    HorizontalAlignment={HorizontalAlignment.Center}
                                    Style={CommandButton.IconButtonStyle}
                                    SecondaryCommandsSource={new Binding("Company.CEO.Commands")}
                                    Icon={0xF000} />

                                <IconCommandButton
                                    HorizontalAlignment={HorizontalAlignment.Center}
                                    Style={CommandButton.IconButtonStyle}
                                    IsEnabled={false}
                                    Icon="Folder" />
                            </StackPanel>

                            <StackPanel>
                                <TextBlock Text="Circle Button" Style={TextBlock.ControlSectionHeaderStyle} />
                                <CommandButton
                                    Background="blue"
                                    HorizontalAlignment={HorizontalAlignment.Center}
                                    Style={CommandButton.CircleButtonStyle}
                                    Icon={0xE90C} />
                            </StackPanel>

                        </WrapPanel>
                    </StackPanel>)
                },
                {
                    Label: "Boxes",
                    Key: "boxes",
                    Content: (
                        <StackPanel>
                            <WrapPanel>
                                <TextBox Label="Normal"
                                    IconName={"Contact"}
                                    PlaceholderText="Placeholder" />
                                <TextBox Label="Disabled" IsEnabled={false} Text="Disabled Text" />
                                <TextBox Label="Validation Error"
                                    Text="Invalid Text"
                                    ValidationError="Invalid Input"

                                />
                                <TextBox Label="Customized"
                                    Background="Yellow"
                                    Foreground="Orange"
                                    Text="Customized Text"
                                />
                            </WrapPanel>
                        </StackPanel>)
                }

            ]} />
        )
    }
}
