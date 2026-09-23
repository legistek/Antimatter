import { Component } from "react";
import { BindingExpression } from "./BindingExpression";
import { BindingParameters } from "./BindingParameters";
import { ICollectionUpdate, NotifyCollectionChangedAction } from "./ICollectionUpdate";
import { ModelValue } from "./ModelValue";
import { IBoundComponent } from "./React/ReactClient";

export interface IClient
{
    RegisterRoot(root: any);
    InitializeComponent(target: any);
    UnapplyAllBindings(target: IBoundComponent);
    UpdateTargetValue(target: any, targetProperty: string, value: any, reRender: boolean);
    BindState(target: any, args?: BindingParameters, stateVar?: string): any;
    TargetChanged(component: Component, prop: string, value: any, reRender?: boolean, suspendNotifyModel?: boolean): void;
    NavigateTo(route: string, hard: boolean);
    OpenPopup(route: string, mini: boolean, urlOnPopupClose?: string);

    InvalidateRender(target: any, immediate: boolean): void;
    BeginBatchingUpdates();
    EndBatchingUpdates();

    ModelUpdateBoundCollection(
        bx: BindingExpression,
        action: NotifyCollectionChangedAction,
        index: number,
        count: number,
        items?: any[]): void;

    ViewUpdateBoundCollection(
        bx: BindingExpression,
        target: any,
        targetProperty: string,
        update: ICollectionUpdate,
        reRender: boolean): void;    
}