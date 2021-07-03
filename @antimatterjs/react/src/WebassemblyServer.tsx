import { Antimatter } from "./Antimatter";
import { BindingExpression } from "./BindingExpression";
import { ModelObjectReference } from "./ModelObjectReference";

import { IServer } from "./IServer";
import { ModelValue, ModelValueType } from "./ModelValue";
import { Utilities } from "./Utilities";

//const maxSafeNumberHighPart: bigint = BigInt(Math.pow(2, 21) - 1); // The high-order int32 from Number.MAX_SAFE_INTEGER
//const uint64HighOrderShift: bigint = BigInt(Math.pow(2, 32));

export class WebassemblyServer implements IServer
{
    private _startupResolver?: ((value: void) => void) = undefined;

    StartupAsync(): Promise<void>
    {
        if ((window as any).ServerStarted)
        {
            console.log("Server started before Client");
            return Promise.resolve();
        }

        return new Promise((resolve, reject) =>
        {
            this._startupResolver = resolve;
        });
    }

    //#region Client-Invocable Methods

    OnServerStartup()
    {
        console.log("Client started before server");
        if (this._startupResolver)
            this._startupResolver();
    }

    GetRootObject(objectid: string): Promise<ModelObjectReference>
    {       
        var handle = this.CallStaticMethod(
            WebassemblyServer.c_ServerAssembly,
            WebassemblyServer.c_ServerType,
            "GetRootObject",
            objectid);
        return Promise.resolve(new ModelObjectReference(handle, objectid));
    }

    ExecuteICommand(netRef: ModelObjectReference, parameter?: ModelValue) : Promise<void>
    {
        if (!this._executeICommandMethod)
        {
            this._executeICommandMethod = this.Module.mono_bind_static_method(
                this.MakeMethodKey(
                    WebassemblyServer.c_ServerAssembly,
                    WebassemblyServer.c_ServerType,
                    "ExecuteICommand"));
        }
        this._executeICommandMethod(
            netRef.Handle,
            parameter
                ? JSON.stringify(parameter)
                : undefined);
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
        this._bindMethod(
            ref.Handle,
            path,
            expression.Index,
            expression.Parameters?.NotifyCollectionChanged || false,
            expression.Parameters?.MarshalValue || false
        );
    }

    Unbind(bx: BindingExpression)
    {
        if (!this._unbindMethod)
        {
            this._unbindMethod = this.Module.mono_bind_static_method(
                this.MakeMethodKey(
                    WebassemblyServer.c_ServerAssembly,
                    WebassemblyServer.c_ServerType,
                    "Unbind"));
        }
        this._unbindMethod(bx.Index);
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
        var type = this.getValueI32(valuePtr + 8) as ModelValueType;
        var value = this.getModelValue(valuePtr, type);        
        BindingExpression.OnExternalSourceValueChanged(bxIndex, value, type);
    }

    public NavigateTo(route: string)
    {
        Antimatter._client.NavigateTo(route);
    }

    //#endregion

    //#region Private Members

    CallStaticMethod(assembly: string, className: string, methodName: string, ...parameters: any[]): any
    {
        const methodKey = this.MakeMethodKey(assembly, className, methodName);
        let method: any = this._cachedMethods.get(methodKey);
        if (!method)
        {
            if (!this.Module.mono_bind_static_method)
                throw "how can this be?";
            method = this.Module.mono_bind_static_method(methodKey);
            if (method)
                this._cachedMethods.set(methodKey, method);
        }
        return method(...parameters);
    }

    get Module(): any
    {
        return (window as any).Module;
    }

    getStringValue(ptr: number): string
    {
        const fieldValue = this.getValueI32(ptr);

        if (fieldValue === 0)
        {
            return '';
        }

        return (window as any).BINDING.conv_string(fieldValue) as string;
    }

    getValueI16(ptr: number)
    {
        return this.Module.HEAP16[ptr >> 1];
    }

    getValueI32(ptr: number)
    {
        return this.Module.HEAP32[ptr >> 2];
    }

    getValueGuid(ptr: number)
    {
        //    Guid: 35918bc9-196d-40ea-9779-889d79b753f0
        //    C9 8B 91 35    6D 19    EA 40    97 79    88 9D 79 B7 53 F0

        const guid: string = `${this.Module.HEAP32[ptr + 3].toString(16)}${this.Module.HEAP32[ptr + 2].toString(16)}${this.Module.HEAP32[ptr + 1].toString(16)}${this.Module.HEAP32[ptr + 0].toString(16)}-`
            + `${this.Module.HEAP32[ptr + 5].toString(16)}${this.Module.HEAP32[ptr + 4].toString(16)}-`
            + `${this.Module.HEAP32[ptr + 7].toString(16)}${this.Module.HEAP32[ptr + 6].toString(16)}-`
            + `${this.Module.HEAP32[ptr + 8].toString(16)}${this.Module.HEAP32[ptr + 9].toString(16)}-`
            + `${this.Module.HEAP32[ptr + 10].toString(16)}${this.Module.HEAP32[ptr + 11].toString(16)}`
            + `${this.Module.HEAP32[ptr + 12].toString(16)}${this.Module.HEAP32[ptr + 13].toString(16)}`
            + `${this.Module.HEAP32[ptr + 14].toString(16)}${this.Module.HEAP32[ptr + 15].toString(16)}`
        
        return guid;
    }

    //getValueU64(ptr: number): bigint
    //{
    //    // There is no Module.HEAPU64, and Module.getValue(..., 'i64') doesn't work because the implementation
    //    // treats 'i64' as being the same as 'i32'. Also we must take care to read both halves as unsigned.
    //    const heapU32Index = ptr >> 2;        
    //    const highPart = BigInt(this.Module.HEAPU32[heapU32Index + 1]);
    //    //if (highPart > maxSafeNumberHighPart)
    //    //{
    //    //    throw new Error(`Cannot read uint64 with high order part ${highPart}, because the result would exceed Number.MAX_SAFE_INTEGER.`);
    //    //}

    //    return (highPart * uint64HighOrderShift) + BigInt(this.Module.HEAPU32[heapU32Index]);
    //}

    getValueFloat(ptr: number)
    {        
        return this.Module.HEAPF32[ptr >> 2];
    }

    getValueDouble(ptr: number)
    {
        var val = this.Module.getValue(ptr, 'double');
        return val;
    }

    getArrayValue(ptrptr: number)
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
            var type = this.getValueI32(itemPtr + 8) as ModelValueType;
            arr[i] = this.getModelValue(itemPtr, type);
        }

        return arr;
    }

    MakeMethodKey(assembly: string, className: string, methodName: string): string
    {
        return `[${assembly}] ${className}:${methodName}`;
    }

    getModelValue(valuePtr: number, type: ModelValueType): any
    {
        valuePtr += 8;  // C# class data is 8 bytes off from address        
        switch (type)
        {
            case ModelValueType.Null:
                return undefined;
            case ModelValueType.String:
            case ModelValueType.ValidationError:
                return this.getStringValue(valuePtr + 8);
            case ModelValueType.MarshalledObject:
                let s: string = this.getStringValue(valuePtr + 8);
                return JSON.parse(s);
            case ModelValueType.ObjectHandle:
                var index = this.getValueI32(valuePtr + 16);
                var key = this.getStringValue(valuePtr + 8);
                return new ModelObjectReference(index, key);
            case ModelValueType.Collection:
                return this.getArrayValue(valuePtr + 32);
            case ModelValueType.Float:
                return this.getValueFloat(valuePtr + 16);
            case ModelValueType.Int:
                return this.getValueI32(valuePtr + 16);
            case ModelValueType.Bool:
                return this.getValueI32(valuePtr + 16) !== 0;
            case ModelValueType.Guid:
                return this.getValueGuid(valuePtr + 16);
            case ModelValueType.DateTime:
                return Utilities.DateFromTicks(this.getValueDouble(valuePtr + 16));
        }
        return undefined;
    }

    static readonly c_ServerAssembly: string = "Antimatter.Net.Webassembly";
    static readonly c_ServerType: string = "Antimatter.Net.Webassembly.WebassemblyServer";
    _cachedMethods: Map<string, any> = new Map<string, any>();
    _bindMethod: any;
    _executeICommandMethod: any;
    _updateSourceValueMethod: any;
    _unbindMethod: any;

    //#endregion
}