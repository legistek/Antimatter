/*

import * as SignalR from '@microsoft/signalr'
import { IServer } from "./IServer";
import { BindingExpression } from "./BindingExpression";
import { ModelObjectReference } from "./ModelObjectReference";
import { ModelValue, ModelValueType } from './ModelValue';
import { Utilities } from './Utilities';
import { Antimatter } from './Antimatter';
import { ICollectionUpdate } from './ICollectionUpdate';

export class SignalRServer implements IServer
{    
    constructor()
    {
        this._connection = new SignalR.HubConnectionBuilder().withUrl("/interophub").build();        
    }

    //#region Client-Invocable Methods

    OnServerStartup()
    {
        // nothing special needed here
    }

    public async StartupAsync(): Promise<void>
    {
        this._connection.on("UpdateBinding", this.UpdateBinding.bind(this));
        this._connection.on("NavigateTo", this.NavigateTo.bind(this));
        await this._connection.start();
        await this._connection.invoke("Startup");
    }

    public async GetRootObject(objectid: string): Promise<ModelObjectReference>
    {
        let handle: number = await this._connection.invoke("GetRootObject", objectid);
        return new ModelObjectReference(handle, objectid);
    }

    public ExecuteICommand(netRef: ModelObjectReference, parameter?: any): Promise<void>
    {
        return this._connection.invoke("ExecuteICommand", netRef.Handle, ModelValue.Get(parameter));
    }

    public Bind(netRef: ModelObjectReference, path: string, expression: BindingExpression) 
    {
        this._connection.invoke(
            "Bind",
            netRef.Handle,
            path,
            expression.Index,
            expression.Parameters?.NotifyCollectionChanged || false,
            expression.Parameters?.MarshalValue || false);
    }

    public Unbind(bx: BindingExpression)
    {
        this._connection.invoke("Unbind", bx.Index);
    }

    public UpdateBindingSource(bxIndex: number, value: any)
    {
        this._connection.invoke("UpdateBindingSource", bxIndex, ModelValue.Get(value));
    }

    public UpdateBoundCollection(bxIndex: number, value: ICollectionUpdate)
    {
        // NotImplemented
    }

    public GetCollectionMembers(handle: number, offset: number, count: number)
    {
        // NotImplemented
    }

    public GetCollectionSize(handle: number): number
    {
        return 0;
    }

    public DownloadUrl(url: string)
    {
        // NotImplemented
    }

    public InvokeModelObjectMethod(netRef: ModelObjectReference | number, method: string, args?: any[]): void
    {
                // NotImplemented
    }

    //#endregion

    //#region Server-Invocable Methods

    UpdateBinding(bxIndex: number, valueJson: string)
    {
        var valueObj = JSON.parse(valueJson) as ModelValue;
        var value = this.getDotNetValue(valueObj);
        BindingExpression.OnModelValueChanged(bxIndex, value, valueObj.Type || ModelValueType.Null);
    }

    NavigateTo(route: string)
    {
        Antimatter._client.NavigateTo(route, false);
    }

    //#endregion

    getDotNetValue(valuePtr: ModelValue): any
    {
        switch (valuePtr.Type)
        {
            case ModelValueType.Null:
                return undefined;
            case ModelValueType.Int:
                return valuePtr.IntValue;
            case ModelValueType.String:
            case ModelValueType.ValidationError:
                return valuePtr.StringValue;
            case ModelValueType.Float:
                return valuePtr.FloatValue;
            case ModelValueType.Bool:
                return valuePtr.BoolValue;
            case ModelValueType.DateTime:
                return Utilities.DateFromTicks(valuePtr.DoubleValue || 0);
            case ModelValueType.Collection:
                return valuePtr.Collection?.map(item => this.getDotNetValue(item));
            case ModelValueType.ObjectHandle:
                var index = valuePtr.ObjectHandle;
                var key = valuePtr.Key;
                if (index)
                    return new ModelObjectReference(index, key||"");
        }
        return undefined;
    }

    _connection: SignalR.HubConnection;
}

*/