import { Binding, DataContext, AntimatterComponent, ModelObjectReference, BindingMode, } from '@antimatterjs/react';
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
    ScrollBarVisibility,
    VirtualizingPanel,
    Point
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
    private _sizeFaker: HTMLElement | null = null;
    private _colors: any[];
    private _i: number = 0;
    private _vsp: VirtualizingStackPanel | null = null;
    private _scroller: Panel | null = null;
    private _scrollOrigin: Point = new Point();
    private _wasHscrolled: boolean = false;
    private _origCenterX: number = 0;
    private _origScrollX: number = 0;

    constructor(props)
    {
        super(props);
        this.LoadPDFAsync();

        this._colors = new Array(1000);
        for (let i = 0; i < this._colors.length; i++)
        {
            var color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`;
            this._colors[i] = {
                color: color,
                width: 500,// + (i % 10) * 25,
                key: color
            };
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

        this.BindState(
            {
                Path: "DocScale",
                Mode: BindingMode.TwoWay
            },
            "docScale");

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
                        <Panel VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                            HorizontalScrollBarVisibility={ScrollBarVisibility.Auto}
                            ref={r => this._scroller = r}>
                            <VirtualizingStackPanel
                                ref={r => this._vsp = r}
                                HorizontalAlignment={HorizontalAlignment.Center}
                                OnManipulationStarted={((e) =>
                                {
                                    var vsp = this._vsp?.Container;
                                    var scroller = this._scroller?.Container;
                                    if (!vsp || !scroller)
                                        return;
                                    
                                    this._wasHscrolled = vsp.clientWidth > scroller.clientWidth;
                                    this._origScrollX = scroller.scrollLeft;

                                    this._tr.CenterX = this._origCenterX = e.CenterX;
                                    this._tr.CenterY = e.CenterY;
                                    this._scrollOrigin = {
                                        X: vsp.getBoundingClientRect().x - (vsp.parentElement?.getBoundingClientRect()?.x || 0),
                                        Y: scroller.scrollTop,
                                    };

                                    //console.log(`Transform: X: Initial Scroll ${this._scrollOrigin.X}`);
                                }).bind(this)}
                                OnManipulationDelta={((e) =>
                                {
                                    var vsp = this._vsp?.Container;
                                    var scroller = this._scroller?.Container;
                                    if (!vsp || !scroller || !this._sizeFaker)
                                        return;

                                    {
                                        var rc = vsp.getBoundingClientRect();
                                        var rs = scroller.getBoundingClientRect();
                                        //var scrolling = rc.width > rs.width;
                                        let offset: number = 0;
                                        if (this._wasHscrolled && rs.width > rc.width)
                                        {
                                            offset = rc.x - rs.x;
                                            //this._tr.CenterX = this._origCenterX - offset;
                                        }
                                        
                                        this._tr.TranslateX = e.CumulativeX;
                                        this._tr.TranslateY = e.CumulativeY;
                                        this._tr.ScaleX = e.CumulativeScale;
                                        this._tr.ScaleY = e.CumulativeScale;

                                        if (this._tr.ScaleX !== 1)
                                        {
                                            scroller.style.overflow = "hidden";
                                            this._sizeFaker.style.width = '2000px';
                                        }

                                        //var desiredScrollLeft = this._origScrollX * e.CumulativeScale - e.CumulativeX;
                                        //scroller.scrollLeft = desiredScrollLeft;
                                        //console.log(`Translate ${e.CumulativeX}, Scale ${e.CumulativeScale}, desired scrollLeft; ${desiredScrollLeft}, new actual scrollLeft: ${scroller.scrollLeft}`);
                                    }
                                }).bind(this)}
                                OnManipulationCompleted={((e) =>
                                {
                                    var vsp = this._vsp;
                                    var scroller = this._scroller?.Container;
                                    if (!vsp || !scroller || !vsp.Container || !this._sizeFaker)
                                        return;

                                    var newFinalScale = this.GetValue("docScale") * this._tr?.AbsoluteScale || 1;
                                    this.SetValue("docScale", newFinalScale);

                                    this._sizeFaker.style.width = '0px';
                                    scroller.style.overflow = "auto";
                                        
                                    var ds = {
                                        X: (vsp?.Container?.parentElement?.getBoundingClientRect()?.x || 0) -
                                            (vsp?.Container?.getBoundingClientRect().x || 0),
                                        Y: this._scrollOrigin.Y * 1 - ((this._tr?.AbsoluteY || 0) / 1)
                                    }

                                    vsp.SetDesiredScroll(ds);
                                    this._tr.Reset();                                    
                                }).bind(this)}
                                Transform={this._tr}
                                VerticalAlignment={VerticalAlignment.Top}                                
                                Scale={new Binding("DocScale")}
                                ItemsParent={tp}
                                ItemHeight={500}
                            />
                            <div
                                ref={r => this._sizeFaker = r}
                                id="sizeFaker"
                                style={{ height: 1, position: 'absolute' }} >
                            </div>
                        </Panel>                        
                    ))}
                    ItemTemplate={new DataTemplate((item) =>
                    (<Ellipse                        
                        Width={item.width}                        
                        Height={500}
                        Fill={item.color}/>))}

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