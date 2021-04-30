import { Component } from "react";
import { BindingParameters } from "./BindingParameters";

export interface IClient
{        
    InitializeComponent(target: any);
    UpdateTargetValue(target: any, targetProperty: string, value: any, reRender: boolean);
    BindState(target: any, args?: BindingParameters, stateVar?: string): any;
    BindCommand(target: any, args?: BindingParameters, stateVar?: string): () => void;
    TargetChanged(component: Component, prop: string, value: any): void; 
    NavigateTo(route: string);
}