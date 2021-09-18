import { Component } from "react";
import { BindingExpression } from "./BindingExpression";

import { BindingParameters } from "./BindingParameters";
import { IClient } from "./IClient";
import { IServer } from "./IServer";
import { ModelValue } from "./ModelValue";
import { Utilities } from "./Utilities";
import { ICollectionUpdate, NotifyCollectionChangedAction } from "./ICollectionUpdate";
import { Hobo } from "./BoundCollection";

export class Antimatter
{
    static _client: IClient;

    public static Server: IServer;   

    public static async StartAsync(server: IServer|null, client: IClient): Promise<void>
    {
        var browser = Utilities.GetBrowser();
        console.log(`Browser: ${browser.Name} version ${browser.Version}`);

        Antimatter._client = (window as any).AntimatterClient = client;
        if (server)
        {
            Antimatter.Server = (window as any).AntimatterServer = server;
            return await server.StartupAsync();
        }
    }

    // Called to update View after model-side property changes
    public static UpdateTargetValue(target: any, targetProperty: string, value: any, reRender: boolean)
    {
        Antimatter._client.UpdateTargetValue(target, targetProperty, value, reRender); 
    }

    // Called to update View after model-side changes to a bound collection
    public static UpdateTargetBoundCollection(target: any, targetProperty: string, update: ICollectionUpdate, reRender: boolean)
    {
        Hobo;
    }

    public static InitializeComponent(target: any)
    {
        Antimatter._client.InitializeComponent(target);
    }

    public static BindState(target: any, args?: BindingParameters, stateVar?: string): any
    {
        return Antimatter._client.BindState(target, args, stateVar);
    }

    // Called to update model after view-side property changes
    public static TargetChanged(
        component: Component,
        prop: string,
        value: any,
        reRender?: boolean,
        suspendNotifyModel?: boolean): void
    {
        return Antimatter._client.TargetChanged(component, prop, value, reRender, suspendNotifyModel);
    }

    // Called to update model after view-side changes to bound collection
    public static BoundCollectionChanged(
        bx: BindingExpression,
        action: NotifyCollectionChangedAction,
        index: number,
        count: number,
        items: ModelValue[]|undefined): void
    {
        return Antimatter._client.BoundCollectionTargetChanged(bx, action, index, count, items);
    }
}