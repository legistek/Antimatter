import { Binding, BindingMode, DataContext, AntimatterComponent, ReactDataContext, ModelObjectReference } from '@antimatterjs/react';
import * as React from 'react';
import { DefaultEffects, List, PrimaryButton, TextField } from '@fluentui/react';
import { BindableProp } from '@antimatterjs/react/src/BindableProp';
import { ModernButton } from './ModernButton';
import { ListView } from './ListView';
import { TextBlock } from './TextBlock';
import { TextBox } from './TextBox';

import * as Model from '../model/Model';

export class Employee extends AntimatterComponent<{ Value: ModelObjectReference | Binding, Company: ModelObjectReference | Binding }, { Value: ModelObjectReference, Company: ModelObjectReference }>
{
    static displayName = Employee.name;

    constructor(props)
    {
        super(props);
    }

    render()
    {
        return (
            <div className="amx-stack-panel"
                style={{ boxShadow: DefaultEffects.elevation8, border: "1px solid #C0C0C0", margin: "5px", padding: "5px" }}>

                <DataContext Value={this.state.Value}>
                    <TextBlock Text={new Binding({ Path: nameof<Model.Employee>(e => e.FullName) })} />

                    <b>Edit Info</b>
                    <TextBox Label="First Name" Text={new Binding(nameof<Model.Employee>(e => e.FirstName))} />
                    <TextBox Label="Last Name" Text={new Binding(nameof<Model.Employee>(e => e.LastName))} />
                    <h4>Age</h4>
                    <TextBlock Text={new Binding(nameof<Model.Employee>(e => e.Age))} />

                    <div className="amx-stack-panel horizontal">
                        <ModernButton
                            Label="INCREASE AGE"
                            Command={new Binding(nameof<Model.Employee>(e => e.IncreaseAgeCommand))} />
                        <ModernButton
                            Label="FIRE"
                            Command={new Binding({ Path: nameof<Model.Company>(c => c.DeleteEmployeeCommand), Source: this.state.Company })}
                            CommandParameter={new Binding()}
                        />
                    </div>

                    {/*<ReactDataContext.Consumer>*/}
                    {/*    {(ctx) => (*/}
                    {/*        <PrimaryButton onClick={this.BindCommand({ Path: "IncreaseAgeCommand", Source: ctx })}>*/}
                    {/*            INCREASE*/}
                    {/*        </PrimaryButton>*/}
                    {/*    )}*/}
                    {/*</ReactDataContext.Consumer>*/}

                </DataContext>
            </div>
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

                <div className="amx-stack-panel">
                    <TextBlock Text={new Binding({ Path: "Name" })} />
                    <ModernButton Label="NEW EMPLOYEE"
                        Command={new Binding("NewEmployeeCommand")} />
                </div>

                <ListView ItemsSource={new Binding({ Path: "Employees", NotifyCollectionChanged: true })}
                    ItemTemplate={(item) =>
                    (
                        <Employee
                            Value={item}
                            key={item?.IsModelObjectReference ? item.Handle : null}
                            Company={this.state["DataContext"]} />
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
