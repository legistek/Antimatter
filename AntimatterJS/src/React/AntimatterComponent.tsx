import { Component } from "react";
import { Antimatter } from "../Antimatter";
import { BindingParameters } from "../BindingParameters";

export class AntimatterComponent<P = {}, S = {}> extends Component<P, S>
{
    constructor(props)
    {
        super(props);
        Antimatter.InitializeComponent(this);
    }

    protected BindState(parameters: BindingParameters, stateVar?: string): any
    {
        // Inline Binding. Binding function returns a value 
        // immediately and also binds state for future update                
        return Antimatter.BindState(this, parameters, stateVar);
    }

    protected BindCommand(parameters: BindingParameters, stateVar?: string): () => void
    {                
        return Antimatter.BindCommand(this, parameters);
    }

    public OnTargetChanged(property: string, newValue: any): void
    {
        Antimatter.TargetChanged(this, property, newValue);
    }
}