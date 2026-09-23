import { Antimatter } from "./Antimatter";
import { BindingExpression } from "./BindingExpression";
import { ModelObjectReference } from "./ModelObjectReference";

import { IServer } from "./IServer";
import { ModelValue, ModelValueType } from "./ModelValue";
import { Utilities } from "./Utilities";
import { ICollectionUpdate, NotifyCollectionChangedAction } from "./ICollectionUpdate";

import { IClientFile } from "./IClientFile";
import { BindingMode } from "./BindingParameters";
import { UploadFileArgs } from "./UploadFileArgs";
import { Rect, Size } from "./Foundation";

import { EmscriptenModule } from "./Mono/dotnet";
import { MonoObject, MonoString } from "./Mono/dotnet-legacy";
import * as Mono from './Mono/dotnet';
//import * as Module from "module";

//const maxSafeNumberHighPart: bigint = BigInt(Math.pow(2, 21) - 1); // The high-order int32 from Number.MAX_SAFE_INTEGER
//const uint64HighOrderShift: bigint = BigInt(Math.pow(2, 32));

const c_bool1Offset = 2;
const c_shortOffset = 2;
const c_handleOffset = 4;
const c_intOffset = 4;
const c_floatOffset = 4;
const c_guidOffset = 4;
const c_float2Offset = 8;
const c_doubleOffset = 8;
const c_int2Offset = 8;
const c_float3Offset = 12;
const c_int3Offset = 12;
const c_double2Offset = 12;
const c_float4Offset = 16;
const c_int4Offset = 16;
const c_stringOffset = 20;
const c_arrayOffset = 20;

const js_owned_gc_handle = Symbol.for("wasm js_owned_gc_handle");

export class WebassemblyServer implements IServer
{
    private _startupResolver?: ((value: void) => void) = undefined;
    private _exports: any;

    DownloadUrl(url: string, fileName: string | null | undefined)
    {
        var link = document.createElement("a");
        link.setAttribute('download', fileName || 'file');
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    public async StartupAsync(): Promise<void>
    {
        if ((window as any).ServerStarted)
        {
            console.log("Server started before Client");
            //return Promise.resolve();
            return;
        }
        
        localStorage.setItem('lastActivity', (new Date()).getTime().toString());
        localStorage.setItem('forceLogout', 'false');
        window.addEventListener("storage", (event) =>
        {
            if (event.storageArea != localStorage)
                return;
            if (event.key === 'forceLogout' && localStorage.getItem(event.key) === 'true')
                this.OnForceLogout();
        });

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

    async GetRootObject(objectid: string): Promise<ModelObjectReference>
    {
        this._exports = await this.DotNetRuntime.getAssemblyExports("Antimatter.Net.Webassembly");

        var handle = this.CallStaticMethod(
            WebassemblyServer.c_ServerAssembly,
            WebassemblyServer.c_ServerType,
            "GetRootObject",
            objectid);
        return Promise.resolve(new ModelObjectReference(handle, objectid));
    }

    private _lastRefresh: number = 0;

    OnUserActivity(silent?: boolean)
    {
        var act = (new Date()).getTime();
        localStorage.setItem('lastActivity', act.toString());
        if (silent)
            // Model is informing us that it knows of a non-idle event that
            // we don't, so we can just update our lastRefresh time to reflect this
            this._lastRefresh = act;
        else if (act > this._lastRefresh + 120000)
        {
            // inform model only if it's been more than 2 minutes
            this.NotifyModelOfUserActivity();
            this._lastRefresh = act;
        }
    }

    private NotifyModelOfUserActivity()
    {
        this._exports.Antimatter.Net.Webassembly.WebassemblyReactor.NotifyUserNotIdle();
    }

    OnForceLogout(): void
    {
        this._exports.Antimatter.Net.Webassembly.WebassemblyReactor.OnForceLogout();
    }

    ExecuteICommand(netRef: ModelObjectReference, parameter?: any): Promise<void>
    {
        let ptr: number = 0;
        if (parameter !== null && parameter !== undefined)
        {
            parameter = ModelValue.Get(parameter);
            ptr = this.createManagedModelValue(parameter) as any as number;
            if (!ptr)
                return Promise.reject();
        }

        Antimatter._client.BeginBatchingUpdates();
        this._exports.Antimatter.Net.Webassembly
            .WebassemblyReactor
            .ExecuteICommandUnmarshalled(netRef.Handle, ptr);
        Antimatter._client.EndBatchingUpdates();
        
        return Promise.resolve();
    }

    InvokeBeforeClose(): boolean
    {
        return this._exports.Antimatter
            .Net.Webassembly
            .WebassemblyReactor
            .InvokeBeforeClose() as boolean;
    }

    ParseLocallyFormattedDate(date: string): Date
    {
        var dateNum = this._exports.Antimatter.Net.Webassembly.WebassemblyReactor
            .ParseLocallyFormattedDate(date) as number;
        return Utilities.DateFromTicks(dateNum);
    }

    InvokeModelObjectMethod(netRef: ModelObjectReference | number, method: string, args?: any[]): any
    {
        if (args)
            args = args.map((arg) => ModelValue.Get(arg));

        var ptrptr = this._exports
            .Antimatter
            .Net
            .Webassembly
            .WebassemblyReactor
            .InvokeModelObjectMethod(
                typeof (netRef) === 'number' ? netRef : netRef.Handle,
                method,
                args
                    ? JSON.stringify(args)
                    : null);

        if (ptrptr)
        {
            var valuePtr = ptrptr;
            var type = this.getValueI16(valuePtr + 8) as ModelValueType;
            var val = this.getModelValue(valuePtr, type);
            return val;
        }
        else
        {
            return undefined;
        }
    }

    Bind(ref: ModelObjectReference, path: string, expression: BindingExpression)
    {
        if (ref === undefined)
            return;

        try
        {
            this._exports.Antimatter.Net.Webassembly.WebassemblyReactor.Bind(
                ref.Handle,
                path ? path : null,
                expression.Index,
                expression.Parameters?.Mode || BindingMode.OneWay,
                expression.Parameters?.MarshalValue || false,
                expression.Parameters?.ModelSideConverter ? expression.Parameters?.ModelSideConverter : null);
        }
        catch (e)
        {
            console.error(`Binding failed: ${e}`);
        }
    }

    Unbind(bx: BindingExpression)
    {
        this._exports.Antimatter.Net.Webassembly.WebassemblyReactor.Unbind(bx.Index);
    }

    GetCollectionMembers(handle: number, offset: number, count: number)
    {
        var ptrptr = // this._getCollectionMembers(handle, offset, count);
            this._exports.Antimatter
                .Net
                .Webassembly
                .WebassemblyReactor
                .GetCollectionMembers(handle, offset, count);
        var val = this.getArrayValue(ptrptr as number, true);
        return val;
    }

    GetCollectionSize(handle: number): number
    {
        return this._exports.Antimatter.Net
            .Webassembly
            .WebassemblyReactor
            .GetCollectionSize(handle);
    }

    UpdateBindingSource(bxIndex: number, value: any)
    {
        var ptr = this.createManagedModelValue(ModelValue.Get(value));
        this._exports.Antimatter.Net
            .Webassembly
            .WebassemblyReactor
            .UpdateBindingSourceUnmarshalled(bxIndex, ptr);        
    }

    UpdateBoundCollection(bxIndex: number, value: ICollectionUpdate)
    {
        this._exports.Antimatter.Net.Webassembly
            .WebassemblyReactor
            .UpdateBoundCollection(
                bxIndex,
                JSON.stringify(value));
    }

    CreateModelValue(type: ModelValueType, collectionMembers: number): MonoObject
    {
        return this._exports
            .Antimatter
            .Net
            .Webassembly
            .WebassemblyReactor
            .CreateModelValue(type, collectionMembers);
    }
        
    ExecuteCallbackJson(callback: number, jsonValue: string | null)
    {
        this._exports.Antimatter
            .Net
            .Webassembly
            .WebassemblyReactor
            .ExecuteCallbackJson(
                callback,
                jsonValue);
    }

    ExecuteCallbackBytes(callback: number, data: number, dataLen: number)
    {
        this._exports.Antimatter
            .Net
            .Webassembly
            .WebassemblyReactor
            .ExecuteCallbackBytes(
                callback,
                data,
                dataLen);
    }

    ExecuteCallbackException(callback: number, exception: string)
    {
        this._exports.Antimatter.Net.Webassembly.WebassemblyReactor
            .ExecuteCallbackException(
                callback,
                exception);
    }

    AddRef(handle: number)
    {
        this._exports.Antimatter.Net
            .Webassembly
            .WebassemblyReactor
            .AddRef(handle);
    }

    ReleaseRef(handle: number)
    {
        this._exports.Antimatter.Net
            .Webassembly
            .WebassemblyReactor
            .ReleaseRef(handle);
    }

    //#endregion

    //#region Server-Invocable Methods

    public GetIsMobile(): boolean
    {
        return Utilities.IsMobile();
    }

    public InvokeClientMethod(id: string, argsString: string): string|null
    {        
        if (!id)
            return null;
        var func = eval(id);
        if (!func || typeof func !== "function")
            return null;        
        if (!argsString)
            return null;
        var finalArgs = JSON.parse(argsString);
        var result = func(finalArgs);
        if (!result)
            return null;

        var mv = ModelValue.Get(result);
        var jsonResult = JSON.stringify(mv);
        return jsonResult;
    }

    private ResolveExpression(path: string): any
    {
        const parts = path.split('.');
        const name = parts.pop() as any;
        const receiver = parts.reduce((o, p) => o[p], globalThis);
        return receiver[name]?.bind(receiver);
    }

    public async InvokeClientMethodRawAsync(id: string, argsString: string, callback: number)
    {
        if (!callback)
            return; // can't do anything

        if (!id)
        {
            this.ExecuteCallbackException(callback, `Invalid identifier`);
            return;
        }

        var func = this.ResolveExpression(id);
        if (!func || typeof func !== "function")
        {
            this.ExecuteCallbackException(callback, `Invalid identifier ${id}`);
            return;
        }

        if (!argsString)
            return;
        var finalArgs = JSON.parse(argsString);

        let trueRetVal: any;
        try
        {
            var retVal = func(finalArgs);
            if (retVal instanceof Promise)
            {
                trueRetVal = await retVal;
            }
            else
            {
                trueRetVal = retVal;
            }
        }
        catch (error: any)
        {
            this.ExecuteCallbackException(callback, error?.toString());
        }

        this.ExecuteCallbackJson(
            callback,
            JSON.stringify(trueRetVal));
    }

    public async InvokeClientMethodAsync(id: string, argsString: string, callback: number)
    {
        if (!callback)
            return; // can't do anything

        if (!id)
        {
            this.ExecuteCallbackException(callback, `Invalid identifier`);
            return;
        }

        var func = eval(id);
        if (!func || typeof func !== "function")
        {
            this.ExecuteCallbackException(callback, `Invalid identifier ${id}`);
            return;
        }

        if (!argsString)
            return;
        var finalArgs = JSON.parse(argsString);

        let trueRetVal: any;
        try
        {
            var retVal = func(finalArgs);
            if (retVal instanceof Promise)
            {
                trueRetVal = await retVal;
            }
            else
            {
                trueRetVal = retVal;
            }
        }
        catch (error: any)
        {
            this.ExecuteCallbackException(callback, error?.toString());
        }

        this.ExecuteCallbackJson(
            callback,
            JSON.stringify(ModelValue.Get(trueRetVal)));
    }

    public UploadFileAsync(args: UploadFileArgs): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            if (!args ||
                !args.Method ||
                !args.Url ||
                args.FileHandle === undefined ||
                args.Start === undefined ||
                args.Length === undefined)
            {
                reject("Argument(s) must be defined");
                return;
            }

            var file = Antimatter.GetFile(args.FileHandle);
            if (!file)
            {
                reject("Invalid file handle");
                return;
            }

            var request = new XMLHttpRequest();
            request.open(args.Method || "PUT", args.Url);
            var entries = Object.entries(args.Headers);
            request.withCredentials = true;
            request.onload = (e) =>
            {
                if (request.status >= 400)
                    reject(request.response?.toString());
                resolve();
            };
            request.onerror = (e) =>
            {
                reject(request.statusText);
            };

            for (const entry of entries)
                request.setRequestHeader(entry[0], entry[1]);

            var blob = file.slice(args.Start, args.Start + args.Length, "application/octet-stream");
            request.send(blob);
        });
    }

    public async ReadFileAsync(args: any)
    {
        //var argsString = this.Binding.conv_string(args) as string;
        //var trueArgs = JSON.parse(argsString);

        var file = Antimatter.GetFile(args.fileHandle);
        if (!file)
            return;

        try
        {
            var blob = file.slice(args.start, args.start + args.length);
            var buf = await blob.arrayBuffer();            
            var readBytes = new Uint8Array(buf);

            var wasmPtr = this.DotNetRuntime.Module._malloc(readBytes.length) as any;            
            var wasmMemView = this.DotNetRuntime.localHeapViewU8().subarray(wasmPtr, wasmPtr + readBytes.length);
            wasmMemView?.set(readBytes);
            
            this.ExecuteCallbackBytes(
                args.callback,
                wasmPtr,
                readBytes.length);

            this.DotNetRuntime.Module._free(wasmPtr);
        }
        catch (e)
        {
            console.log(e);
        }
    }

    public async TriggerLocalDownload(filename: string, data: Uint8Array)
    {
        const blob = new Blob([data as any], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
    }

    public async SelectFileAsync(list: string, callback: number, allowMultiple: boolean)
    {        
        var input = document.createElement("input");

        input.type = "file";
        input.accept = list;
        input.multiple = allowMultiple;

        var hasSelected: boolean = false;

        var cancelDetector = (async () =>
        {
            document.removeEventListener("mousemove", cancelDetector);

            // Sometimes on a genuine selection the mousemove event for the doc fires
            // before onchange for the input. So wait for a blip to see if there was
            // a legit selection.
            await Utilities.SleepAsync(100);
            if (hasSelected)
                return;            
            this.ExecuteCallbackJson(
                callback,
                JSON.stringify(ModelValue.Get([])));
        }).bind(this);

        input.onchange = ((e) =>
        {
            hasSelected = true;
            document.removeEventListener("mousemove", cancelDetector);
            var modelFiles: IClientFile[] = [];

            var files = input.files;
            if (files && files.length > 0)
            {
                for (let i = 0; i < files.length; i++)
                {
                    var file = files.item(i);
                    if (!file)
                        continue;
                    var modelFile = Antimatter.HoldFile(file);
                    modelFiles.push(modelFile);
                }
            }

            this.ExecuteCallbackJson(
                callback,
                JSON.stringify(ModelValue.Get(files)));
        }).bind(this);

        input.click();

        // ensure the modal has actually opened before the cancel detector is attached
        await Utilities.SleepAsync(100);

        document.addEventListener("mousemove", cancelDetector);
    }

    public OnUpdateBoundCollection(bxIndex: number, valuePtr: number)
    {
        valuePtr = this.getValueI32(valuePtr);  // deref
        valuePtr += 8;
        let update: ICollectionUpdate = {
            Action: this.getValueI32(valuePtr + 0) as NotifyCollectionChangedAction,
            Index: this.getValueI32(valuePtr + 4),
            Count: this.getValueI32(valuePtr + 8),
            Items: this.getArrayValue(valuePtr + 12)
        };
        BindingExpression.OnModelBoundCollectionChanged(bxIndex, update);
    }

    public UpdateBinding(bxIndex: number, valuePtr: number)
    {
        valuePtr = this.getValueI32(valuePtr);  // deref
        var type = this.getValueI16(valuePtr + 8) as ModelValueType;
        var value = this.getModelValue(valuePtr, type);
        BindingExpression.OnModelValueChanged(bxIndex, value, type);
    }

    public CopyToClipboard(valuePtr: number, mimeTypeString: string)
    {
        valuePtr = this.getValueI32(valuePtr);  // deref
        var type = this.getValueI16(valuePtr + 8) as ModelValueType;
        var value = this.getModelValue(valuePtr, type);
        if (value)
        {
            var r = new Uint8Array(value);
            var data = [
                new ClipboardItem({
                    [mimeTypeString]: new Blob([r.buffer],
                        {
                            type: mimeTypeString
                        }) as any,
                })
            ];
            navigator.clipboard.write(data);
        }
    }

    public NavigateTo(route: string, hard: boolean)
    {
        Antimatter._client.NavigateTo(route, hard);
    }

    public OpenPopup(route: string, mini: boolean, urlOnPopupClose: string)
    {
        Antimatter._client.OpenPopup(route, mini, urlOnPopupClose);
    }

    //#endregion

    //#region Private Members

    private MonoStringToJSString(monoString: MonoString): string
    {
        return this.DotNetRuntime.INTERNAL
            .monoStringToStringUnsafe(monoString) as string;
    }

    private setManagedModelValue(
        // The root pointer from C# &_tempModelValue
        rootPointer: number,
        // The raw mono data of the target object, after the +8 offset
        rawMonoData: number,
        // JS object
        mv: ModelValue,
        // For populating collection items (non-nested only!); -1 means populate root only,
        // in case we have to call back into C#
        collectionIndex: number)
    {
        this.setValueI16(rawMonoData, mv.Type as number);

        switch (mv.Type)
        {
            case ModelValueType.Null:
                break;
            case ModelValueType.Bool:
                this.setValue8(rawMonoData + c_bool1Offset, mv.BoolValue ? 1 : 0);
                break;
            case ModelValueType.Float:
                this.setValueFloat(rawMonoData + c_floatOffset, mv.FloatValue || 0);
                break;
            case ModelValueType.Int:
                this.setValueI32(rawMonoData + c_intOffset, mv.IntValue || 0);
                break;
            case ModelValueType.ObjectHandle:
                this.setValueI32(rawMonoData + c_handleOffset, mv.ObjectHandle || 0);
                break;
            case ModelValueType.String:
            case ModelValueType.ValidationError:
            case ModelValueType.MarshalledObject:
            case ModelValueType.ClientFile:
                this._exports.Antimatter.Net.Webassembly
                    .WebassemblyReactor
                    .SetStringModelValue(rootPointer, mv.StringValue, collectionIndex);
                break;
            case ModelValueType.Collection:
                if (mv.ObjectHandle !== undefined)
                    this.setValueI32(rawMonoData + c_handleOffset, mv.ObjectHandle);
                if (mv.Collection)
                    this.setArrayValue(rootPointer, rawMonoData + c_arrayOffset, mv.Collection);
                break;
            case ModelValueType.DateTime:
                this.setValueDouble(rawMonoData + c_doubleOffset, mv.DoubleValue || 0);
                break;
            case ModelValueType.Size:
                this.setValueFloat(rawMonoData + c_floatOffset, mv.FloatValue || 0);
                this.setValueFloat(rawMonoData + c_float2Offset, mv.FloatValue2 || 0);
                break;
            case ModelValueType.Rect:
                this.setValueFloat(rawMonoData + c_floatOffset, mv.FloatValue || 0);
                this.setValueFloat(rawMonoData + c_float2Offset, mv.FloatValue2 || 0);
                this.setValueFloat(rawMonoData + c_float3Offset, mv.FloatValue3 || 0);
                this.setValueFloat(rawMonoData + c_float4Offset, mv.FloatValue4 || 0);
                break;
            case ModelValueType.MultimediaEvent:
                this.setValueI16(rawMonoData + c_shortOffset, mv.ShortValue || 0);
                this.setValueDouble(rawMonoData + c_doubleOffset, mv.DoubleValue || 0);
                this.setValueI32(rawMonoData + c_intOffset, mv.IntValue || 0);
                this.setValueI32(rawMonoData + c_int4Offset, mv.FloatValue4 || 0);
                break;
        }
    }

    private createManagedModelValue(mv: ModelValue): MonoObject|undefined
    {        
        var rootPtr = this.CreateModelValue(
            mv.Type || ModelValueType.Null,
            !mv.ObjectHandle ? mv.Collection?.length || 0 : 0);
        var rawMonoData = this.getValueI32(rootPtr) + 8;        
        var checkType = this.getValueI16(rawMonoData);
        if (checkType != mv.Type)
        {
            console.error('{EB32B881-C506-4C66-A9E4-396B1B0491E6} .NET Interop Failure at createManagedModelValue');
            return undefined;
        }
        this.setManagedModelValue(rootPtr as any, rawMonoData, mv, -1);
        return rootPtr;
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
                return this.getStringValue(valuePtr + c_stringOffset);
            case ModelValueType.MarshalledObject:
                let s: string = this.getStringValue(valuePtr + c_stringOffset);
                return JSON.parse(s);
            case ModelValueType.CollectionReference:
                var index = this.getValueI32(valuePtr + c_handleOffset);
                var key = this.getStringValue(valuePtr + c_stringOffset);
                return new ModelObjectReference(index, key);
            case ModelValueType.ObjectHandle:
                var index = this.getValueI32(valuePtr + c_handleOffset);
                var key = this.getStringValue(valuePtr + c_stringOffset);
                return new ModelObjectReference(index, key);
            case ModelValueType.Bool:
                return this.getValue8(valuePtr + c_bool1Offset) !== 0;
            case ModelValueType.Float:
                return this.getValueFloat(valuePtr + c_floatOffset);
            case ModelValueType.Double:
                return this.getValueDouble(valuePtr + c_doubleOffset);
            case ModelValueType.Int:
                return this.getValueI32(valuePtr + c_intOffset);
            case ModelValueType.Collection:
                var handle = this.getValueI32(valuePtr + c_handleOffset);
                var array = this.getArrayValue(valuePtr + c_arrayOffset);
                (array as any).AMXModelObjectHandle = handle;
                return array;
            case ModelValueType.Guid:
                var guid = this.getValueGuid(valuePtr + c_guidOffset);
                return guid;
            case ModelValueType.DateTime:
                return Utilities.DateFromTicks(this.getValueDouble(valuePtr + c_doubleOffset));
            case ModelValueType.TimeSpan:
                return this.getValueDouble(valuePtr + c_doubleOffset);
            case ModelValueType.Size:
                var width = this.getValueFloat(valuePtr + c_floatOffset);
                var height = this.getValueFloat(valuePtr + c_float2Offset);
                return new Size(width, height);
            case ModelValueType.Rect:
                var x = this.getValueFloat(valuePtr + c_floatOffset);
                var y = this.getValueFloat(valuePtr + c_float2Offset);
                var width = this.getValueFloat(valuePtr + c_float3Offset);
                var height = this.getValueFloat(valuePtr + c_float4Offset);
                return new Rect(x, y, width, height);
        }
        return undefined;
    }

    CallStaticMethod(assembly: string, className: string, methodName: string, ...parameters: any[]): any
    {
        return this._exports.Antimatter
            .Net
            .Webassembly
            .WebassemblyReactor[methodName](...parameters);
    }

    get Module(): EmscriptenModule
    {
        return this.DotNetRuntime.Module as EmscriptenModule;
    }

    get DotNetRuntime(): Mono.RuntimeAPI
    {
        return (window as any).Blazor.runtime as Mono.RuntimeAPI;
    }

    getStringValue(ptr: number | MonoString): string
    {
        const fieldValue = this.getValueI32(ptr);

        if (fieldValue === 0)
            return '';
        return this.MonoStringToJSString(fieldValue as any);
    }    

    getValue8(ptr: number)
    {
        return this.DotNetRuntime.getHeapU8(ptr as any);
    }
    setValue8(ptr: number, value: number)
    {
        this.DotNetRuntime.setHeapU8(ptr as any, value);
    }

    getValueI16(ptr: number)
    {
        return this.DotNetRuntime.getHeapI16(ptr as any);
    }
    setValueI16(ptr: number, value: number)
    {
        this.DotNetRuntime.setHeapI16(ptr as any, value);
    }

    getValueI32(ptr: number | MonoObject)
    {
        return this.DotNetRuntime.getHeapI32(ptr as any);
    }
    setValueI32(ptr: number, value: number)
    {
        this.DotNetRuntime.setHeapI32(ptr as any, value);
    }

    getValueGuid(ptr: number)
    {
        //    Guid: 35918bc9-196d-40ea-9779-889d79b753f0
        //    C9 8B 91 35    6D 19    EA 40    97 79    88 9D 79 B7 53 F0

        const guid: string = `${(this.Module as any).HEAPU8[ptr + 3].toString(16).padStart(2, '0')}${(this.Module as any).HEAPU8[ptr + 2].toString(16).padStart(2, '0')}${(this.Module as any).HEAPU8[ptr + 1].toString(16).padStart(2, '0')}${(this.Module as any).HEAPU8[ptr + 0].toString(16).padStart(2, '0')}-`
            + `${(this.Module as any).HEAPU8[ptr + 5].toString(16).padStart(2, '0')}${(this.Module as any).HEAPU8[ptr + 4].toString(16).padStart(2, '0')}-`
            + `${(this.Module as any).HEAPU8[ptr + 7].toString(16).padStart(2, '0')}${(this.Module as any).HEAPU8[ptr + 6].toString(16).padStart(2, '0')}-`
            + `${(this.Module as any).HEAPU8[ptr + 8].toString(16).padStart(2, '0')}${(this.Module as any).HEAPU8[ptr + 9].toString(16).padStart(2, '0')}-`
            + `${(this.Module as any).HEAPU8[ptr + 10].toString(16).padStart(2, '0')}${(this.Module as any).HEAPU8[ptr + 11].toString(16).padStart(2, '0')}`
            + `${(this.Module as any).HEAPU8[ptr + 12].toString(16).padStart(2, '0')}${(this.Module as any).HEAPU8[ptr + 13].toString(16).padStart(2, '0')}`
            + `${(this.Module as any).HEAPU8[ptr + 14].toString(16).padStart(2, '0')}${(this.Module as any).HEAPU8[ptr + 15].toString(16).padStart(2, '0')}`

        return guid;
    }

    getValueFloat(ptr: number)
    {
        return this.DotNetRuntime.getHeapF32(ptr as any);
    }
    setValueFloat(ptr: number, value: number)
    {
        this.DotNetRuntime.setHeapF32(ptr as any, value);
    }

    getValueDouble(ptr: number)
    {
        return this.DotNetRuntime.getHeapF64(ptr as any);
    }
    setValueDouble(ptr: number, value: number)
    {
        this.DotNetRuntime.setHeapF64(ptr as any, value);
    }

    getArrayValue(ppArray: number, direct?: boolean)
    {
        if (!direct)
            // Where the array's actual data is
            ppArray = this.getValueI32(ppArray);

        // Length is 12 bytes up
        var len = this.getValueI32(ppArray + 12);

        // Actual element ptrs begin at 16, then
        // each array entry is a 32-bit pointer to a DotNetValue
        let arr: Array<any> = new Array<any>(len);
        for (let i: number = 0; i < len; i++)
        {
            var itemPtr = this.getValueI32(ppArray + 16 + i * 4);
            var type = this.getValueI32(itemPtr + 8) as ModelValueType;
            arr[i] = this.getModelValue(itemPtr, type);
        }

        return arr;
    }
    // We are assuming the array has already been allocated on the C# side
    setArrayValue(rootPointer: number, ppArray: number, values: ModelValue[])
    {        
        var pArrayLen = this.getValueI32(ppArray) + 12;
        var arraySize = this.getValueI32(pArrayLen);
        var pArray = this.getValueI32(ppArray) + 16;
        
        if (arraySize < values.length)
        {
            console.error("{B2A8672C-3ABB-43B5-9E1B-99FC36662EC3} .NET managed array too small for model values");
            return;
        }

        for (let i = 0; i < values.length; i++)
        {
            var rawMonoData = this.getValueI32(pArray + i * 4) + 8;            
            var mv = values[i];
            if (mv.Type == ModelValueType.Collection)
            {
                console.error("{EF471968-12DE-4346-A657-5DD6C448F252} Cannot have nested collection ModelValue types ");
                return;
            }
            this.setManagedModelValue(rootPointer, rawMonoData, values[i], i);
        }        
    }

    MakeMethodKey(assembly: string, className: string, methodName: string): string
    {
        return `[${assembly}] ${className}:${methodName}`;
    }

    static readonly c_ServerAssembly: string = "Antimatter.Net.Webassembly";
    static readonly c_ServerType: string = "Antimatter.Net.Webassembly.WebassemblyReactor";               

    //#endregion
}