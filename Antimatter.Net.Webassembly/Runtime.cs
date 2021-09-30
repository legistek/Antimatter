
using Microsoft.JSInterop;
using System;
using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using WebAssembly.JSInterop;

namespace Antimatter.Net.Webassembly
{    
    public static class JS
    {        
        public static string InvokeJS(string identifier, string? argsJson
            //, JSCallResultType resultType, long targetInstanceId
            )
        {
            var callInfo = new JSCallInfo
            {
                FunctionIdentifier = identifier,
                TargetInstanceId = 0,
                ResultType = JSCallResultType.Default,
                MarshalledCallArgsJson = argsJson ?? "[]",
                MarshalledCallAsyncHandle = default
            };

            var result = InternalCalls.InvokeJS<object, object, object, string>(out var exception, ref callInfo, null, null, null);

            if (exception != null)
            {
                Console.WriteLine($"exception {exception}");
            }

            return result;
        }

        public static void InvokeUnmarshalled(string identifier)
        {
            var callInfo = new JSCallInfo
            {
                FunctionIdentifier = identifier,
                TargetInstanceId = 0,
                ResultType = Microsoft.JSInterop.JSCallResultType.Default,
            };

            string exception;
            var result = InternalCalls.InvokeJS<object,object,object,object>(out exception, ref callInfo, null,null,null);

            if (exception != null)
            {
                Console.WriteLine($"exception {exception}");
            }
        }

        public static TResult InvokeUnmarshalled<T0, T1, T2, TResult>(string identifier, T0 arg0, T1 arg1, T2 arg2)
        {
            var callInfo = new JSCallInfo
            {
                FunctionIdentifier = identifier,
                TargetInstanceId = 0,
                ResultType = Microsoft.JSInterop.JSCallResultType.Default,
            };

            string exception;
            var result = InternalCalls.InvokeJS<T0, T1, T2, TResult>(out exception, ref callInfo, arg0, arg1, arg2);

            if (exception != null)
            {
                Console.WriteLine($"exception {exception}");
            }

            return result;
        }
    }
}
