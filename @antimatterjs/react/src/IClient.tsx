import { Component } from "react";
import * as internal from "stream";
import { BindingExpression } from "./BindingExpression";
import { BindingParameters } from "./BindingParameters";
import { ICollectionUpdate, NotifyCollectionChangedAction } from "./ICollectionUpdate";
import { ModelValue } from "./ModelValue";

export interface IClient
{
    RegisterRoot(root: any);
    InitializeComponent(target: any);
    UpdateTargetValue(target: any, targetProperty: string, value: any, reRender: boolean);
    BindState(target: any, args?: BindingParameters, stateVar?: string): any;
    TargetChanged(component: Component, prop: string, value: any, reRender?: boolean, suspendNotifyModel?: boolean): void;
    NavigateTo(route: string);

    ModelUpdateBoundCollection(
        bx: BindingExpression,
        action: NotifyCollectionChangedAction,
        index: number,
        count: number,
        items: ModelValue[] | undefined): void;

    ViewUpdateBoundCollection(
        bx: BindingExpression,
        target: any,
        targetProperty: string,
        update: ICollectionUpdate,
        reRender: boolean): void;    
}