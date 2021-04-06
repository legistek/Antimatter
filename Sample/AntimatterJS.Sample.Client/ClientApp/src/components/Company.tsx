import { Antimatter, Binding, BindingMode, BindingParameters, DataContext, ReactClient, AntimatterComponent, ReactDataContext } from '@antimatterjs/react';
import * as React from 'react';
import { Component } from 'react';
import { List, PrimaryButton, TextField } from '@fluentui/react';

export interface ITextBoxProps
{
    Text: string | Binding,
    Label: string | Binding
}
interface ITextBoxState
{
    Text: string,
    Label: string
}

export class TextBox extends AntimatterComponent<ITextBoxProps, ITextBoxState>
{
    render()
    {
        return (
            <TextField
                label={this.state.Label}
                value={this.state.Text || ''}
                onChange={(event, newValue) =>                
                    this.OnTargetChanged("Text", newValue)
                }
            />);
    }
}

export class Employee extends AntimatterComponent<{ num?: number }>
{
    static displayName = Employee.name;

    constructor(props)
    {
        super(props);
    }

    render()
    {
        console.log("Employee " + this.props.num + " rendering");
        
        return (
            <div style={{ display: "flex", flexDirection: "column" }}>                
                <TextBlock Text={new Binding({Path: "FullName"})} />

                <h4>Edit Info</h4>
                <TextBox Label="First Name" Text={new Binding({ Path: "FirstName", Mode: BindingMode.TwoWay })} />
                <TextBox Label="Last Name" Text={new Binding({ Path: "LastName", Mode: BindingMode.TwoWay })} />
                <h4>Age</h4>
                <TextBlock Text={new Binding({ Path: "Age" })} />
                <PrimaryButton onClick={this.BindCommand({ Path: "IncreaseAgeCommand" })}>
                    INCREASE
                </PrimaryButton>
            </div>
        );
    }
}

export class TextBlock extends AntimatterComponent<{ Text?: string | Binding }>
{
    static displayName = TextBlock.name;

    render()
    {
        //console.log("TextBlock rendering");
        return (<span>{this.state["Text"]}</span>);
    }
}

export class Company extends AntimatterComponent
{
    static displayName = Company.name;    
    render()
    {
        console.log("Company rendering");


        this.BindState({ Source: this.state["DataContext"], Path: "Employees" }, "employees");

        return (
            <div>
                <div>
                    <ReactDataContext.Consumer>
                        {ctx => (
                            <h1>{this.BindState({ Path: "Name", Source: ctx })}</h1>
                        )}
                    </ReactDataContext.Consumer>
                    
                    <TextBlock Text={new Binding({ Path: "Name"})}/>
                </div>                

                <List
                    items={this.state["employees"]}
                    onRenderCell={
                        (item, index) =>
                        (                    
                            <DataContext Value={item}>
                                <Employee />
                            </DataContext>                    
                        )
                }/>


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
