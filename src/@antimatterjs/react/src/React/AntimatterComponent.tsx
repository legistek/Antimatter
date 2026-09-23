import { Component } from "react";
import { Antimatter } from "../Antimatter";
import { BindableProp } from "../BindableProp";
import { BindingParameters } from "../BindingParameters";

export class AntimatterComponent<P = {}, S = {}> extends Component<P, S>
{
    constructor(props)
    {
        super(props);
        Antimatter.InitializeComponent(this);
    }

    BindState(parameters: BindingParameters, stateVar?: string): any
    {
        // Inline Binding. Binding function returns a value 
        // immediately and also binds state for future update                
        return Antimatter.BindState(this, parameters, stateVar);
    }

    public OnTargetChanged(property: string, newValue: any): void
    {
        Antimatter.UpdateModelValue(this, property, newValue);
    }
}