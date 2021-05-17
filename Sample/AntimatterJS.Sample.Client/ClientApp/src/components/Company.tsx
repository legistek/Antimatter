import { Binding, DataContext, AntimatterComponent, ModelObjectReference, } from '@antimatterjs/react';
import * as React from 'react';
import { DefaultEffects, AnimationStyles, MotionAnimations, Modal, FontWeights } from '@fluentui/react';

import * as Model from '../model/Model';
import { ListBox, SelectionMode, ItemsStackPanel, GroupBox, CommandButton, CommandBar, DataGrid, VerticalAlignment } from '@antimatterjs/positron';

import { TextBlock, TextBox, StackPanel, Orientation, CheckBox, Grid } from '@antimatterjs/positron'

export class Employee extends AntimatterComponent<{ Value: ModelObjectReference | Binding }, { Value: ModelObjectReference }>
{
    static displayName = Employee.name;

    render()
    {
        // amx-grow-entrance
        return (
            <GroupBox 
                /*animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`*/
            >

                <DataContext Value={this.state.Value}>
                    <TextBlock Text={new Binding({ Path: nameof<Model.Employee>(e => e.FullName) })} />
                    <TextBlock Text="Edit Info" FontWeight="bold"/>                    
                    <TextBox                        
                        Label="First Name"
                        Text={new Binding(nameof<Model.Employee>(e => e.FirstName))} />
                    <TextBox
                        Label="Last Name"
                        Text={new Binding(nameof<Model.Employee>(e => e.LastName))} />

                    <TextBlock Text="Age"/>

                    <CheckBox
                        Label="Bonus Eligible"
                        IsChecked={new Binding(nameof<Model.Employee>(e => e.IsBonusEligible))} />                   
                    <TextBox
                        IsVisible={new Binding("IsBonusEligible")}
                        Label="Bonus Amount"
                        Text={new Binding("BonusAmount")}/>
                    <TextBlock Text={new Binding(nameof<Model.Employee>(e => e.Age))} />

                    <CommandBar ItemsSource={new Binding("Commands")}/>

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
                   
                    <Employee Value={new Binding(nameof<Model.Company>(c => c.SelectedEmployee))} />
                </StackPanel>

                <DataGrid ItemsSource={new Binding(nameof<Model.Company>(c => c.Employees))}
                    RowHeight={48}
                    Columns={[
                        {
                            Header: "First Name",
                            Key: "firstName",
                            Template: (item) => (<TextBlock Text={new Binding("FirstName")} VerticalAlignment={VerticalAlignment.Center} />)                                                        
                        },
                        {
                            Header: "Last Name",
                            Key: "lastName",
                            Template: (item) => (<TextBlock Text={new Binding("LastName")} VerticalAlignment={VerticalAlignment.Center} />)
                        },
                        {
                            Header: "Age",
                            Key: "age",
                            Template: (item) => (<TextBlock Text={new Binding("Age")} VerticalAlignment={VerticalAlignment.Center} />)
                        }
                    ]}

                />

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
