// https://github.com/dotnet/runtime/blob/360df71eadde0d1394ee7b89693f83913f75575d/src/mono/wasm/runtime/binding_support.js

import { Pointer, System_String, System_Array, System_Object } from './Platform';

// Mono uses this global to hang various debugging-related items on

declare interface MONO
{
    loaded_files: string[];
    mono_wasm_runtime_ready(): void;
    mono_wasm_setenv(name: string, value: string): void;
    mono_wasm_load_data_archive(data: Uint8Array, prefix: string): void;
    mono_wasm_load_bytes_into_heap(data: Uint8Array): Pointer;
    mono_wasm_load_icu_data(heapAddress: Pointer): boolean;
}

// Mono uses this global to hold low-level interop APIs
declare interface BINDING
{
    mono_obj_array_new(length: number): System_Array<System_Object>;
    mono_obj_array_set(array: System_Array<System_Object>, index: Number, value: System_Object): void;
    js_string_to_mono_string(jsString: string): System_String;
    js_typed_array_to_array(array: Uint8Array): System_Object;
    js_to_mono_obj(jsObject: any): System_Object;
    mono_array_to_js_array<TInput, TOutput>(array: System_Array<TInput>): Array<TOutput>;
    conv_string(dotnetString: System_String | null): string | null;

    /*
        signature is a string with one character per parameter that tells how to marshal it, here are the valid values:
        i: int32
        l: int64
        f: float
        d: double
        s: string
        o: js object will be converted to a C# object (this will box numbers/bool/promises)
        m: raw mono object. Don't use it unless you know what you're doing
        additionally you can append 'm' to args_marshal beyond `args.length` if you don't want the return value marshaled
        */
    bind_static_method(fqn: string, signature?: string): Function;

    call_assembly_entry_point(assemblyName: string, args: any[], signature: any): Promise<any>;
    unbox_mono_obj(object: System_Object): any;
}

declare global
{
    var MONO: MONO;
    var BINDING: BINDING;
}
