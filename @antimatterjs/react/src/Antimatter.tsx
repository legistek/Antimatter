import { Component } from "react";

import { BindingParameters } from "./BindingParameters";
import { IClient } from "./IClient";
import { IServer } from "./IServer";
import { Utilities } from "./Utilities";

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

    public static UpdateTargetValue(target: any, targetProperty: string, value: any, reRender: boolean)
    {
        Antimatter._client.UpdateTargetValue(target, targetProperty, value, reRender); 
    }

    public static InitializeComponent(target: any)
    {
        Antimatter._client.InitializeComponent(target);
    }

    public static BindState(target: any, args?: BindingParameters, stateVar?: string): any
    {
        return Antimatter._client.BindState(target, args, stateVar);
    }

    public static BindCommand(target: any, args?: BindingParameters, stateVar?: string): () => void
    {        
        return Antimatter._client.BindCommand(target, args, stateVar);
    }

    public static TargetChanged(
        component: Component,
        prop: string,
        value: any,
        reRender?: boolean): void
    {
        return Antimatter._client.TargetChanged(component, prop, value, reRender);
    }
}