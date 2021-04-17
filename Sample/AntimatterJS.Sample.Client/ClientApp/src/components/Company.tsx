import { Binding, DataContext, AntimatterComponent, ModelObjectReference, } from '@antimatterjs/react';
import * as React from 'react';
import { DefaultEffects, AnimationStyles, MotionAnimations } from '@fluentui/react';
import { ModernButton } from './ModernButton';

import * as Model from '../model/Model';
import { ListBox } from './ListBox';
import { Visibility } from './Visibility';

import { TextBlock, TextBox, StackPanel, Orientation, CheckBox } from '@antimatterjs/positron'

export class Employee extends AntimatterComponent<{ Value: ModelObjectReference | Binding, Company: ModelObjectReference | Binding }, { Value: ModelObjectReference, Company: ModelObjectReference }>
{
    static displayName = Employee.name;

    render()
    {
        // amx-grow-entrance
        return (
            <StackPanel
                BoxShadow={DefaultEffects.elevation8}
                BorderBrush="#C0C0C0"
                BorderThickness="1px"
                Margin="5px"
                Padding="5px"
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
                    <CheckBox Label="Bonus Eligible" IsChecked={new Binding(nameof<Model.Employee>(e => e.IsBonusEligible))} />
                    <Visibility IsVisible={new Binding("IsBonusEligible")}>
                        <TextBox
                            Label="Bonus Amount"
                            Text={new Binding("BonusAmount")}/>
                    </Visibility>
                    <TextBlock Text={new Binding(nameof<Model.Employee>(e => e.Age))} />
                    <StackPanel Orientation={Orientation.Horizontal}>
                        <ModernButton
                            Label="INCREASE AGE"
                            Command={new Binding(nameof<Model.Employee>(e => e.IncreaseAgeCommand))} />
                        <ModernButton
                            Label="FIRE"
                            Command={new Binding({ Path: nameof<Model.Company>(c => c.DeleteEmployeeCommand), Source: this.state.Company })}
                            CommandParameter={new Binding()} />
                    </StackPanel>

                </DataContext>
            </StackPanel>
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
            <div className="amx-headered-grid">

                <StackPanel>
                    <TextBlock Text={new Binding(nameof<Model.Company>(c => c.Name))} />

                    <StackPanel Orientation={Orientation.Horizontal}>
                        <TextBlock Text="Employee Count:" />
                        <TextBlock Text={new Binding("Employees.Count")} />
                    </StackPanel>

                    <ModernButton
                        Label="NEW EMPLOYEE"
                        IsEnabled={new Binding({ Path: "Employees.Count", Converter: (ct) => ct < 100 })}
                        Command={new Binding(nameof<Model.Company>(c => c.NewEmployeeCommand))} />

                    <TextBlock Text="Employee of the month" />

                    <Employee
                        Value={new Binding(nameof<Model.Company>(c => c.SelectedEmployee))}
                        Company={this.state["DataContext"]} />
                </StackPanel>

                <ListBox
                    ItemsSource={new Binding(nameof<Model.Company>(c => c.Employees))}
                    SelectedItem={new Binding(nameof<Model.Company>(c => c.SelectedEmployee))}
                    ItemTemplate={(item) =>
                    (
                        <TextBlock Text={new Binding({ Path: nameof<Model.Employee>(e => e.FullName), Source: item })} />
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
            </div>
        );
    }
}
