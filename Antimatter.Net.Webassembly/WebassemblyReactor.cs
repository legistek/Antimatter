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
    public class WebassemblyReactor : IClient
    {
        private static RecyclingDictionary<Action<ModelValueType, object>> _callbacks = new RecyclingDictionary<Action<ModelValueType, object>>();

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

        Task<ClientFile> IClient.SelectFileAsync(string acceptList)
        {
            var task = this.RegisterTaskCallback<ClientFile>(true, out var handle);
            JS.InvokeUnmarshalled<string, int, object, object>(
                "window.AntimatterServer.SelectFileAsync",
                $"[\"{acceptList}\"]",
                handle,
                null);
            return task;
        }

        Task<byte[]> IClient.ReadFileAsync(int fileHandle)
        {
            var task = this.RegisterTaskCallback<byte[]>(true, out var callback);
            JS.InvokeUnmarshalled<int, int, object, object>(
                "window.AntimatterServer.ReadFileAsync",
                fileHandle,
                callback,
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

        internal Task<T> RegisterTaskCallback<T>(bool oneTime, out int handle)
        {
            TaskCompletionSource<T> tcs = new TaskCompletionSource<T>();

            int callbackID = 0;
            callbackID = _callbacks.Add((type, result) =>
            {
                object finalValue = null;

                if ((WasmModelValueType)type == WasmModelValueType.MonoObject)
                {
                    finalValue = result;
                }
                else if (type == ModelValueType.JSON && result is string s)
                {
                    finalValue = JsonConvert.DeserializeObject<T>(s);
                }

                tcs.SetResult(finalValue is T ? (T)finalValue : default);
                if (oneTime)
                    _callbacks.Remove(callbackID);
            });

            handle = callbackID;

            return tcs.Task;
        }

        #region Invoked by Client

        [AMXClientInvocable]
        public static void ExecuteCallbackReturnBuffer(int callbackID, byte[] value)
        {
            if (!_callbacks.TryGetValue(callbackID, out var callback))
                return;

            //byte[] buf = new byte[length];
            //Marshal.Copy(value, buf, 0, length);

            callback((ModelValueType)WasmModelValueType.MonoObject, value);
        }

        [AMXClientInvocable]
        public static void ExecuteCallback(int callbackID, int type, object value)
        {            
            if (!_callbacks.TryGetValue(callbackID, out var callback))
                return;
            callback((ModelValueType)type, value);
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
    }
}