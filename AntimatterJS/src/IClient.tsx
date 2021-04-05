import { Component } from "react";
import { BindingBase, BindingMode, BindingParameters } from "./Binding";
import { BindingExpression } from "./BindingExpression";
import { ModelObjectReference } from "./ModelObjectReference";

export interface IClient
{        
    InitializeComponent(target: any);
    UpdateTargetValue(target: any, targetProperty: string, value: any, reRender: boolean);
    Bind(target: any, args?: BindingParameters, stateVar?: string): any;
    BindCommand(target: any, args?: { path: string, source?: ModelObjectReference }): () => void;
    PropChanged(component: Component, prop: string, value: any): void;
}