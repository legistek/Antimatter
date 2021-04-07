import { Antimatter } from "./Antimatter";
import { BindingExpression } from "./BindingExpression";
import { ModelObjectReference } from "./ModelObjectReference";

import { IServer } from "./IServer";
import { ModelValue, ModelValueType } from "./ModelValue";

export class WebassemblyServer implements IServer
{
    StartupAsync(): Promise<void>
    {
        // just returns a promise that loops until the 
        // Mono WASM "Module" is detected
        return new Promise<void>((resolve, reject) =>
        {
            var loop = () =>
            {
                setTimeout(function ()
                {
                    if ((window as any).Module)
                        resolve();
                    else
                    {
                        console.log("Still waiting for WASM module...");
                        loop();
                    }
                }, 1000);
            };
            loop();
        });        
    }

    //#region Client-Invocable Methods

    GetRootObject(objectid: string): Promise<ModelObjectReference>
    {       
        var handle = this.CallStaticMethod(
            WebassemblyServer.c_ServerAssembly,
            WebassemblyServer.c_ServerType,
            "GetRootObject",
            objectid);
        return Promise.resolve(new ModelObjectReference(handle));
    }

    ExecuteICommand(netRef: ModelObjectReference) : Promise<void>
    {
        if (!this._executeICommandMethod)
        {
            this._executeICommandMethod = this.Module.mono_bind_static_method(
                this.MakeMethodKey(
                    WebassemblyServer.c_ServerAssembly,
                    WebassemblyServer.c_ServerType,
                    "ExecuteICommand"));
        }
        this._executeICommandMethod(netRef.Handle);
        return Promise.resolve();
    }

    Bind(ref: ModelObjectReference, path: string, expression: BindingExpression)
    {
        if (!this._bindMethod)
        {
            this._bindMethod = this.Module.mono_bind_static_method(
                this.MakeMethodKey(
                    WebassemblyServer.c_ServerAssembly,
                    WebassemblyServer.c_ServerType,
                    "Bind"));
        }
        this._bindMethod(ref.Handle, path, expression.Index, expression.Parameters?.NotifyCollectionChanged || false);
    }

    UpdateBindingSource(bxIndex: number, value: ModelValue)
    {
        if (!this._updateSourceValueMethod)
        {
            this._updateSourceValueMethod = this.Module.mono_bind_static_method(
                this.MakeMethodKey(
                    WebassemblyServer.c_ServerAssembly,
                    WebassemblyServer.c_ServerType,
                    "UpdateBindingSource"));
        }
        this._updateSourceValueMethod(bxIndex, JSON.stringify(value));
    }

    //#endregion

    //#region Server-Invocable Methods

    public UpdateBinding(bxIndex: number, valuePtr: number)
    {
        var value = this.getDotNetValue(valuePtr);        
        BindingExpression.OnExternalSourceValueChanged(bxIndex, value);
    }

    //#endregion

    //#region Private Members

    private CallStaticMethod(assembly: string, className: string, methodName: string, ...parameters: any[]): any
    {
        const methodKey = this.MakeMethodKey(assembly, className, methodName);
        let method: any = this._cachedMethods.get(methodKey);
        if (!method)
        {
            method = this.Module.mono_bind_static_method(methodKey);
            if (method)
                this._cachedMethods.set(methodKey, method);
        }
        return method(...parameters);
    }

    private get Module(): any
    {
        return (window as any).Module;
    }

    private getStringValue(ptr: number): string
    {
        const fieldValue = this.getValueI32(ptr);

        if (fieldValue === 0)
        {
            return '';
        }

        return (window as any).BINDING.conv_string(fieldValue) as string;
    }

    private getValueI16(ptr: number)
    {
        return this.Module.HEAP16[ptr >> 1];
    }

    private getValueI32(ptr: number)
    {
        return this.Module.HEAP32[ptr >> 2];
    }

    private getValueFloat(ptr: number)
    {        
        return this.Module.HEAPF32[ptr >> 2];
    }

    private getArrayValue(ptrptr: number)
    {
        // Where the array's actual data is
        var ptr = this.getValueI32(ptrptr);

        // Length is 12 bytes up
        var len = this.getValueI32(ptr + 12);

        // Actual element ptrs begin at 16, then
        // each array entry is a 32-bit pointer to a DotNetValue
        let arr: Array<any> = new Array<any>(len);
        for (let i: number = 0; i < len; i++)
        {
            var itemPtr = this.getValueI32(ptr + 16 + i * 4);
            arr[i] = this.getDotNetValue(itemPtr);
        }

        return arr;
    }

    private MakeMethodKey(assembly: string, className: string, methodName: string): string
    {
        return `[${assembly}] ${className}:${methodName}`;
    }

    private getDotNetValue(valuePtr: number): any
    {
        valuePtr += 8;  // C# class data is 8 bytes off from address
        var type = this.getValueI32(valuePtr) as ModelValueType;
        switch (type)
        {
            case ModelValueType.None:
                return undefined;
            case ModelValueType.String:
                return this.getStringValue(valuePtr + 8);
            case ModelValueType.ObjectHandle:
                var index = this.getValueI32(valuePtr + 16);
                return new ModelObjectReference(index);
            case ModelValueType.Collection:
                return this.getArrayValue(valuePtr + 24);
            case ModelValueType.Int:
                return this.getValueI32(valuePtr + 16);            
        }
        return undefined;
    }

    private static readonly c_ServerAssembly: string = "Antimatter.Net.Webassembly";
    private static readonly c_ServerType: string = "Antimatter.Net.Webassembly.WebassemblyServer";
    private _cachedMethods: Map<string, any> = new Map<string, any>();
    private _bindMethod: any;
    private _executeICommandMethod: any;
    private _updateSourceValueMethod: any;

    //#endregion
}