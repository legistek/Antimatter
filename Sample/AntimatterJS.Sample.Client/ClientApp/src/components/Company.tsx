import { Binding, BindingMode, DataContext, AntimatterComponent, ReactDataContext, ModelObjectReference } from '@antimatterjs/react';
import * as React from 'react';
import { DefaultEffects, List, PrimaryButton, TextField } from '@fluentui/react';
import { BindableProp } from '@antimatterjs/react/src/BindableProp';



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
    constructor(props)
    {
        super(props, { Text: BindingMode.TwoWay });
    }
    
    render()
    {
        return (
            <TextField
                label={this.state.Label}
                value={this.state.Text || ''}
                onChange={(event, newValue) =>                
                    this.OnTargetChanged("Text", newValue)
                }/>);
    }
}

export class Employee extends AntimatterComponent<{ Value: ModelObjectReference }, { Value: ModelObjectReference }>
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
                        <TextBlock Text={new Binding({Path: "FullName"})} />

                        <h4>Edit Info</h4>
                        <TextBox Label="First Name" Text={new Binding({ Path: "FirstName" })} />
                        <TextBox Label="Last Name" Text={new Binding({ Path: "LastName" })} />
                        <h4>Age</h4>
                        <TextBlock Text={new Binding({ Path: "Age" })} />

                        <ReactDataContext.Consumer>
                            {(ctx) => (
                            <PrimaryButton onClick={this.BindCommand({ Path: "IncreaseAgeCommand", Source: ctx })}>
                                INCREASE
                            </PrimaryButton>
                            )}
                        </ReactDataContext.Consumer>

                    </DataContext>                
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
        return (<div>{this.state["Text"]}</div>);
    }
}

export class Company extends AntimatterComponent
{
    static displayName = Company.name;    
    render()
    {
        console.log("Company rendering");


        this.BindState({ Path: "Employees" }, "employees");

        return (
            <div className="amx-headered-grid">
                                                    
                <TextBlock Text={new Binding({ Path: "Name" })} />

                {/*className="amx-stack-panel scrollable"*/}

                <div 
                    style={{display: "block", overflowY: "auto"}} >
                    <List
                        items={this.BindState({Path: "Employees"})}
                        onRenderCell={
                            (item, index) =>
                            (                                                
                                <Employee Value={item}/>                                             
                            )
                    } />
                </div>

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
