import { Binding, DataContext, AntimatterComponent, ModelObjectReference, BindingMode } from '@antimatterjs/react';
import * as React from 'react';
import { DefaultEffects, AnimationStyles, MotionAnimations, Modal, FontWeights, ICheckboxProps, Icon }
    from '@fluentui/react';

import * as Model from '../model/Model';
import
{
    MessageBar,
    MessageBarType,

    ToggleButton,
    TeachingBubble,

    ProgressBar,
    //ProgressBarBase,
    Spinner,
    ToastControl,

    DatePicker,
    ComboBox,
    ColorPicker,
    ITextBlockProps,

    ListBox, SelectionMode,
    GroupBox, CommandButton,
    CommandBar, DataGrid, VerticalAlignment,
    Popup,
    PlacementMode,
    FrameworkElement,
    WrapPanel,
    IFrameworkElementState,
    IFrameworkElementProps,
    MultitouchTransform,
    HorizontalAlignment,
    ScrollBarVisibility,
    ResizePanel,
    TreeView,
    Side,
    Panel,
    WindowLayout,
    Glyph,
    View
} from '@antimatterjs/positron';

import { TextBlock, TextBox, StackPanel, Orientation, CheckBox, Grid } from '@antimatterjs/positron'
import { DataTemplate } from '@antimatterjs/positron/src/FrameworkTemplate';


export class Employee extends View
{
    static displayName = Employee.name;

    private _cb?: CheckBox | null;

    private get ColorPicker(): JSX.Element
    {
        const elem: JSX.Element = (
            <ColorPicker
                ItemsSource={new Binding("Company.AvailableColors")}
                SelectedItem={new Binding("Color")}
            />
        );

        return elem;
        //return <></>;
    }

    View()
    {
        // amx-grow-entrance
        return (
            <GroupBox
            /*animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`*/
            >

                <StackPanel>

                    <Spinner
                        Value={new Binding(nameof<Model.Employee>(e => e.Age))}
                        LabelIsInline={false}
                        StepIncrement={5}
                        MinValue={0}
                        IsEnabled={false}
                        Label="The Age-O-Tron"
                    />

                    {/*

                    <Spinner
                        Value={new Binding(nameof<Model.Employee>(e => e.Age))}
                        IsEnabled={false}
                        Label="The Borken Age-O-Tron"
                    />

                    <ToggleButton
                        IsChecked={new Binding(nameof<Model.Employee>(e => e.IsBonusEligible))}
                        CheckedText="Switched on"
                        UncheckedText="Switched off"
                        Label="Thing to toggle"
                    />

                    <ToggleButton
                        IsChecked={new Binding(nameof<Model.Employee>(e => e.IsBonusEligible))}
                        CheckedText="Switched on (elsewhere)"
                        UncheckedText="Switched off (elsewhere)"
                        Label="Thing not to toggle because it's disabled"
                        LabelIsInline={true}
                        IsEnabled={false}
                    />

                     */}

                    <TextBlock Text={new Binding({ Path: nameof<Model.Employee>(e => e.FullName) })} />

                    <TextBlock Text="Edit Info" FontWeight="bold" />

                    <DatePicker
                        Label="Start Date (#1)"
                        Date={new Binding({ Path: nameof<Model.Employee>(e => e.StartDate), Mode: BindingMode.TwoWay })}
                        HasTime={true}
                    />

                    {/*
                    <DatePicker
                        Label="Start date (#2)"
                        Date={new Binding({ Path: nameof<Model.Employee>(e => e.StartDate) })}
                        UseInternationalFormat={true}
                        HasTime={true}
                    />
                     */}


                    <WrapPanel>
                        <TextBox
                            Label="First Name"
                            Text={new Binding(nameof<Model.Employee>(e => e.FirstName))} />
                        <TextBox
                            Label="Last Name"
                            Text={new Binding(nameof<Model.Employee>(e => e.LastName))} />

                        <TextBlock Text="Age" VerticalAlignment={VerticalAlignment.Center} />

                        <CheckBox
                            VerticalAlignment={VerticalAlignment.Center}
                            ref={
                                r =>
                                {
                                    this._cb = r;
                                }
                            }
                            Label="Bonus Eligible"
                            IsChecked={new Binding(nameof<Model.Employee>(e => e.IsBonusEligible))}>
                        </CheckBox>

                        {/*<Popup IsOpen={new Binding("IsBonusEligible")}*/}
                        {/*    Background="rgba(255,255,255,.5)"*/}
                        {/*    Blur={10}*/}
                        {/*    Target={*/}
                        {/*        (() =>*/}
                        {/*            this._cb)*/}
                        {/*            .bind(this)*/}
                        {/*    }>*/}
                        {/*    <TextBlock Text="Really Nice bonus" />*/}
                        {/*</Popup>*/}

                        {this.ColorPicker}

                    </WrapPanel>

                    <TextBox
                        IsVisible={new Binding("IsBonusEligible")}
                        Label="Bonus Amount"
                        Text={new Binding("BonusAmount")} />
                    <TextBlock Text={new Binding(nameof<Model.Employee>(e => e.Age))} />

                    <CommandBar ItemsSource={new Binding("Commands")} />

                    <CommandButton Command={new Binding("IncreaseAgeCommand")}
                        SecondaryCommandsSource={new Binding("Commands")}
                        Style={CommandButton.IconButtonStyle}
                    />
                    <CommandButton Command={new Binding("LongTaskCommand")} />

                    <ProgressBar
                        Progress={new Binding("TaskProgress")}
                        Denominator={100}
                    />

                    <ProgressBar
                        Progress={new Binding(nameof<Model.Employee>(e => e.Age))}
                        Denominator={100}
                    />

                    <ProgressBar />

                    {/*<StackPanel Orientation={Orientation.Horizontal}>*/}
                    {/*    <CommandButton*/}
                    {/*        Style={CommandButton.IconButtonStyle}*/}
                    {/*        Command={new Binding("EditCommand")} />*/}
                    {/*    <CommandButton*/}
                    {/*        Style={CommandButton.IconButtonStyle}*/}
                    {/*        Command={new Binding(nameof<Model.Employee>(e => e.IncreaseAgeCommand))}/>*/}
                    {/*    <CommandButton*/}
                    {/*        Style={CommandButton.CommandBarButtonStyle}*/}
                    {/*        Command={new Binding("Company.DeleteEmployeeCommand")}*/}
                    {/*        CommandParameter={new Binding()} />*/}
                    {/*</StackPanel>*/}

                </StackPanel>


            </GroupBox>
        );
    }
}

export class Company extends FrameworkElement<IFrameworkElementProps, IFrameworkElementState>
{
    static displayName = Company.name;
    private _tr = new MultitouchTransform();

    constructor(props)
    {
        super(props);
    }

    _firstNameTemplate: DataTemplate = new DataTemplate((item) => (
        <TextBlock Text={new Binding("FirstName")} VerticalAlignment={VerticalAlignment.Center} />
    ));
    _lastNameTemplate: DataTemplate = new DataTemplate((item) => (
        <TextBlock Text={new Binding("LastName")} VerticalAlignment={VerticalAlignment.Center} />
    ));
    _ageTemplate: DataTemplate = new DataTemplate((item) => (
        <TextBlock Text={new Binding("Age")} VerticalAlignment={VerticalAlignment.Center} />
    ));

    private openButtonElem?: FrameworkElement | null;
    private get OpenBubbleButton(): JSX.Element
    {
        const button: JSX.Element = (
            <CommandButton
                Command={new Binding(nameof<Model.Company>(c => c.OpenTeachingBubbleCommand))}
                ref={r => this.openButtonElem = r}
            />
        );

        return button;
    }

    //private get ToastContent(): DataTemplate
    //{
    //    const template: DataTemplate = new DataTemplate((params: ModelObjectReference) => (
    //        <MessageBar
    //            Content={new Binding({ Path: "Content", Source: params })}
    //            MessageBarType={new Binding({ Path: "MessageBarType", Source: params })}
    //            PrimaryCommand={new Binding({ Path: "PrimaryCommand", Source: params })}
    //            SecondaryCommand={new Binding({ Path: "SecondaryCommand", Source: params })}
    //            ShowCloseButton={new Binding({ Path: "ShowCloseButton", Source: params })}
    //            Duration={new Binding({ Path: "Duration", Source: params })}
    //            IsVisible={new Binding({ Path: "IsVisible", Source: params })}
    //            Animate={true}
    //            Margin="1px"
    //        />));
    //    return template;
    //}


    private get MessageBar1(): JSX.Element
    {
        const elem: JSX.Element = (
            <MessageBar
                Content="testing simple success bubble"
                MessageBarType={MessageBarType.success}
                ShowCloseButton={true}
            />
        );
        //return elem;
        return <></>;
    }
    private get MessageBar2(): JSX.Element
    {
        const elem: JSX.Element = (
            <MessageBar
                Content="Large error message"
                MessageBarType={MessageBarType.error}
                PrimaryCommand={new Binding(nameof<Model.Company>(c => c.TeachingBubblePrimaryCommand))}
                SecondaryCommand={new Binding(nameof<Model.Company>(c => c.NewEmployeeCommand))}
                FontSize={20}
                FontWeight="bold"
            />
        );
        //return elem;
        return <></>;
    }
    private get MessageBar3(): JSX.Element
    {
        const elem: JSX.Element = (
            <MessageBar
                Content={this._messageBarCustomContent}
                IsVisible={new Binding(nameof<Model.Company>(c => c.TeachingBubbleOpen))}
                ShowCloseButton={true}
            />
        );
        return elem;
    }

    _messageBarCustomContent: DataTemplate = new DataTemplate(() => (
        <StackPanel Orientation={Orientation.Vertical}>
            <TextBlock
                Text="Custom template here"
                FontSize={16}
            />
            <CheckBox
                Label="(Custom template line #2 is a checkbox)"
                FontSize={16}
            />
            <TextBlock
                Text="Custom template line #3"
                FontSize={16}
            />
        </StackPanel>
    ));

    private get Bubble(): JSX.Element
    {
        const bubble: JSX.Element = (
            <TeachingBubble
                IsOpen={new Binding(nameof<Model.Company>(c => c.TeachingBubbleOpen))}
                Params={new Binding(nameof<Model.Company>(c => c.TeachingBubbleInfo))}

                //HeaderText="HOBO TITLE!"
                //MessageText="text text text yay"
                //ShowCloseButton={true}

                //PrimaryCommand={new Binding(nameof<Model.Company>(c => c.TeachingBubblePrimaryCommand))}


                //ShowSecondaryButton={true}
                //CustomSecondaryCommand={new Binding(nameof<Model.Company>(c => c.TeachingBubblePrimaryCommand))}
                //SecondaryButtonTextOverride="CLOSE ME"

                Target={(() => this.openButtonElem).bind(this)}
            />
        );

        return bubble;
        //return <></>
    }

    private get TextboxWithTeachingBubble(): JSX.Element
    {
        const elem: JSX.Element = (
            <TextBox
                Text="Unimportant text for bubble-ed control"

                TeachingBubbleIsOpen={{ Path: nameof<Model.Company>(c => c.TeachingBubbleOpen) }}

                TeachingBubbleParams={new Binding(nameof<Model.Company>(c => c.TeachingBubbleInfo))}
            //TeachingBubbleHeaderText="i am bubble header"
            //TeachingBubbleCommand={new Binding(nameof<Model.Company>(c => c.TeachingBubblePrimaryCommand))}
            />
        );
        //return elem;
        return <></>;
    }

    _comboBoxOptionTemplate: DataTemplate = new DataTemplate((item) =>
    {
        const elem: JSX.Element = (

            <TextBlock
                Text={new Binding({ Path: nameof<Model.Employee>(e => e.FullName), Source: item })}
                VerticalAlignment={VerticalAlignment.Center}
                Style={ComboBox.DefaultTextblockStyle}
            />



        );
        return elem;
    }

    );
    _comboBoxRedundantStringTemplate: DataTemplate = new DataTemplate((item: string) =>
        <TextBlock Text={item} />
    );
    _comboBoxOptionTemplate_CustomMultiselect: DataTemplate = new DataTemplate((item) =>
        <Grid
            //Background="limegreen"
            RowDefinitions={[Grid.RowDefinition(30)]}
        >
            <CheckBox
                IsHitTestVisible={false}
                IsEnabled={new Binding({ Path: nameof<Model.Employee>(e => e.IsBonusEligible), Source: item })}
                IsChecked={new Binding({ Path: nameof<Model.Employee>(e => e.IsMultiSelected), Source: item })}
                Label={new Binding({ Path: nameof<Model.Employee>(e => e.LastName), Source: item })}
                VerticalAlignment={VerticalAlignment.Center}
                Margin="0 6px"
            />

        </Grid>
    );

    private get comboBox2_Strings(): JSX.Element
    {
        const elem: JSX.Element = (
            <ComboBox
                Label="Name/String Selector Thingy (Single)"
                //ItemsSource={new Binding(nameof<Model.Company>(c => c.SomeEmployeeNames))}
                ItemsSource={new Binding(nameof<Model.Company>(c => c.SomeMoreEmployeeNames))}

                SelectedItem={new Binding(nameof<Model.Company>(c => c.SelectedEmployeeName))}

                PlaceholderText="[nothing to see here]"
            />
        );
        //return elem;
        return <></>;
    }
    private get comboBox2_Objects(): JSX.Element
    {
        const elem: JSX.Element = (
            <ComboBox
                Label="Employee Selector Thingy (Single)"
                //ItemsSource={new Binding(nameof<Model.Company>(c => c.SomeEmployees))}
                ItemsSource={new Binding(nameof<Model.Company>(c => c.SomeMoreEmployees))}


                SelectedItem={new Binding(nameof<Model.Company>(c => c.SelectedEmployee))}
                ItemTemplate={this._comboBoxOptionTemplate}

                IsEnabledPath={nameof<Model.Employee>(e => e.IsBonusEligible)}
            />
        );
        return elem;
        //return <></>;
    }
    private get comboBox2_Multi(): JSX.Element
    {
        const elem: JSX.Element = (
            <ComboBox
                Label="Dude Selector Thingy (Multi!)"
                ItemsSource={new Binding(nameof<Model.Company>(c => c.SomeEmployees))}

                ItemTemplate={this._comboBoxOptionTemplate}
                //ItemTemplate={this._comboBoxOptionTemplate_CustomMultiselect}
                PreventAutoCheckboxes={false}


                SelectionMode={SelectionMode.Multiple}
                SelectedItems={new Binding(nameof<Model.Company>(c => c.SelectedEmployees))}

                TitleOverride={new Binding(nameof<Model.Company>(c => c.SelectedEmployeesDisplayText))}
                SelectionChangedCommand={new Binding(nameof<Model.Company>(c => c.SelectedEmployeesChangedCommand))}

                IsEnabled={new Binding({ Path: nameof<Model.Company>(c => c.IsAllSelected), Converter: (val) => !val })}
                IsEnabledPath={nameof<Model.Employee>(e => e.IsBonusEligible)}
            />
        );
        return elem;
        //return <></>;
    }
    private get comboBox2_Strings_Multi(): JSX.Element
    {
        const elem: JSX.Element = (
            <ComboBox
                Label="HERE, HAVE SOME NAMES TO SELECT"

                ItemsSource={new Binding(nameof<Model.Company>(c => c.SomeEmployeeNames))}
                SelectedItem={new Binding(nameof<Model.Company>(c => c.SelectedEmployeeName))}

                SelectionMode={SelectionMode.Multiple}
                SelectedItems={new Binding(nameof<Model.Company>(c => c.SelectedEmployeeNames))}

                PlaceholderText="A placeholder is me"
            />
        );
        return elem;
        //return <></>;
    }
    private get comboBox2_Custom_Multi(): JSX.Element
    {
        const elem: JSX.Element = (
            <ComboBox
                Label="The one with the checkboxes inside the template"
                ItemsSource={new Binding(nameof<Model.Company>(c => c.SomeEmployees))}

                ItemTemplate={this._comboBoxOptionTemplate_CustomMultiselect}
                PreventAutoCheckboxes={true}


                SelectionMode={SelectionMode.Multiple}
                SelectedItems={new Binding(nameof<Model.Company>(c => c.SelectedEmployees))}

                TitleOverride={new Binding(nameof<Model.Company>(c => c.SelectedEmployeesDisplayText))}
                SelectionChangedCommand={new Binding(nameof<Model.Company>(c => c.SelectedEmployeesChangedCommand))}

                IsEnabled={new Binding({ Path: nameof<Model.Company>(c => c.IsAllSelected), Converter: (val) => !val })}
                IsEnabledPath={nameof<Model.Employee>(e => e.IsBonusEligible)}
            />
        );
        return elem;
        //return <></>;
    }

    renderElement()
    {
        console.log("Company rendering");

        //this.BindState({ Path: "Employees" }, "employees");

        return (
            <Grid ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}
                VerticalScrollBarVisibility={ScrollBarVisibility.Auto}>
                <StackPanel>

                    <TextBlock Text={new Binding(nameof<Model.Company>(c => c.Name))} />

                    {this.comboBox2_Strings}
                    {this.comboBox2_Objects}
                    {this.comboBox2_Multi}
                    {this.comboBox2_Strings_Multi}
                    {this.comboBox2_Custom_Multi}

                    {this.MessageBar1}
                    {this.MessageBar2}
                    {this.MessageBar3}

                    <ListBox
                        ItemsSource={new Binding(nameof<Model.Company>(c => c.SomeEmployees))}
                        SelectionMode={SelectionMode.Multiple}
                        ItemTemplate={this._comboBoxOptionTemplate}
                        SelectedItems={new Binding(nameof<Model.Company>(c => c.SelectedEmployees))}
                    />


                    {this.OpenBubbleButton}
                    {/*{this.Bubble}*/}

                    {this.TextboxWithTeachingBubble}


                    {/*<ModernButton*/}
                    {/*    Label="NEW EMPLOYEE"*/}
                    {/*    IsEnabled={new Binding({ Path: "Employees.Count", Converter: (ct) => ct < 100 })}*/}
                    {/*    Command={new Binding(nameof<Model.Company>(c => c.NewEmployeeCommand))} />*/}

                    <Employee ViewModel={new Binding(nameof<Model.Company>(c => c.SelectedEmployee))} />
                </StackPanel>

                <ResizePanel Size={new Binding("UnderlingPanelWidth")}
                    Grid={{ Column: 1 }}
                    Background={"blue"}
                    ResizerSide={Side.Left}>
                    <TreeView
                        ItemsSource={new Binding("CEO.Underlings")}
                        SelectedItem={new Binding("SelectedEmployee")}
                        ChildrenPath="Underlings"
                        SelectionChangedCommand={new Binding("SelectedEmployeeChangedCommand")}
                        IsExpandedPath="IsExpanded"
                        IsSelectedPath="IsSelected"
                        ItemTemplate={new DataTemplate(
                            (item) => (
                                <StackPanel Orientation={Orientation.Horizontal}>
                                    <Glyph Icon="Contact"
                                        VerticalAlignment={VerticalAlignment.Center}
                                        HorizontalAlignment={HorizontalAlignment.Center}
                                        Margin={"5px"} />
                                    <TextBlock Text={new Binding({ Path: "FullName", Source: item })}
                                        Foreground={new Binding({ Path: "Color", Source: item })} />
                                </StackPanel>),
                            {
                                Layout: WindowLayout.Tablet,
                                VisualTree: (item) => (
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
                            })}>
                    </TreeView>
                </ResizePanel>
                
                {/*<DataContext Value={new Binding({ Path: "CEO"})}>*/}
                {/*    <ReactDataContext.Consumer>*/}
                {/*        {ctx => (*/}
                {/*            <div>*/}
                {/*                <h2>CEO</h2>*/}
                {/*                <Employee num={1} />*/}
                {/*                <PrimaryButton onClick={Antimatter.BindCommand(this, { Path: "IncreaseAgeCommand", Source: ctx })}>*/}
                {/*                    Increase*/}
                {/*                </PrimaryButton>*/}
                {/*            </div>*/}
                {/*        )}*/}
                {/*    </ReactDataContext.Consumer>*/}
                {/*</DataContext>*/}
            </Grid>
        );
    }
}
