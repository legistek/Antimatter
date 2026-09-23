import { Antimatter } from "../Antimatter";
import { BindingExpression } from "../BindingExpression";
import { ModelObjectReference } from "../ModelObjectReference";

import { IServer } from "../IServer";

import { Utilities } from "../Utilities";
import { ICollectionUpdate, NotifyCollectionChangedAction } from "../ICollectionUpdate";

import { IClientFile } from "./../IClientFile";
import { BindingMode } from "./../BindingParameters";
import { UploadFileArgs } from "./../UploadFileArgs";
import { Rect, Size } from "./../Foundation";
import { ObservableObject } from "./ObservableObject";
import { JSBindingExpression } from "./JSBindingExpression";
import { Command } from "./Command";

export class JSModelServer implements IServer
{
    constructor(roots: Map<string, ObservableObject>)
    {
        this._roots = roots;        
    }

    AddRef(handle: number)
    {
    }

    ReleaseRef(handle: number)
    {
    }

    StartupAsync(): Promise<void> 
    {
        return Promise.resolve();
    }

    OnServerStartup(): void 
    {       
    }

    ParseLocallyFormattedDate(date: string): Date
    {
        return new Date(date);
    }

    GetRootObject(objectid: string): Promise<ModelObjectReference> 
    {
        var obj = this._roots.get(objectid);
        if (!obj)
            return Promise.reject(`Object ${objectid} not registered root.`);
        return Promise.resolve(new ModelObjectReference(obj, obj.Key));
    }

    public OnUserActivity()
    {
        localStorage.setItem('lastActivity', (new Date()).getTime().toString());
    }

    public async ExecuteICommand(
        netRef: ModelObjectReference,
        parameter?: any): Promise<void> 
    {
        var cmd = netRef.Handle as Command;
        if (!(cmd instanceof Command))
            return Promise.reject("Not a command");

        return await cmd.Execute(
            parameter instanceof ModelObjectReference
                ? parameter.Handle
                : parameter);
    }

    InvokeModelObjectMethod(
        netRef: number | ModelObjectReference,
        method: string,
        args?: any[]): void 
    {
        throw new Error("Method not implemented.");
    }

    Bind(
        ref: ModelObjectReference,
        path: string | undefined,
        expression: BindingExpression) 
    {
        var bx = new JSBindingExpression(expression);
        this._bindings.set(expression.Index, bx);
        if (!bx.Apply(ref.Handle))
            this._bindings.delete(expression.Index);
    }

    Unbind(exp: BindingExpression) 
    {
        var bx = this._bindings.get(exp.Index);
        if (bx)
        {
            bx.Unbind();
            this._bindings.delete(exp.Index);
        }
    }

    UpdateBindingSource(bxIndex: number, value: any) 
    {
        var bx = this._bindings.get(bxIndex);
        if (!bx)
            return;
        bx.UpdateSource(
            value instanceof ModelObjectReference
                ? value.Handle
                : value);
    }

    UpdateBoundCollection(bxIndex: number, value: ICollectionUpdate) 
    {
        throw new Error("Method not implemented.");
    }

    GetCollectionMembers(handle: number, offset: number, count: number) 
    {
        throw new Error("Method not implemented.");
    }

    GetCollectionSize(handle: number): number 
    {
        throw new Error("Method not implemented.");
    }

    DownloadUrl(url: string) 
    {
        throw new Error("Method not implemented.");
    }

    InvokeBeforeClose(): boolean
    {
        return false;
    }

    private _roots: Map<string, ObservableObject>;
    private _bindings = new Map<number, JSBindingExpression>();
}