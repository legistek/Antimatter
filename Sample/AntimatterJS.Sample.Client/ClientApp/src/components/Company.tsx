import { Antimatter, Binding, BindingBase, BindingParameters, DataContext, ReactDataContext } from '@antimatterjs/react';
import * as React from 'react';
import { Component } from 'react';
import { PrimaryButton } from '@fluentui/react';
import { ModelObjectReference } from '@antimatterjs/react/src/ModelObjectReference';

//export class Employee extends Component<{DataContext: any}>
//{
//    static displayName = Employee.name;

//    constructor(props)
//    {
//        super(props);
//        Antimatter.InitializeComponent(this);
//    }

//    render()
//    {
//        return (
//            <div>
//                <TextBlock Text={new Binding("FirstName")} />
//                <TextBlock Text={new Binding("LastName")} />                
//            </div>
//            );
//    }
//}

export class AntimatterComponent<P = {}, S = {}> extends Component<P, S>
{
    constructor(props)
    {       
        super(props);
        Antimatter.InitializeComponent(this);
    }

    protected Binding(parameters: BindingParameters): any
    {
        // Inline Binding. Binding function returns a value 
        // immediately and also binds state for future update                
        return Antimatter.Bind(this, { path: parameters.Path, source: parameters.Source });
    }
}

export class Employee extends AntimatterComponent<{num?: number}>
{
    static displayName = Employee.name;

    render()
    {
        console.log("Employee " + this.props.num + " rendering");
        
        return (
            <div style={{ display: "flex", flexDirection: "column" }}>
                <h4>Name</h4>
                <TextBlock Text={new Binding("FirstName")} />
                <TextBlock Text={new Binding("LastName")} />
                <h4>Age</h4>
                <TextBlock Text={new Binding("Age")} />
                {/*<PrimaryButton onClick={Antimatter.BindCommand(this, { path: "IncreaseAgeCommand" })}>*/}
                {/*    Increase*/}
                {/*</PrimaryButton>*/}
            </div>
        );
    }
}

export class TextBlock extends AntimatterComponent<{ Text?: string | BindingBase }>
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
        return (
            <div>
                <div>
                    <ReactDataContext.Consumer>
                        {ctx => (
                            <h1>{this.Binding({ Path: "Name", Source: ctx })}</h1>
                        )}
                    </ReactDataContext.Consumer>
                    
                    <TextBlock Text={new Binding("Name")}/>
                </div>                

                <DataContext Value={new Binding("CEO")}>
                    <ReactDataContext.Consumer>
                        {ctx => (
                            <div>
                                <h2>CEO</h2>
                                <Employee num={1} />
                                <PrimaryButton onClick={Antimatter.BindCommand(this, { path: "IncreaseAgeCommand", source: ctx })}>
                                    Increase
                                </PrimaryButton>
                            </div>
                        )}
                    </ReactDataContext.Consumer>
                </DataContext>
                <DataContext Value={new Binding("CEO")}>
                    <ReactDataContext.Consumer>
                        {ctx => (
                            <div>
                                <h2>CEO</h2>
                                <Employee num={2} />
                                <PrimaryButton onClick={Antimatter.BindCommand(this, { path: "IncreaseAgeCommand", source: ctx })}>
                                    Increase
                                </PrimaryButton>
                            </div>
                        )}
                    </ReactDataContext.Consumer>
                </DataContext>                
                <DataContext Value={new Binding("CEO")}>
                    <ReactDataContext.Consumer>
                        {ctx => (
                            <div>
                                <h2>CEO</h2>
                                <Employee num={3} />
                                <PrimaryButton onClick={Antimatter.BindCommand(this, { path: "IncreaseAgeCommand", source: ctx })}>
                                    Increase
                                </PrimaryButton>
                            </div>
                        )}
                    </ReactDataContext.Consumer>
                </DataContext>
                <DataContext Value={new Binding("CEO")}>
                    <ReactDataContext.Consumer>
                        {ctx => (
                            <div>
                                <h2>CEO</h2>
                                <Employee num={4} />
                                <PrimaryButton onClick={Antimatter.BindCommand(this, { path: "IncreaseAgeCommand", source: ctx })}>
                                    Increase
                                </PrimaryButton>
                            </div>
                        )}
                    </ReactDataContext.Consumer>
                </DataContext>
                <DataContext Value={new Binding("CEO")}>
                    <ReactDataContext.Consumer>
                        {ctx => (
                            <div>
                                <h2>CEO</h2>
                                <Employee num={5} />
                                <PrimaryButton onClick={Antimatter.BindCommand(this, { path: "IncreaseAgeCommand", source: ctx })}>
                                    Increase
                                </PrimaryButton>
                            </div>
                        )}
                    </ReactDataContext.Consumer>
                </DataContext>
                <DataContext Value={new Binding("CEO")}>
                    <ReactDataContext.Consumer>
                        {ctx => (
                            <div>
                                <h2>CEO</h2>
                                <Employee num={6} />
                                <PrimaryButton onClick={Antimatter.BindCommand(this, { path: "IncreaseAgeCommand", source: ctx })}>
                                    Increase
                                </PrimaryButton>
                            </div>
                        )}
                    </ReactDataContext.Consumer>
                </DataContext>
                <DataContext Value={new Binding("CEO")}>
                    <ReactDataContext.Consumer>
                        {ctx => (
                            <div>
                                <h2>CEO</h2>
                                <Employee num={7} />
                                <PrimaryButton onClick={Antimatter.BindCommand(this, { path: "IncreaseAgeCommand", source: ctx })}>
                                    Increase
                                </PrimaryButton>
                            </div>
                        )}
                    </ReactDataContext.Consumer>
                </DataContext>
                <DataContext Value={new Binding("CEO")}>
                    <ReactDataContext.Consumer>
                        {ctx => (
                            <div>
                                <h2>CEO</h2>
                                <Employee num={8} />
                                <PrimaryButton onClick={Antimatter.BindCommand(this, { path: "IncreaseAgeCommand", source: ctx })}>
                                    Increase
                                </PrimaryButton>
                            </div>
                        )}
                    </ReactDataContext.Consumer>
                </DataContext>
                <DataContext Value={new Binding("CEO")}>
                    <ReactDataContext.Consumer>
                        {ctx => (
                            <div>
                                <h2>CEO</h2>
                                <Employee num={9} />
                                <PrimaryButton onClick={Antimatter.BindCommand(this, { path: "IncreaseAgeCommand", source: ctx })}>
                                    Increase
                                </PrimaryButton>
                            </div>
                        )}
                    </ReactDataContext.Consumer>
                </DataContext>
                <DataContext Value={new Binding("CEO")}>
                    <ReactDataContext.Consumer>
                        {ctx => (
                            <div>
                                <h2>CEO</h2>
                                <Employee num={10} />
                                <PrimaryButton onClick={Antimatter.BindCommand(this, { path: "IncreaseAgeCommand", source: ctx })}>
                                    Increase
                                </PrimaryButton>
                            </div>
                        )}
                    </ReactDataContext.Consumer>
                </DataContext>
                <DataContext Value={new Binding("CEO")}>
                    <ReactDataContext.Consumer>
                        {ctx => (
                            <div>
                                <h2>CEO</h2>
                                <Employee num={11} />
                                <PrimaryButton onClick={Antimatter.BindCommand(this, { path: "IncreaseAgeCommand", source: ctx })}>
                                    Increase
                                </PrimaryButton>
                            </div>
                        )}
                    </ReactDataContext.Consumer>
                </DataContext>
                <DataContext Value={new Binding("CEO")}>
                    <ReactDataContext.Consumer>
                        {ctx => (
                            <div>
                                <h2>CEO</h2>
                                <Employee num={12} />
                                <PrimaryButton onClick={Antimatter.BindCommand(this, { path: "IncreaseAgeCommand", source: ctx })}>
                                    Increase
                                </PrimaryButton>
                            </div>
                        )}
                    </ReactDataContext.Consumer>
                </DataContext>

            </div>
        );
    }
}
