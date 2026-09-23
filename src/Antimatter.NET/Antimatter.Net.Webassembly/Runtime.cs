
using Microsoft.JSInterop;
using Microsoft.JSInterop.WebAssembly;
using System;
using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using WebAssembly.JSInterop;

namespace Antimatter.Net.Webassembly
{    
    public static class JS
    {
        private static WasmJSRuntime _runtime;
        private static WasmJSRuntime Runtime => 
            _runtime ?? (_runtime = new WasmJSRuntime());

        public static string GetLocalStorage(string key)
        {
            string value = JS.InvokeJS("localStorage.getItem", $"[\"{key}\"]");
            if (string.IsNullOrEmpty(value) || value.Length < 2 || value[0] != '\"')
                return value;
            return value.Substring(1, value.Length - 2);
        }

        public static void SetLocalStorage(string key, string value)
        {
            JS.InvokeJS("localStorage.setItem", $"[\"{key}\", \"{value}\"]");
        }

        public static string InvokeJS(string identifier, string? argsJson)
        {
            try
            {
                return Runtime.InvokeJS(identifier, argsJson);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"exception {ex.Message}");
                return null;
            }
        }

        public static TResult InvokeUnmarshalled<T0, TResult>(string identifier, T0 arg0)
        {
            try
            {
                return Runtime.Invoke<TResult>(identifier, arg0);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"exception {ex.Message}");
                return default;
            }
        }

        public static TResult InvokeUnmarshalled<T0, T1, TResult>(string identifier, T0 arg0, T1 arg1)
        {
            try
            {
                return Runtime.Invoke<TResult>(identifier, arg0, arg1);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"exception {ex.Message}");
                return default;
            }
        }

        public static TResult InvokeUnmarshalled<T0, T1, T2, TResult>(string identifier, T0 arg0, T1 arg1, T2 arg2)
        {
            try
            {
                return Runtime.Invoke<TResult>(identifier, arg0, arg1, arg2);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"exception {ex.Message}");
                return default;
            }
        }

        private class WasmJSRuntime : WebAssemblyJSRuntime
        {
            public new string InvokeJS(string identifier, string? argsJson)
            {
                return base.InvokeJS(identifier, argsJson);
            }
        }
    }
}
