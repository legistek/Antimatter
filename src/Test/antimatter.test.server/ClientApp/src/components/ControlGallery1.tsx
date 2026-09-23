import React from "react";

import * as Model from '../model/Model';

import { Binding, BindingMode, DataContext, INotifyPropertyChanged, PropertyChangedEventArgs } from "@antimatterjs/react";
import { DefaultEffects } from "@fluentui/react";

import
{
    Slider,
    CommandButton, DocumentViewer, RadioButton, Expander,
    Grid, HorizontalAlignment, IDocument, IViewProps,
    Orientation, Panel, PDFJSDocument, PinnablePanel, ScrollBarVisibility,
    Side, StackPanel, TextBlock, TextBox, VerticalAlignment, View, ViewBase,
    TabControl, WrapPanel, ComboBox, CommandBar, IconCommandButton, FontStyle,
    DataTemplate, SelectionMode, CheckBox, PasswordBox, ToggleSwitch, LabelledToggleButton, VolumeSlider, ImageSubmissionControl, MentionTextBox
} from "@antimatterjs/positron";
import { Employee } from "./Company";
import { Icon } from "@fluentui/react";

export default class ControlGallery1 extends View
{
    private static EmployeeTemplate: DataTemplate = item => (
        <TextBlock
            Text={new Binding({ Path: nameof<Model.Employee>(e => e.FullName), Source: item })}
            VerticalAlignment={VerticalAlignment.Center}
            Style={ComboBox.DefaultTextblockStyle}
        />);

    override View()
    {
        return (
            <TabControl
                Style={TabControl.SimplifiedBottomTabStyle}
                Items={[
                {
                    Label: "Buttons",
                    Key: "buttons",
                    Content: (<StackPanel
                        VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                        Orientation={Orientation.Vertical}>

                        <ImageSubmissionControl                            
                            ImageMaxHeight={200}
                            ImageMaxWidth={200}
                            MinWidth={500}
                            MinHeight={500} />


                        <TextBlock Text="Primary Buttons" Style={TextBlock.ControlSectionHeaderStyle} />
                        <WrapPanel>
                            <CommandButton Label="No Icon" VerticalAlignment={VerticalAlignment.Center} />
                            <CommandButton Label="Icon"
                                VerticalAlignment={VerticalAlignment.Center}
                                Icon={"People"} />
                            <CommandButton Label="Menu"
                                VerticalAlignment={VerticalAlignment.Center}
                                ContextMenuCommands={new Binding("Company.CEO.Commands")}
                                Icon={0xF000} />
                            <CommandButton
                                VerticalAlignment={VerticalAlignment.Center}
                                IsEnabled={false}
                                Label="Disabled" />
                        </WrapPanel>
                        <CommandButton
                            VerticalAlignment={VerticalAlignment.Center}
                            Label="Customized"
                            Foreground="#80FF80"
                            FontSize={FontStyle.SuperLarge}
                            FontFamily="Times New Roman"
                            BorderThickness="4px"
                            Background="Purple"
                            BorderBrush="Yellow" />

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

                        <TextBlock Text="Command Bar Buttons" Style={TextBlock.ControlSectionHeaderStyle} />
                        <CommandBar ItemsSource={new Binding("Company.CEO.Commands")} />

                        {/*CheckBox*/}
                        <TextBlock Text="CheckBox" Style={TextBlock.ControlSectionHeaderStyle} />
                        <WrapPanel>
                            <CheckBox
                                InfoTip="This control is very useful"
                                Label="Normal" />
                            <CheckBox
                                Label="Disabled"
                                IsEnabled={false} />
                            <CheckBox
                                IsEnabled={false}
                                IsChecked={true}
                                Label="Checked Disabled" />
                            <CheckBox
                                Label="Indeterminate"
                                IsThreeState={true}
                                IsChecked={undefined} />
                            <CheckBox
                                Label="Invalid Choice"
                                ValidationError="You can't choose this!"
                                IsChecked={true} />
                        </WrapPanel>
                        <CheckBox Label="Customized"
                            Background="Green"
                            BorderBrush="Orange"
                            BorderThickness="3px"
                            Padding="5px"
                            FontSize={FontStyle.ExtraLarge}
                            FontFamily="Times New Roman"
                            Foreground="Purple" />

                        <TextBlock Text="Radio Button" Style={TextBlock.ControlSectionHeaderStyle} />
                        <WrapPanel>
                            <RadioButton
                                InfoTip="This control is very useful"
                                Label="Normal" />
                            <RadioButton
                                Label="Disabled"
                                IsEnabled={false} />
                            <RadioButton
                                IsEnabled={false}
                                IsChecked={true}
                                Label="Checked Disabled" />
                            <RadioButton
                                Label="Unselectable"
                                IsUnselectable={true}
                                IsChecked={true} />
                            <RadioButton
                                Label="Invalid Choice"
                                ValidationError="You can't choose this!"
                                IsChecked={true} />
                            <RadioButton
                                Background="orange"
                                BorderBrush="green"
                                BorderThickness="5px"
                                Label="Customized"
                                Padding="5px"
                                IsUnselectable={true}
                                FontSize={FontStyle.ExtraLarge}
                                IsChecked={true} />
                        </WrapPanel>

                        <TextBlock Text="Specialty Buttons" Style={TextBlock.ControlSectionHeaderStyle} />
                        <WrapPanel>
                            <StackPanel>
                                <TextBlock Text="Icon Button" Style={TextBlock.LabelStyle} />
                                <IconCommandButton
                                    HorizontalAlignment={HorizontalAlignment.Center}
                                    Style={CommandButton.IconButtonStyle}
                                    Label="Icon Button"
                                    Icon="ReportHacked" />

                                <IconCommandButton
                                    HorizontalAlignment={HorizontalAlignment.Center}
                                    Style={CommandButton.IconButtonStyle}
                                    ContextMenuCommands={new Binding("Company.CEO.Commands")}
                                    Icon={0xF000} />

                                <IconCommandButton
                                    IsEnabled={false}
                                    HorizontalAlignment={HorizontalAlignment.Center}
                                    Style={CommandButton.IconButtonStyle}
                                    ContextMenuCommands={new Binding("Company.CEO.Commands")}
                                    Icon={0xF000} />

                                <IconCommandButton
                                    HorizontalAlignment={HorizontalAlignment.Center}
                                    Style={CommandButton.IconButtonStyle}
                                    IsEnabled={false}
                                    Icon="Folder" />
                            </StackPanel>

                            <StackPanel>
                                <TextBlock Text="Circle Button" Style={TextBlock.LabelStyle} />
                                <CommandButton
                                    Background="blue"
                                    Foreground="yellow"
                                    HorizontalAlignment={HorizontalAlignment.Center}
                                    Style={CommandButton.CircleButtonStyle}
                                    Icon={0xE90C} />
                            </StackPanel>

                            <StackPanel>
                                <TextBlock Text="Toggle Buttons" Style={TextBlock.LabelStyle} />
                                <ToggleSwitch CheckedText="Checked!" UncheckedText="Unchecked!" />
                                <LabelledToggleButton
                                    LeftLabel="Index View"
                                    RightLabel="My View" />
                            </StackPanel>

                            <StackPanel>
                                <TextBlock
                                    Text="Sliders"
                                    Style={TextBlock.LabelStyle}
                                />
                                <Slider
                                    Value={5}
                                    MinValue={0}
                                    MaxValue={20}
                                    Label="Vertical Slider"
                                    IsVertical={true}
                                    ShowValue={true}
                                    Length={60}
                                    HorizontalAlignment={HorizontalAlignment.Left}
                                />
                                <Slider
                                    Value={50}
                                    MinValue={0}
                                    MaxValue={125}
                                    StepIncrement={5}
                                    Label="Horizontal Slider"
                                    IsVertical={false}
                                    ShowValue={true}
                                />
                                <Slider
                                    Value={.5}
                                    MinValue={0}
                                    MaxValue={1}
                                    StepIncrement={0.1}
                                    Label="Disabled Slider"
                                    IsVertical={false}
                                    IsEnabled={false}
                                />
                            </StackPanel>


                            <StackPanel>
                                <TextBlock
                                    Text="Volume Control"
                                    Style={TextBlock.LabelStyle}
                                />
                                <VolumeSlider
                                    Value={0.8}
                                />
                            </StackPanel>

                        </WrapPanel>
                    </StackPanel>)
                },
                {
                    Label: "Boxes",
                    Key: "boxes",
                    Content: (
                        <StackPanel>
                            {/*TextBox*/}
                            <StackPanel>
                                <TextBlock Text="TextBox" Style={TextBlock.ControlSectionHeaderStyle} />

                                <TextBox
                                    MaxHeight="200px"
                                    PlaceholderText="Try the Enter Key"
                                    Label="HStretch and Accept Return"
                                    AcceptsReturn={true} />

                                <TextBox
                                    Label="HStretch and No Accept Return"
                                    PlaceholderText="Ignores Enter Key"/>

                                <WrapPanel>
                                    <TextBox Label="Icon + MinWidth"
                                        InfoTip="Some useful info"
                                        Icon={"Search"}
                                        MinWidth="200px"
                                        PlaceholderText="Enter search terms" />
                                    <TextBox
                                        Text="Unlabelled Text"
                                        VerticalAlignment={VerticalAlignment.Bottom} />
                                    <TextBox Label="Disabled" IsEnabled={false} Text="Disabled Text" />
                                    <TextBox Label="Read Only" IsReadOnly={true} Text="Read Only Text" />
                                    <TextBox Label="No Auto-select" SelectOnFocus={false} Text="Why would you want to do this?" />
                                    <TextBox Label="Validation Error"
                                        Text="Invalid Text"
                                        ValidationError="Invalid Input"/>
                                </WrapPanel>

                                <TextBox Label="Customized"
                                    FontFamily="Courier New"
                                    Background="Yellow"
                                    BorderBrush="Purple"
                                    BorderThickness="3px"
                                    Foreground="Orange"
                                    Padding="15px"
                                    FontSize={FontStyle.ExtraLarge}
                                    Text="Customized Text" />

                                <PasswordBox
                                    Label="Password"
                                    PlaceholderText="Enter Password"/>

                            </StackPanel>

                            {/*ComboBox*/}
                            <StackPanel>
                                <TextBlock Text="ComboBox" Style={TextBlock.ControlSectionHeaderStyle} />

                                <TextBlock Text="Single-Select" Style={TextBlock.LabelStyle} />

                                <WrapPanel>

                                    <ComboBox
                                        Label="Normal"
                                        PlaceholderText="Select something!"
                                        InfoTip="What does this thing do?"
                                        ItemsSource={new Binding("Company.CEO.Underlings")}
                                        ItemTemplate={ControlGallery1.EmployeeTemplate} />

                                    <ComboBox
                                        Label="Disabled"
                                        IsEnabled={false}
                                        SelectedItem={new Binding("Company.CEO")}
                                        ItemsSource={new Binding("Company.CEO.Underlings")}
                                        ItemTemplate={ControlGallery1.EmployeeTemplate} />

                                    <ComboBox
                                        Label="Invalid"
                                        SelectedItem={new Binding("Company.CEO")}
                                        ValidationError="This is an invalid choice"
                                        ItemsSource={new Binding("Company.CEO.Underlings")}
                                        ItemTemplate={ControlGallery1.EmployeeTemplate} />

                                    <ComboBox
                                        Label="Editable"
                                        SelectedItem={new Binding({
                                            Path: "Company.CEO.Age",
                                            ValidatesOnDataErrors: true
                                        })}
                                        //ValidationError="This is an invalid choice"
                                        ItemsSource={new Binding("Company.AgeOptions")}
                                        IsEditable={true} />

                                </WrapPanel>

                                <TextBlock Text="Multi-Select" Style={TextBlock.LabelStyle} />
                                <WrapPanel>
                                    <DataContext Value={new Binding(nameof<Model.App>(a => a.Company))}>
                                        <ComboBox
                                            Label="HERE, HAVE SOME NAMES TO SELECT"
                                            ItemsSource={new Binding(nameof<Model.Company>(c => c.SomeEmployeeNames))}
                                            SelectedItem={new Binding(nameof<Model.Company>(c => c.SelectedEmployeeName))}
                                            SelectionMode={SelectionMode.Multiple}
                                            SelectedItems={new Binding(nameof<Model.Company>(c => c.SelectedEmployeeNames))}
                                            PlaceholderText="A placeholder is me"/>
                                    </DataContext>
                                </WrapPanel>

                                <ComboBox
                                    Label="Custom"
                                    Background="#D0D0D0"
                                    BorderBrush="#0080FF"
                                    BorderThickness="5px"
                                    FontFamily="Times New Roman"
                                    FontSize={28}
                                    HorizontalAlignment={HorizontalAlignment.Left}
                                    SelectedItem={"red"}
                                    ItemsSource={["red", "orange", "yellow", "green", "blue", "purple"]}
                                    ItemTemplate={item => (
                                        <Panel HorizontalAlignment={HorizontalAlignment.Center} Width={50} Height={50} Background={item} />
                                    )} />


                            </StackPanel>

                            {/*Expander*/}
                            <Expander Label="Expand me!" Padding="5px">
                                <TextBlock Text="This is some expanded content!"/>
                            </Expander>
                        </StackPanel>)
                    },
                    {
                        Label: "Special",
                        Key: "special",
                        Content: (
                            <>
                                <MentionTextBox
                                    TargetSourceBinding={{
                                        Path: "Company.MentionableEmployees",
                                        NotifyCollectionChanged: true,
                                    }}
                                    Text={new Binding("Company.MentionNoteText")}
                                    TargetLinkPath="MentionLink"
                                    TargetsLoading={new Binding("Company.IsLoading")}
                                    SearchDebounceMs={0}
                                    TargetFilter={new Binding("Company.MentionFilter")}
                                    TargetTemplate={ControlGallery1.EmployeeTemplate}
                                />
                            </>
                        )
                    }

            ]} />
        )
    }
}
