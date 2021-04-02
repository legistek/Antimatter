import { Antimatter, Binding, BindingBase, BindingParameters, DataContext, ReactDataContext } from '@antimatterjs/react';
import * as React from 'react';
import { Component } from 'react';
import { PrimaryButton } from '@fluentui/react';

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

export class AntimatterProps
{
    DataContext?: any;
}

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

export class Employee extends AntimatterComponent
{
    static displayName = Employee.name;

    render()
    {        
        return (
            <div style={{ display: "flex", flexDirection: "column" }}>
                <h4>Name</h4>
                <TextBlock Text={new Binding("FirstName")} />
                <TextBlock Text={new Binding("LastName")} />
                <h4>Age</h4>
                <TextBlock Text={new Binding("Age")} />
                <PrimaryButton onClick={Antimatter.BindCommand(this, { path: "IncreaseAgeCommand" })}>
                    Increase
                </PrimaryButton>
            </div>
        );
    }
}

export class TextBlock extends AntimatterComponent<{ Text?: string | BindingBase }>
{
    static displayName = TextBlock.name;

    render()
    {
        return (<span>{this.state["Text"]}</span>);
    }
}


export class Company extends AntimatterComponent
{
    static displayName = Company.name;

    render()
    {
        return (
            <div>
                <div>
                    <h1>{this.Binding({ Path: "Name" })}</h1>
                </div>                
                    
                <DataContext Value={new Binding("CEO")}>
                    <div>
                        <h2>CEO</h2>
                        <Employee />
                    </div>
                </DataContext>
                
            </div>
        );
    }
}
