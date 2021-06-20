import { Binding, DataContext, AntimatterComponent, ModelObjectReference, } from '@antimatterjs/react';
import * as React from 'react';
import { DefaultEffects, AnimationStyles, MotionAnimations, Modal, FontWeights, Position} from '@fluentui/react';

import * as Model from '../model/Model';
import
{
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
    MultitouchTransform,
    DocumentPagePresenter,
    PDFJSDocument,
    DocumentViewer,
    ItemsControl,
    VirtualizingStackPanel,
    Style,
    IVirtualizingStackPanelProps,
    HorizontalAlignment,
    Panel,
    ScrollBarVisibility
} from '@antimatterjs/positron';

import { TextBlock, TextBox, StackPanel, Orientation, CheckBox, Grid } from '@antimatterjs/positron'
import { ControlTemplate, DataTemplate } from '@antimatterjs/positron/src/FrameworkTemplate';
import { IDocument } from '@antimatterjs/positron/src/Documents/IDocument';
import { Ellipse } from '@antimatterjs/positron/src/Shapes/Ellipse';

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
                    <TextBlock Text={new Binding({ Path: nameof<Model.Employee>(e => e.FullName) })} />
                    <TextBlock Text="Edit Info" FontWeight="bold" />

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

                        <Popup IsOpen={new Binding("IsBonusEligible")}
                            Background="rgba(255,255,255,.5)"
                            Blur={10}
                            Target={
                                (() =>
                                    this._cb)
                                    .bind(this)
                            }>
                            <TextBlock Text="Really Nice bonus" />
                        </Popup>

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
    private _scale: number = 1;
    private _pdfDoc?: IDocument | null;
    private _colors: string[];

    constructor(props)
    {
        super(props);
        this._tr.ScaleX = 0.5;
        this._tr.ScaleY = 0.5;
        this._tr.TranslateY = 10;
        this.LoadPDFAsync();

        this._colors = new Array(10);
        for (let i = 0; i < this._colors.length; i++)
        {
            this._colors[i] = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`;
        }
    }

    private async LoadPDFAsync()
    {
        this._pdfDoc = await PDFJSDocument.CreateAsync(
            "/data"
//            "https://dev.limine.com/limineapi/webapi/matters/e41023f9-cd18-11eb-943f-0022484432a8/documents/c821b11c-cec4-11eb-943f-0022484432a8/pdf"
        );
        this.InvalidateRender();
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

    renderElement()
    {
        console.log("Company rendering");

        //this.BindState({ Path: "Employees" }, "employees");

        return (
            <Grid RowDefinitions={
                [
                Grid.RowDefinition(),
                Grid.RowDefinition(1, true)]}>
                {/*<StackPanel>*/}
                {/*    <TextBlock Text={new Binding(nameof<Model.Company>(c => c.Name))} />*/}

                {/*    <StackPanel Orientation={Orientation.Horizontal}>*/}
                {/*        <TextBlock Text="Employee Count:" />*/}
                {/*        <TextBlock Text={new Binding("Employees.Count")} />*/}
                {/*    </StackPanel>*/}

                {/*    <CommandButton Command={new Binding(nameof<Model.Company>(c => c.NewEmployeeCommand))}*/}
                {/*        Style={CommandButton.CommandBarButtonStyle} />*/}

                {/*    <ModernButton*/}
                {/*        Label="NEW EMPLOYEE"*/}
                {/*        IsEnabled={new Binding({ Path: "Employees.Count", Converter: (ct) => ct < 100 })}*/}
                {/*        Command={new Binding(nameof<Model.Company>(c => c.NewEmployeeCommand))} />*/}

                {/*    <Employee Value={new Binding(nameof<Model.Company>(c => c.SelectedEmployee))} />*/}
                {/*</StackPanel>*/}

                <StackPanel Orientation={Orientation.Horizontal} >
                    <TextBox Label="Page" Text={new Binding("DocPage")} />
                    <TextBox Label="Scale" Text={new Binding("DocScale")} />
                </StackPanel>

                <ItemsControl                    
                    ItemsSource={this._colors}
                    Template={new ControlTemplate((tp) =>
                    (
                        <Panel VerticalScrollBarVisibility={ScrollBarVisibility.Auto}>
                            <VirtualizingStackPanel
                                VerticalAlignment={VerticalAlignment.Top}
                                Scale={new Binding("DocScale")}
                                ItemsParent={tp}
                                ItemHeight={500}
                            />
                        </Panel>                        
                    ))}
                    ItemTemplate={new DataTemplate((item) =>
                    (<Ellipse
                        HorizontalAlignment={HorizontalAlignment.Center}
                        Width={500}
                        Height={500}
                        Fill={item}/>))}

                />

                {/*<DocumentViewer*/}
                {/*    Document={this._pdfDoc}*/}
                {/*    Position={new Binding({ Path: "DocPosition", MarshalValue: true })} />*/}

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



/*
 * <DataGrid ItemsSource={new Binding(nameof<Model.Company>(c => c.Employees))}
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
 * 
 */


/*
 *                     <DocumentPagePresenter
                        Document={this._pdfDoc}
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
                            this._scale = this._tr.AbsoluteScale;
                            this._tr.Reset();
                            this.InvalidateRender();
                        }}
                        Transform={this._tr}
                        Scale={this._scale}
                        PageIndex={880}/>
                        */