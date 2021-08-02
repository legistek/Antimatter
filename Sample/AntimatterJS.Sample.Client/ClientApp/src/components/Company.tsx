import { Binding, DataContext, AntimatterComponent, ModelObjectReference, BindingMode } from '@antimatterjs/react';
import * as React from 'react';
import { DefaultEffects, AnimationStyles, MotionAnimations, Modal, FontWeights } from '@fluentui/react';

import * as Model from '../model/Model';
import
{
    MessageBar,
    MessageBarType,

    ToggleButton,
    Coachmark,
    TeachingBubble,

    ProgressBar,
    //ProgressBarBase,
    Spinner,

    DatePicker,
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

                    <TextBlock Text={new Binding({ Path: nameof<Model.Employee>(e => e.FullName) })} />
                    <TextBlock Text="Edit Info" FontWeight="bold" />

                    <DatePicker
                        Label="Start Date (#1)"
                        Date={new Binding({ Path: nameof<Model.Employee>(e => e.StartDate), Mode: BindingMode.TwoWay })}
                        HasTime={true}
                    />

                    <DatePicker
                        Label="Start date (#2)"
                        Date={new Binding({ Path: nameof<Model.Employee>(e => e.StartDate) })}
                        UseInternationalFormat={true}
                        HasTime={true}
                    />


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

    private get MessageBar1(): JSX.Element
    {
        const elem: JSX.Element = (
            <MessageBar
                Message="testing simple success bubble"
                MessageBarType={MessageBarType.success}
                ShowCloseButton={true}
            />
        );
        return elem;
    }
    private get MessageBar2(): JSX.Element
    {
        const elem: JSX.Element = (
            <MessageBar
                Message="Large error message"
                IsVisible={new Binding(nameof<Model.Company>(c => c.TeachingBubbleOpen))}
                MessageBarType={MessageBarType.error}
                PrimaryCommand={new Binding(nameof<Model.Company>(c => c.TeachingBubblePrimaryCommand))}
                SecondaryCommand={new Binding(nameof<Model.Company>(c => c.NewEmployeeCommand))}
                FontSize={20}
                FontWeight="bold"
            />
        );
        return elem;
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

    renderElement()
    {
        console.log("Company rendering");

        //this.BindState({ Path: "Employees" }, "employees");

        return (
            <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                <StackPanel>

                    <TextBlock Text={new Binding(nameof<Model.Company>(c => c.Name))} />


                    {this.MessageBar1}
                    {this.MessageBar2}
                    {this.MessageBar3}



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


                {/*
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


                */}

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
