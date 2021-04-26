import { Binding, DataContext, AntimatterComponent, ModelObjectReference, } from '@antimatterjs/react';
import * as React from 'react';
import { DefaultEffects, AnimationStyles, MotionAnimations, Modal } from '@fluentui/react';

import * as Model from '../model/Model';
import { ListBox, SelectionMode, ItemsStackPanel, GroupBox, CommandButton } from '@antimatterjs/positron';

import { TextBlock, TextBox, StackPanel, Orientation, CheckBox, Grid } from '@antimatterjs/positron'

export class Employee extends AntimatterComponent<{ Value: ModelObjectReference | Binding, Company: ModelObjectReference | Binding }, { Value: ModelObjectReference, Company: ModelObjectReference }>
{
    static displayName = Employee.name;

    render()
    {
        // amx-grow-entrance
        return (
            <GroupBox Header="Employee of the Month"
                /*animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`*/
            >

                <DataContext Value={this.state.Value}>
                    <TextBlock Text={new Binding({ Path: nameof<Model.Employee>(e => e.FullName) })} />

                    <b>Edit Info</b>
                    <TextBox
                        Label="First Name"
                        Text={new Binding(nameof<Model.Employee>(e => e.FirstName))} />
                    <TextBox
                        Label="Last Name"
                        Text={new Binding(nameof<Model.Employee>(e => e.LastName))} />
                    <h4>Age</h4>
                    <CheckBox
                        Label="Bonus Eligible"
                        IsChecked={new Binding(nameof<Model.Employee>(e => e.IsBonusEligible))} />                   
                    <TextBox
                        IsVisible={new Binding("IsBonusEligible")}
                        Label="Bonus Amount"
                        Text={new Binding("BonusAmount")}/>
                    <TextBlock Text={new Binding(nameof<Model.Employee>(e => e.Age))} />
                    <StackPanel Orientation={Orientation.Horizontal}>
                        <CommandButton
                            Style={CommandButton.IconButtonStyle}
                            Command={new Binding(nameof<Model.Employee>(e => e.IncreaseAgeCommand))}/>
                        <CommandButton
                            Style={CommandButton.CommandBarButtonStyle}
                            Command={new Binding({ Path: nameof<Model.Company>(c => c.DeleteEmployeeCommand), Source: this.state.Company })}
                            CommandParameter={new Binding()} />
                    </StackPanel>

                    <Modal isOpen={this.BindState({ Path: "IsBonusEligible", Source: this.state.Value })}
                        styles={{
                            main: {
                                animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
                            }
                            }}>
                        
                        <StackPanel>
                            <TextBlock Text="Hobo!" />
                            <CheckBox Label="Bonus Eligible" IsChecked={new Binding(nameof<Model.Employee>(e => e.IsBonusEligible))} />
                        </StackPanel>

                    </Modal>

                </DataContext>



            </GroupBox>
        );
    }
}

export class Company extends AntimatterComponent
{
    static displayName = Company.name;
    render()
    {        
        console.log("Company rendering");

        //this.BindState({ Path: "Employees" }, "employees");

        return (
            <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
            
                <StackPanel>
                    <TextBlock Text={new Binding(nameof<Model.Company>(c => c.Name))} />

                    <StackPanel Orientation={Orientation.Horizontal}>
                        <TextBlock Text="Employee Count:" />
                        <TextBlock Text={new Binding("Employees.Count")} />
                    </StackPanel>

                    <CommandButton Command={new Binding(nameof<Model.Company>(c => c.NewEmployeeCommand))}
                        Style={CommandButton.CommandBarButtonStyle}/>

                    {/*<ModernButton*/}
                    {/*    Label="NEW EMPLOYEE"*/}
                    {/*    IsEnabled={new Binding({ Path: "Employees.Count", Converter: (ct) => ct < 100 })}*/}
                    {/*    Command={new Binding(nameof<Model.Company>(c => c.NewEmployeeCommand))} />*/}
                   
                    <Employee
                        Value={new Binding(nameof<Model.Company>(c => c.SelectedEmployee))}
                        Company={this.state["DataContext"]} />
                </StackPanel>

                <ListBox                    
                    SelectionMode={SelectionMode.Single}                    
                    ItemsPanel={ItemsStackPanel}
                    ItemsSource={new Binding(nameof<Model.Company>(c => c.Employees))}
                    SelectedItem={new Binding(nameof<Model.Company>(c => c.SelectedEmployee))}
                    ItemTemplate={(item) =>
                    (
                        <TextBlock Text={new Binding({ Path: nameof<Model.Employee>(e => e.FullName), Source: item })}
                            Margin="10px"
                        />
                    )} />

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
