using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using System.Globalization;
using System.Runtime.InteropServices.JavaScript;
using System.Runtime.CompilerServices;
using Antimatter.Net.Collections;

#pragma warning disable CS8500

namespace Antimatter.Net.Webassembly
{
    public delegate void JSCallback(object returnValue, string exception);

    public partial class WebassemblyReactor : IClient
    {                
        static WebassemblyReactor()
        {
            var builder = WebAssemblyHostBuilder.CreateDefault(); // need this to ensure dlls are included
            BaseAddress = builder.HostEnvironment.BaseAddress?.TrimEnd('/');
            Reactor.Initialize(new WebassemblyReactor());
        }

        public static string BaseAddress { get; private set; }

        public static readonly Reactor Reactor = new Reactor(null);

        #region IClient Implementation

        private static readonly DateTime UnixCanonicalTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);

        void IClient.ForceLogout()
        {
            JS.SetLocalStorage("forceLogout", "true");
        }

        void IClient.RecordUserActivity()
        {
            JS.InvokeUnmarshalled<bool,object>(
                "window.AntimatterServer.OnUserActivity",
                true);            
        }

        DateTime IClient.GetLastActivity()
        {
            var last = JS.GetLocalStorage("lastActivity");
            long.TryParse(last, out long lastNum);
            return UnixCanonicalTime.AddMilliseconds(lastNum).ToLocalTime();
        }

        /// <summary>
        /// Called by model servers to post data to the client's clipboard.
        /// </summary>
        unsafe void IClient.CopyToClipboard(ModelValue data, string mimeType)
        {
            JS.InvokeUnmarshalled<int, string, object, object>(
                "window.AntimatterServer.CopyToClipboard",
                (int)Unsafe.AsPointer(ref data),
                mimeType,
                null);
        }

        bool IClient.GetIsMobile()
        {
            var result = JS.InvokeJS("window.AntimatterServer.GetIsMobile", null);
            return result == "true";
        }

        ModelValue IClient.InvokeClientMethod(string identifier, object args)
        {
            var json = JsonConvert.SerializeObject(args);
            string jsonResult = JS.InvokeUnmarshalled<string, string, string>(
                "window.AntimatterServer.InvokeClientMethod",
                identifier, 
                json);
            if (string.IsNullOrEmpty(jsonResult))
                return ModelValue.Null;
            return JsonConvert.DeserializeObject<ModelValue>(jsonResult);
        }

        Task<string> IClient.InvokeClientMethodRawAsync(string identifier, string argsJson)
        {
            JS.InvokeUnmarshalled<string, string, int, object>(
                "window.AntimatterServer.InvokeClientMethodRawAsync",
                identifier,
                argsJson,
                CreateTaskCallback(out Task<string> task, isModelValue: false));
            return task;
        }

        Task<T> IClient.InvokeClientMethodAsync<T>(string identifier, object args)
        {
            var json = JsonConvert.SerializeObject(args);
            JS.InvokeUnmarshalled<string,string,int,object> (
                "window.AntimatterServer.InvokeClientMethodAsync",
                identifier,
                json,
                CreateTaskCallback(out Task<T> task, isModelValue: true));
            return task;
        }

        Task IClient.StartupAsync()
        {
            JS.InvokeJS("window.OnServerStartup", null);
            return Task.CompletedTask;
        }

        object IClient.MarshalClientObject(Type desiredType, ModelValue clientValue)
        {
            if (clientValue.Type != ModelValueType.JSON &&
                clientValue.Type != ModelValueType.ClientFile
                ||
                string.IsNullOrEmpty(clientValue.StringValue))
                throw new Exception();
            return JsonConvert.DeserializeObject(clientValue.StringValue, desiredType);
        }

        Task<ClientFile[]> IClient.SelectFileAsync(string acceptList, bool allowMultiple)
        {                        
            JS.InvokeUnmarshalled<string, int, bool, object>(
                "window.AntimatterServer.SelectFileAsync",
                acceptList,
                CreateTaskCallback<ClientFile[]>(out Task<ClientFile[]> task, isModelValue: true),
                allowMultiple);
            return task;
        }

        Task IClient.UploadFileAsync(UploadFileArgs args)
        {
            return (this as IClient).InvokeClientMethodAsync<object>(
                "window.AntimatterServer.UploadFileAsync",
                args);
        }

        void IClient.TriggerLocalDownload(string filename, byte[] data)
        {
            JS.InvokeUnmarshalled<string, byte[], object>(
                "window.AntimatterServer.TriggerLocalDownload",
                filename,
                data);
        }

        Task<byte[]> IClient.ReadFileAsync(int fileHandle, long start, int length)
        {            
            JS.InvokeJS(
                "window.AntimatterServer.ReadFileAsync",
                $"[{{" +
                    $"\"fileHandle\": {fileHandle}, " +
                    $"\"start\": {start}, " +
                    $"\"length\": {length}, " +
                    $"\"callback\": {CreateTaskCallback(out Task<byte[]> task)} " +
                $"}}]");
            return task;
        }

        unsafe void IClient.UpdateBinding(
            string clientid, 
            int bxIndex, 
            ModelValue value)
        {
            var ptr = Unsafe.AsPointer<ModelValue>(ref value);
            JS.InvokeUnmarshalled<int, int, object, object>(
                "window.AntimatterServer.UpdateBinding",
                bxIndex,
                (int)ptr,
                null);
        }

        unsafe void IClient.UpdateBoundCollection(string clinetID, int bxIndex, CollectionUpdate update)
        {
            JS.InvokeUnmarshalled<int, int, object, object>(
                "window.AntimatterServer.OnUpdateBoundCollection",
                bxIndex,
                (int)Unsafe.AsPointer(ref update),
                null);
        }

        void IClient.NavigateTo(string clientid, string route, bool hard)
        {
            JS.InvokeJS(
                "window.AntimatterServer.NavigateTo",
                $"[\"{route}\", {(hard ? "1" : "0")}]");
        }

        void IClient.OpenPopup(string url, bool mini, string urlOnPopupClosed)
        {
            string[] paras = [url, (mini ? "1" : "0"), urlOnPopupClosed];

            JS.InvokeJS(
                "window.AntimatterServer.OpenPopup",
                JsonConvert.SerializeObject(paras));
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
            catch
            {
                return ModelValue.Null;
            }
        }

        #region Invoked by Client
        
        [AMXClientInvocable]
        [JSExport]
        public static void NotifyUserNotIdle()
        {
            Reactor.NotifyUserNotIdle();
        }

        [AMXClientInvocable]
        [JSExport]
        public static bool InvokeBeforeClose()
        {
            return Reactor.InvokeBeforeClose();
        }

        [AMXClientInvocable]
        [JSExport]
        public static void OnForceLogout()
        {
            Reactor.OnForceLogout();
        }

        [AMXClientInvocable]
        [JSExport]
        public static double ParseLocallyFormattedDate(string date)
        {
            if (!DateTime.TryParse(date, CultureInfo.CurrentCulture, DateTimeStyles.AssumeLocal, out var dt))
                return DateTime.MinValue.Ticks;
            var n = Math.Floor(dt.ToUniversalTime().Ticks / 10000.0);
            return n;
        }

        [AMXClientInvocable]
        [JSExport]
        public static void ExecuteCallbackJson(
            int callback,
            string jsonValue)
        {
            var handle = GCHandle.FromIntPtr((IntPtr)callback);
            if (!(handle.Target is JSCallback cb))
                return;
            handle.Free();
            cb(jsonValue, null);
        }

        [AMXClientInvocable]
        [JSExport]
        public unsafe static void ExecuteCallbackBytes(
            int callback,
            void* pData,
            int dataLen)
        {
            var handle = GCHandle.FromIntPtr((IntPtr)callback);
            if (!(handle.Target is JSCallback cb))
                return;
            handle.Free();
            var data = new Span<byte>(pData, dataLen);
            cb(data.ToArray(), null);
        }

        [AMXClientInvocable]
        [JSExport]
        public static void ExecuteCallbackException(int callback, string exception)
        {
            var handle = GCHandle.FromIntPtr((IntPtr)callback);
            if (!(handle.Target is JSCallback cb))
                return;
            handle.Free();
            cb(null, exception);
        }

        [AMXClientInvocable]
        [JSExport]
        public static void Bind(
            int netRef, 
            string path, 
            int bxIndex,
            int mode, 
            bool marshalValue, 
            string converterKey)
        {
            Reactor.Bind(netRef, path, bxIndex, (BindingMode)mode, marshalValue, converterKey);
        }

        [AMXClientInvocable]
        [JSExport]
        public static void Unbind(int bxIndex)
        {
            Reactor.Unbind(bxIndex);
        }

        // Holding it here makes sure it never gets GC'd till
        // the next CreateModelValue call
        private static ModelValue _tempModelValue;

        [AMXClientInvocable]
        [JSExport]
        public static unsafe int CreateModelValue(
            int type,
            int collectionMembers)
        {
            _tempModelValue = new ModelValue();
            _tempModelValue.Type = (ModelValueType)type;            
            if (_tempModelValue.Type == ModelValueType.Collection && collectionMembers > 0)
            {
                _tempModelValue.Collection = new ModelValue[collectionMembers];
                for (int i = 0; i < collectionMembers; i++)
                    _tempModelValue.Collection[i] = new ModelValue
                    {
                        Type = ModelValueType.String,
                        StringValue = "Test String"
                    };
            }
            return (int)Unsafe.AsPointer(ref _tempModelValue);
        }

        [AMXClientInvocable]
        [JSExport]
        public unsafe static void SetStringModelValue(
            int pRoot, 
            string s,
            // -1 for none
            int collectionIndex)
        {
            var rootMV = *(ModelValue*)pRoot;
            if (collectionIndex != -1)
            {
                if (rootMV.Collection.Length > collectionIndex &&
                    rootMV.Collection[collectionIndex] is ModelValue targetMv)
                    targetMv.StringValue = s;
            }
            else
            {
                rootMV.StringValue = s;
            }
        }

        [AMXClientInvocable]
        [JSExport]
        public static void AddRef(int objectHandle)
        {
            Reactor.AddRef(objectHandle);
        }

        [AMXClientInvocable]
        [JSExport]
        public static void ReleaseRef(int objectHandle)
        {
            Reactor.ReleaseRef(objectHandle);
        }

        [AMXClientInvocable]
        [JSExport]
        public static unsafe void UpdateBindingSourceUnmarshalled(
            int bxIndex,
            void* modelValue)
        {  
            Reactor.UpdateBindingSource(bxIndex, *(ModelValue*)modelValue);
        }

        [AMXClientInvocable]
        [JSExport]
        public static unsafe void ExecuteICommandUnmarshalled(
            int netRef,
            //[JSMarshalAs<JSType.MemoryView>]
            void* mv)
        {
            Reactor.ExecuteICommand(
                netRef,
                mv == null ? ModelValue.Null : *((ModelValue*)mv));
        }

        [AMXClientInvocable]
        [JSExport]
        public static void UpdateBindingSource(int bxIndex, string valueJson)
        {
            var value = JsonConvert.DeserializeObject<ModelValue>(valueJson);
            Reactor.UpdateBindingSource(bxIndex, value);
        }

        [AMXClientInvocable]
        [JSExport]
        public static void UpdateBoundCollection(int bxIndex, string valueJson)
        {
            var value = JsonConvert.DeserializeObject<CollectionUpdate>(valueJson);
            Reactor.UpdateBoundCollection(bxIndex, value);
        }

        [AMXClientInvocable]
        [JSExport]
        public static int GetRootObject(string identifier)
        {
            return Reactor.GetRootObject(identifier);
        }

        [AMXClientInvocable]
        [JSExport]
        public static void ExecuteICommand(int netRef, string commandParameterJson)
        {
            ModelValue value = ModelValue.Null;
            if (!string.IsNullOrEmpty(commandParameterJson))
                value = JsonConvert.DeserializeObject<ModelValue>(commandParameterJson);
            Reactor.ExecuteICommand(netRef, value);
        }

        [AMXClientInvocable]
        [JSExport]
        public static unsafe void* InvokeModelObjectMethod(
            int handle, 
            string method, 
            string argsJson)
        {
            ModelValue[] args = null;
            if (!string.IsNullOrEmpty(argsJson))
                args = JsonConvert.DeserializeObject<ModelValue[]>(argsJson);
            var result = Reactor.InvokeModelObjectMethod(handle, method, args ?? new ModelValue[0]);
            return Unsafe.AsPointer<ModelValue>(ref result);
        }

        [AMXClientInvocable]
        [JSExport]
        public static unsafe void* GetCollectionMembers(
            int handle, 
            int offset, 
            int count)
        {
            var members = Reactor.GetCollectionMembers(handle, offset, count);
            return &members;
        }

        [AMXClientInvocable]
        [JSExport]
        public static int GetCollectionSize(int handle)
        {
            return Reactor.GetCollectionSize(handle);
        }

        #endregion

        private int CreateTaskCallback<T>(out Task<T> task, bool isModelValue = false)
        {
            TaskCompletionSource<T> tcs = new TaskCompletionSource<T>();
            task = tcs.Task;
            var cb = new JSCallback((value, exception) =>
            {
                if (!string.IsNullOrEmpty(exception))
                    tcs.SetException(new Exception(exception));
                else if (isModelValue)
                {
                    if (value is string s)
                    {
                        var modelValue = JsonConvert.DeserializeObject<ModelValue>(s);
                        var objValue = modelValue.Value(Reactor, out _, typeof(T));
                        tcs.SetResult((T)objValue);
                    }
                    else
                        tcs.SetException(new Exception("Return value is not JSON string"));
                }
                else if (value is T typedValue)
                {
                    tcs.SetResult(typedValue);
                }
                else if (value is null)
                {
                    tcs.SetResult(default(T));
                }
                else
                {
                    tcs.SetException(new Exception($"Return value is not expected type."));
                }
            });
            var handle = GCHandle.Alloc(cb, GCHandleType.Normal);
            return (int)((IntPtr)handle);
        }
    }
}