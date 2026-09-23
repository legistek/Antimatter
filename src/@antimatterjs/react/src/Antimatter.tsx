import { Component } from "react";
import { BindingExpression } from "./BindingExpression";

import { BindingParameters } from "./BindingParameters";
import { IClient } from "./IClient";
import { IServer } from "./IServer";
import { ModelValue } from "./ModelValue";
import { HostPlatform, Utilities } from "./Utilities";
import { ICollectionUpdate, NotifyCollectionChangedAction } from "./ICollectionUpdate";
import { IClientFile } from "./IClientFile";

export class Antimatter
{
    static _client: IClient;
    private static _nextID: number = 0;

    public static get Debug(): boolean
    {
        return process.env.NODE_ENV === 'development';
    }

    public static Identifier(debugID: string, isCssVar?: boolean, dontObfuscate?: boolean): string
    {
        if (dontObfuscate || process.env.NODE_ENV === 'development')
            return debugID;
        return `${(isCssVar ? '--' : '')}amx${(Antimatter._nextID++).toString()}`;
    }

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
    public static ViewUpdateBoundCollection(bx: BindingExpression, target: any, targetProperty: string, update: ICollectionUpdate, reRender: boolean)
    {
        Antimatter._client.ViewUpdateBoundCollection(bx, target, targetProperty, update, reRender);
    }

    public static InitializeComponent(target: any)
    {
        Antimatter._client.InitializeComponent(target);
    }

    public static UnapplyAllBindings(target: any)
    {
        Antimatter._client.UnapplyAllBindings(target);
    }

    public static BindState(target: any, args?: BindingParameters, stateVar?: string): any
    {
        return Antimatter._client.BindState(target, args, stateVar);
    }

    // Called to update model after view-side property changes
    public static UpdateModelValue(
        component: Component,
        prop: string,
        value: any,
        reRender?: boolean,
        suspendNotifyModel?: boolean): void
    {
        return Antimatter._client.TargetChanged(component, prop, value, reRender, suspendNotifyModel);
    }

    // Called to update model after view-side changes to bound collection
    public static UpdateModelBoundCollection(
        bx: BindingExpression,
        action: NotifyCollectionChangedAction,
        index: number,
        count: number,
        items?: any[]): void
    {
        return Antimatter._client.ModelUpdateBoundCollection(bx, action, index, count, items);
    }

    public static GetFile(handle: number): File | undefined
    {
        return Antimatter._accessibleFiles.get(handle);
    }

    public static HoldFile(file: File): IClientFile
    {        
        var clientFile: IClientFile = {
            handle: Antimatter._nextFileHandle++,
            name: file.name,
            size: file?.size,
            modified: new Date(file?.lastModified)
        };
        this._accessibleFiles.set(clientFile.handle as number, file);
        return clientFile;
    }

    public FreeFile(args:{ handle: number })
    {
        Antimatter._accessibleFiles.delete(args.handle);
    }

    private static _accessibleFiles: Map<number, File> = new Map<number, File>();
    private static _nextFileHandle: number = 0;
}

(window as any).Antimatter = new Antimatter();