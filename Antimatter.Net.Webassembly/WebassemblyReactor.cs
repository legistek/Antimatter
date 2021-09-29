using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

namespace Antimatter.Net.Webassembly
{
    public delegate void JSCallback(object returnValue, string exception);

    public class WebassemblyReactor : IClient
    {                
        static WebassemblyReactor()
        {
            WebAssemblyHostBuilder.CreateDefault(); // need this to ensure dlls are included
            Reactor.Initialize(new WebassemblyReactor());
        }

        public static readonly Reactor Reactor = new Reactor(null);

        #region IClient Implementation

        Task IClient.StartupAsync()
        {
            JS.InvokeJS("window.OnServerStartup", null);
            return Task.CompletedTask;
        }

        object IClient.MarshalClientObject(Type desiredType, ModelValue clientValue)
        {
            if (clientValue.Type != ModelValueType.JSON ||
                string.IsNullOrEmpty(clientValue.StringValue))
                throw new Exception();
            return JsonConvert.DeserializeObject(clientValue.StringValue, desiredType);
        }

        Task<ClientFile[]> IClient.SelectFileAsync(string acceptList, bool allowMultiple)
        {                        
            JS.InvokeUnmarshalled<string, JSCallback, bool, object>(
                "window.AntimatterServer.SelectFileAsync",
                acceptList,
                CreateTaskCallback<ClientFile[]>(out Task<ClientFile[]> task, isModelValue: true),
                allowMultiple);
            return task;
        }

        Task<byte[]> IClient.ReadFileAsync(int fileHandle)
        {            
            JS.InvokeUnmarshalled<int, JSCallback, object, object>(
                "window.AntimatterServer.ReadFileAsync",
                fileHandle,
                CreateTaskCallback(out Task<byte[]> task),
                null);
            return task;
        }

        void IClient.UpdateBinding(string clientid, int bxIndex, ModelValue value)
        {
            JS.InvokeUnmarshalled<int, object, object, object>(
                "window.AntimatterServer.UpdateBinding",
                bxIndex,
                value,
                null);
        }

        void IClient.UpdateBoundCollection(string clinetID, int bxIndex, CollectionUpdate update)
        {
            JS.InvokeUnmarshalled<int, object, object, object>(
                "window.AntimatterServer.OnUpdateBoundCollection",
                bxIndex,
                update,
                null);
        }

        void IClient.NavigateTo(string clientid, string route)
        {
            JS.InvokeJS(
                "window.AntimatterServer.NavigateTo",
                $"[\"{route}\"]");
        }

        #endregion

        public ModelValue MarshalObject(object obj)
        {
            try
            {
                return new ModelValue
                {
                    Type = ModelValueType.JSON,
                    StringValue = JsonConvert.SerializeObject(obj)
                };
            }
            catch (Exception ex)
            {
                return ModelValue.Null;
            }
        }
        
        #region Invoked by Client

        [AMXClientInvocable]
        public static void ExecuteCallback(JSCallback callback, object value)
        {
            callback(value, null);
        }

        [AMXClientInvocable]
        public static void ExecuteCallbackException(JSCallback callback, string exception)
        {
            callback(null, exception);
        }

        [AMXClientInvocable]
        public static void Bind(int netRef, string path, int bxIndex, bool notifyCollectionChanged, bool marshalValue)
        {
            Reactor.Bind(netRef, path, bxIndex, notifyCollectionChanged, marshalValue);
        }

        [AMXClientInvocable]
        public static void Unbind(int bxIndex)
        {
            Reactor.Unbind(bxIndex);
        }

        [AMXClientInvocable]
        public static void UpdateBindingSource(int bxIndex, string valueJson)
        {
            var value = JsonConvert.DeserializeObject<ModelValue>(valueJson);
            Reactor.UpdateBindingSource(bxIndex, value);
        }

        [AMXClientInvocable]
        public static void UpdateBoundCollection(int bxIndex, string valueJson)
        {
            var value = JsonConvert.DeserializeObject<CollectionUpdate>(valueJson);
            Reactor.UpdateBoundCollection(bxIndex, value);
        }

        [AMXClientInvocable]
        public static int GetRootObject(string identifier)
        {
            return Reactor.GetRootObject(identifier);
        }

        [AMXClientInvocable]
        public static void ExecuteICommand(int netRef, string commandParameterJson)
        {
            ModelValue value = ModelValue.Null;
            if (!string.IsNullOrEmpty(commandParameterJson))
                value = JsonConvert.DeserializeObject<ModelValue>(commandParameterJson);
            Reactor.ExecuteICommand(netRef, value);
        }

        #endregion

        private JSCallback CreateTaskCallback<T>(out Task<T> task, bool isModelValue = false)
        {
            TaskCompletionSource<T> tcs = new TaskCompletionSource<T>();
            task = tcs.Task;
            return new JSCallback((value, exception) =>
            {
                if (!string.IsNullOrEmpty(exception))
                    tcs.SetException(new Exception(exception));
                else if (isModelValue)
                {
                    if (value is string s)
                    {
                        var modelValue = JsonConvert.DeserializeObject<ModelValue>(s);
                        var objValue = modelValue.Value(Reactor, typeof(T));
                        tcs.SetResult((T)objValue);
                    }
                    else
                        tcs.SetException(new Exception("Return value is not JSON string"));
                }
                else if (value is T typedValue)
                {
                    tcs.SetResult(typedValue);
                }
                else
                {
                    tcs.SetException(new Exception($"Return value is not expected type."));
                }
            });
        }
    }
}