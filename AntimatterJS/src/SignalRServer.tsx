import * as SignalR from '@microsoft/signalr'
import { IServer } from "./IServer";
import { BindingExpression } from "./BindingExpression";
import { ModelObjectReference } from "./ModelObjectReference";
import { ModelValue, ModelValueType } from './ModelValue';

export class SignalRServer implements IServer
{    
    constructor()
    {
        this._connection = new SignalR.HubConnectionBuilder().withUrl("/interophub").build();        
    }

    //#region Client-Invocable Methods

    public async StartupAsync(): Promise<void>
    {
        this._connection.on("UpdateBinding", this.UpdateBinding.bind(this));
        await this._connection.start();
        await this._connection.invoke("Startup");
    }

    public async GetRootObject(objectid: string): Promise<ModelObjectReference>
    {
        let handle: number = await this._connection.invoke("GetRootObject", objectid);
        return new ModelObjectReference(handle);
    }

    public ExecuteICommand(netRef: ModelObjectReference): Promise<void>
    {
        return this._connection.invoke("ExecuteICommand", netRef.Handle);
    }

    public Bind(netRef: ModelObjectReference, path: string, expression: BindingExpression) 
    {
        this._connection.invoke("Bind", netRef.Handle, path, expression.Index);
    }

    //#endregion

    //#region Server-Invocable Methods

    private UpdateBinding(bxIndex: number, valueJson: string)
    {
        var valueObj = JSON.parse(valueJson);
        var value = this.getDotNetValue(valueObj);
        BindingExpression.OnExternalSourceValueChanged(bxIndex, value);
    }

    //#endregion

    private getDotNetValue(valuePtr: ModelValue): any
    {
        switch (valuePtr.Type)
        {
            case ModelValueType.None:
                return undefined;
            case ModelValueType.Int:
                return valuePtr.IntValue;
            case ModelValueType.String:
                return valuePtr.StringValue;
            case ModelValueType.ObjectHandle:
                var index = valuePtr.ObjectHandle;
                if (index)
                    return new ModelObjectReference(index);
        }
        return undefined;
    }

    _connection: SignalR.HubConnection;
}