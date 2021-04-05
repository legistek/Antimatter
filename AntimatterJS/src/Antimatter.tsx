import { Component } from "react";
import { BindingParameters } from "./Binding";
import { IClient } from "./IClient";
import { IServer } from "./IServer";
import { ModelObjectReference } from "./ModelObjectReference";

export class Antimatter
{
    private static _client: IClient;

    public static Server: IServer;   

    public static StartAsync(server: IServer, client: IClient): Promise<void>
    {
        Antimatter.Server = (window as any).AntimatterServer = server;
        Antimatter._client = (window as any).AntimatterClient = client;
        return server.StartupAsync();
    }

    public static UpdateTargetValue(target: any, targetProperty: string, value: any, reRender: boolean)
    {
        Antimatter._client.UpdateTargetValue(target, targetProperty, value, reRender);
    }

    public static InitializeComponent(target: any)
    {
        Antimatter._client.InitializeComponent(target);
    }

    public static Bind(target: any, args?: BindingParameters, stateVar?: string): any
    {
        return Antimatter._client.Bind(target, args, stateVar);
    }

    public static BindCommand(target: any, args?: { path: string, source?: ModelObjectReference }): () => void
    {
        return Antimatter._client.BindCommand(target, args);
    }

    public static PropChanged(component: Component, prop: string, value: any): void
    {
        return Antimatter._client.PropChanged(component, prop, value);
    }
}