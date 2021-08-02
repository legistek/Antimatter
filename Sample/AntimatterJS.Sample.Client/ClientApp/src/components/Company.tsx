import { Binding, DataContext, AntimatterComponent, ModelObjectReference, BindingMode } from '@antimatterjs/react';
import * as React from 'react';
import { DefaultEffects, AnimationStyles, MotionAnimations, Modal, FontWeights } from '@fluentui/react';

import * as Model from '../model/Model';
import
{
    ToggleButton,
    Coachmark,
    TeachingBubble,

    ProgressBar,
    //ProgressBarBase,
    Spinner,

    DatePicker,
    ComboBox,

    ListBox, SelectionMode,
    ItemsStackPanel, GroupBox, CommandButton,
    CommandBar, DataGrid, VerticalAlignment,
    Popup,
    PlacementMode,
    FrameworkElement,
    WrapPanel,
    ColorPicker,
    IFrameworkElementState,
    IFrameworkElementProps,
    MultitouchTransform
} from '@antimatterjs/positron';

import { TextBlock, TextBox, StackPanel, Orientation, CheckBox, Grid } from '@antimatterjs/positron'
import { DataTemplate } from '@antimatterjs/positron/src/FrameworkTemplate';

export class Employee extends AntimatterComponent<{ Value: ModelObjectReference | Binding }, { Value: ModelObjectReference }>
{
    static displayName = Employee.name;

    private _cb?: CheckBox | null;

    render()
    {
        // amx-grow-entrance
        return (
            <GroupBox
            /*animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`*/
            >

                <DataContext Value={this.state.Value}>
                    <Spinner
                        Value={new Binding(nameof<Model.Employee>(e => e.Age))}
                        LabelIsInline={false}
                        StepIncrement={5}
                        MinValue={0}
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

                        <TextBlock Text="Age" />

                        <CheckBox
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

                        <ColorPicker
                            ItemsSource={new Binding("Company.AvailableColors")}
                            SelectedItem={new Binding("Color")} />
                    </WrapPanel>

                    <TextBox
                        IsVisible={new Binding("IsBonusEligible")}
                        Label="Bonus Amount"
                        Text={new Binding("BonusAmount")} />
                    <TextBlock Text={new Binding(nameof<Model.Employee>(e => e.Age))} />

                    <CommandBar ItemsSource={new Binding("Commands")} />

                    <CommandButton Command={new Binding("LongTaskCommand")}/>

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

                </DataContext>



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
                ref={r => this.openButtonElem = r }
            />
        );

        return button;
    }

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
        return elem;
        //return <></>;
    }

    _comboBoxOptionTemplate: DataTemplate = new DataTemplate((item) =>
        <TextBlock
            Text={new Binding({ Path: nameof<Model.Employee>(e => e.FullName), Source: item })}
            VerticalAlignment={VerticalAlignment.Center}
        />
    );
    _comboBoxRedundantStringTemplate: DataTemplate = new DataTemplate((item: string) =>
        <TextBlock Text={item} />
    );
    _comboBoxOptionTemplate_CustomMultiselect: DataTemplate = new DataTemplate((item) =>
        <CheckBox
            IsEnabled={new Binding({ Path: nameof<Model.Employee>(e => e.IsBonusEligible), Source: item })}
            IsChecked={new Binding({ Path: nameof<Model.Employee>(e => e.IsMultiSelected), Source: item })}
            Label={new Binding({ Path: nameof<Model.Employee>(e => e.LastName), Source: item })}
            VerticalAlignment={VerticalAlignment.Center}
        />
    );

    private get comboBoxElem(): JSX.Element
    {
        const elem: JSX.Element = (
            <ComboBox
                //ItemsSource={new Binding(nameof<Model.Company>(c => c.SomeEmployeeNames))}
                //SelectedItem={new Binding(nameof<Model.Company>(c => c.SelectedEmployeeName))}
                //ItemTemplate={this._comboBoxRedundantStringTemplate}

                ItemsSource={new Binding(nameof<Model.Company>(c => c.SomeEmployees))}
                ItemTemplate={this._comboBoxOptionTemplate}

                Label="Employee Selector Thingy (Single)"
                IsEnabled={new Binding({ Path: nameof<Model.Company>(c => c.IsAllSelected), Converter: (val) => !val})}
                IsEnabledPath={nameof<Model.Employee>(e => e.IsBonusEligible)}

                SelectedItem={new Binding(nameof<Model.Company>(c => c.SelectedEmployee))}

                Placeholder="if you can see this, nothing is (single-)selected"
            />
        );
        return elem;
    }
    private get comboBoxElem_FluentMultiSelect(): JSX.Element
    {
        const elem: JSX.Element = (
            <ComboBox
                ItemsSource={new Binding(nameof<Model.Company>(c => c.SomeEmployees))}
                ItemTemplate={this._comboBoxOptionTemplate}

                Label="Employee Selector Thingy (Multi)"
                IsEnabled={new Binding({ Path: nameof<Model.Company>(c => c.IsAllSelected), Converter: (val) => !val })}
                IsEnabledPath={nameof<Model.Employee>(e => e.IsBonusEligible)}

                SelectionMode={SelectionMode.Multiple}

                SelectedItems={new Binding(nameof<Model.Company>(c => c.SelectedEmployees))}
                SelectionChangedCommand={new Binding(nameof<Model.Company>(c => c.SelectedEmployeesChangedCommand))}

                TitleStringOverride={new Binding(nameof<Model.Company>(c => c.SelectedEmployeesDisplayText))}
                Placeholder={new Binding(nameof<Model.Company>(c => c.SelectedEmployeesDisplayText))}
            />
        );
        return elem;
    }
    private get comboBoxElem_CustomMultiSelect(): JSX.Element
    {
        const elem: JSX.Element = (
            <ComboBox
                ItemsSource={new Binding(nameof<Model.Company>(c => c.SomeEmployees))}
                ItemTemplate={this._comboBoxOptionTemplate_CustomMultiselect}

                Label="Employee Selector Thingy (CUSTOM Multi)"
                IsEnabled={new Binding({ Path: nameof<Model.Company>(c => c.IsAllSelected), Converter: (val) => !val })}
                IsEnabledPath={nameof<Model.Employee>(e => e.IsBonusEligible)}

                SelectionMode={SelectionMode.Multiple}
                UseCustomMultiselectTemplate={true}

                SelectedItems={new Binding(nameof<Model.Company>(c => c.SelectedEmployees))}
                SelectionChangedCommand={new Binding(nameof<Model.Company>(c => c.SelectedEmployeesChangedCommand))}

                TitleStringOverride={new Binding(nameof<Model.Company>(c => c.SelectedEmployeesDisplayText))}
                Placeholder={new Binding(nameof<Model.Company>(c => c.SelectedEmployeesDisplayText))}
            />
        );
        return elem;
    }

    renderElement()
    {
        console.log("Company rendering");

        //this.BindState({ Path: "Employees" }, "employees");

        return (
            <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                <StackPanel>
                    {this.comboBoxElem}
                    {this.comboBoxElem_FluentMultiSelect}
                    {this.comboBoxElem_CustomMultiSelect}

                    <TextBlock Text={new Binding(nameof<Model.Company>(c => c.Name))} />

                    <StackPanel Orientation={Orientation.Horizontal}>
                        <TextBlock Text="Employee Count:" />
                        <TextBlock Text={new Binding("Employees.Count")} />
                    </StackPanel>
                    <CommandButton Command={new Binding(nameof<Model.Company>(c => c.NewEmployeeCommand))}
                        Style={CommandButton.CommandBarButtonStyle} />


                    {this.OpenBubbleButton}
                    {/*{this.Bubble}*/}

                    {this.TextboxWithTeachingBubble}


                    {/*<ModernButton*/}
                    {/*    Label="NEW EMPLOYEE"*/}
                    {/*    IsEnabled={new Binding({ Path: "Employees.Count", Converter: (ct) => ct < 100 })}*/}
                    {/*    Command={new Binding(nameof<Model.Company>(c => c.NewEmployeeCommand))} />*/}

                    <Employee Value={new Binding(nameof<Model.Company>(c => c.SelectedEmployee))} />
                </StackPanel>


                <div className="amx-ptn-fe" style={{ height: 1024 }}>
                    <DataGrid ItemsSource={new Binding(nameof<Model.Company>(c => c.Employees))}
                        RowHeight={44}
                        SelectedItems={new Binding("SelectedEmployees")}
                        IsSelectAll={new Binding("IsAllSelected")}
                        OnManipulationStarted={(e) =>
                        {
                            this._tr.CenterX = e.CenterX;
                            this._tr.CenterY = e.CenterY;
                        }}
                        OnManipulationDelta={(e) =>
                        {
                            this._tr.TranslateX = e.CumulativeX;
                            this._tr.TranslateY = e.CumulativeY;
                            this._tr.ScaleX = e.CumulativeScale;
                            this._tr.ScaleY = e.CumulativeScale;
                        }}
                        OnManipulationCompleted={(e) =>
                        {
                            this._tr.Reset();
                        }}
                        Transform={this._tr}
                        Columns={[
                            {
                                Header: "First Name",
                                Key: "firstName",
                                Template: this._firstNameTemplate
                            },
                            {
                                Header: "Last Name",
                                Key: "lastName",
                                Template: this._lastNameTemplate
                            },
                            {
                                Header: "Age",
                                Key: "age",
                                Template: this._ageTemplate
                            }
                        ]}
                    />
                </div>



                {/*<ListBox                    */}
                {/*    SelectionMode={SelectionMode.Single}                    */}
                {/*    ItemsPanel={ItemsStackPanel}*/}
                {/*    ItemsSource={new Binding(nameof<Model.Company>(c => c.Employees))}*/}
                {/*    SelectedItem={new Binding(nameof<Model.Company>(c => c.SelectedEmployee))}*/}
                {/*    ItemTemplate={(item) =>*/}
                {/*    (*/}
                {/*        <TextBlock Text={new Binding({ Path: nameof<Model.Employee>(e => e.FullName), Source: item })}*/}
                {/*            Margin="10px"*/}
                {/*        />*/}
                {/*    )} />*/}

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
