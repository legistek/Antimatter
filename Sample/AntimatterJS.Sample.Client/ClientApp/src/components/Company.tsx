import { Binding, DataContext, AntimatterComponent, ModelObjectReference } from '@antimatterjs/react';
import * as React from 'react';
import { DefaultEffects, AnimationStyles, MotionAnimations } from '@fluentui/react';
import { ModernButton } from './ModernButton';
import { ListView } from './ListView';
import { TextBlock } from './TextBlock';
import { TextBox } from './TextBox';

import * as Model from '../model/Model';
import { ListBox } from './ListBox';
import { Orientation, StackPanel } from './StackPanel';

export class Employee extends AntimatterComponent<{ Value: ModelObjectReference | Binding, Company: ModelObjectReference | Binding }, { Value: ModelObjectReference, Company: ModelObjectReference }>
{
    static displayName = Employee.name;

    render()
    {
        // amx-grow-entrance
        return (
            <StackPanel style={{
                    boxShadow: DefaultEffects.elevation8,
                    border: "1px solid #C0C0C0",
                    margin: "5px",
                    padding: "5px",
                    /*animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`*/
                }}>

                <DataContext Value={this.state.Value}>
                    <TextBlock Text={new Binding({ Path: nameof<Model.Employee>(e => e.FullName) })} />

                    <b>Edit Info</b>
                    <TextBox Label="First Name" Text={new Binding(nameof<Model.Employee>(e => e.FirstName))} />
                    <TextBox Label="Last Name" Text={new Binding(nameof<Model.Employee>(e => e.LastName))} />
                    <h4>Age</h4>
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
                    
                    <TextBlock Text={new Binding("Name")} />

                    <StackPanel Orientation={Orientation.Horizontal}>
                        <TextBlock Text="Employee Count:" />
                        <TextBlock Text={new Binding("Employees.Count")} />
                    </StackPanel>

                    <ModernButton
                        Label="NEW EMPLOYEE"
                        IsEnabled={new Binding({ Path: "Employees.Count", Converter: (ct)=>ct < 5 })}
                        Command={new Binding("NewEmployeeCommand")} />

                    <TextBlock Text="Employee of the month" />
                    <Employee Value={new Binding("SelectedEmployee")} Company={this.state["DataContext"]} />

                </StackPanel>

                <ListBox
                    ItemsSource={new Binding("Employees")}
                    SelectedItem={new Binding("SelectedEmployee")}
                    ItemTemplate={(item) =>
                    (                       
                        <TextBlock Text={new Binding({Path: "FullName", Source:item}) }/>                                                    
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
