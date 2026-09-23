using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using System.Linq;

using Antimatter.Net.Internal;
using System.Threading;
using System.Threading.Tasks;
using System.Collections;
using System.Globalization;
using Antimatter.Net.Model;

namespace Antimatter.Net
{
    public delegate bool WindowBeforeCloseHandler();

    /// <summary>
    /// Controls all interactions between Models and Clients (UI),
    /// releasing tremendous power in the process.
    /// </summary>
    public class Reactor
    {
        public event WindowBeforeCloseHandler BeforeClose;

        /// <summary>
        /// Invoked when another application instance (browser tab, etc)
        /// has called <see cref="ForceLogut"/>. The application must handle 
        /// this event by logging out without warning.
        /// </summary>
        public event EventHandler ForcedLogout;

        /// <summary>
        /// Invoked when the Client responds to user activity, but
        /// no more frequently than every 120 seconds, for use with
        /// logout/inactivity timers.
        /// </summary>
        public event EventHandler UserNotIdle;

        #region Static Methods

        public static void DebugWriteLine(string line)
        {
#if DEBUG
            Console.WriteLine(line);
#endif
        }

        public static void DebugWriteLine(Exception ex)
        {
#if DEBUG
            Console.WriteLine(ex.Message + ex.StackTrace);
#endif
        }

        /// <summary>
        /// Attempts to retrieve the <see cref="Reactor"/> instance associated
        /// with the model object. Used in rare cases when model operations need
        /// to directly invoke <see cref="Reactor"/> instance methods.
        /// </summary>
        /// <param name="obj">The model object.</param>
        /// <returns>The <see cref="Reactor"/> instance if any, otherwise 
        /// <c>null</c></returns>
        public static Reactor GetFor(object obj, out int handle)
        {
            handle = 0;
            Reactor reactor = null;
            if (obj is IAntimatterParticle p)
                reactor = p.Reactor;
            else if (!_reactors.TryGetValue(obj, out reactor))
                return null;
            var objRef = reactor.TryGetObjectReference(obj);
            handle = objRef.Handle;
            return reactor;
        }

        /// <summary>
        /// Initializes the entire platform. Must be called exactly once
        /// by any Model Server at startup, regardless whether the server is
        /// single tenant or multi-tenant.
        /// </summary>
        /// <param name="client">An instance of an object implementing
        /// the <see cref="IClient"/> interface, which will used by
        /// <see cref="Reactor"/>s to communicate with clients to notify
        /// them of model updates.
        /// </param>
        public static void Initialize(IClient client)
        {
            Client = client;
        }

        public static void RegisterClientFileConverter(IModelValueConverter converter)
        {
            _clientFileConverter = converter;
        }

        public static void RegisterConverter(
            Type modelObjectType, 
            IModelValueConverter converter)
        {
            _customConverters[modelObjectType] = converter;
        }

        public static void RegisterConverter(
            string key,
            IModelValueConverter converter)
        {
            _customConverters[key] = converter;
        }

        #endregion

        #region Model-Invocable Methods

        /// <summary>
        /// Invoked by Model Servers to construct a new <see cref="Reactor"/>
        /// instance. See remarks.
        /// </summary>
        /// <param name="clientid">The client ID, used by multi-tenant Model Servers.
        /// Can be <c>null</c> for single-tenant model servers. See remarks.
        /// </param>
        /// <remarks>
        /// <para>
        /// For single-tenant Model Servers, i.e., when the Model Server is executing
        /// on the same end user's machine as the client, there should be one
        /// static global <see cref="Reactor"/> for the application. In this
        /// case <paramref name="clientid"/> can be <c>null</c>.
        /// </para>
        /// <para>
        /// For multi-tenant Model Servers, i.e., when the model server is a
        /// SignalR or other remote server handling multiple client connections,
        /// there must be a unique <see cref="Reactor"/> instance for each
        /// client connection, keyed to the <paramref name="clientid"/> which likewise
        /// must be unique. This is extremely important as otherwise clients
        /// could easily tap into other users' application sessions and see their
        /// data. The <paramref name="clientid"/> is passed back to the model server,
        /// via <see cref="IClient.UpdateBinding"/> when bound model values change.
        /// The model server is responsible for routing the update messages over the
        /// correct client connection based on the <paramref name="clientid"/>.
        /// </para>
        /// </remarks>
        public Reactor(string clientid)
        {
            this.ClientID = clientid;
        }

        /// <summary>
        /// Sends a logout request to all other application instances (browser tabs, etc.),
        /// which will result in them invoking <see cref="ForcedLogout"/>.
        /// </summary>
        public void ForceLogut()
        {
            Client.ForceLogout();
        }

        /// <summary>
        /// Invoked by model servers to register root level objects that
        /// can be obtained by clients directly (i.e. without binding).
        /// </summary>
        public void RegisterRootObject(string referenceName, object obj)
        {
            _rootObjects[$"{referenceName}"] = GetOrCreateReference(obj);
        }

        public void RegisterSessionContext(object sessionContextObject)
        {
            _sessionContextObject = sessionContextObject;
        }

        /// <summary>
        /// Invoked by model servers to set the application route for
        /// browser or browser-like applications. This can but need not
        /// be a URL.
        /// </summary>
        public void NavigateTo(string route, bool hard = false)
        {
            Reactor.Client.NavigateTo(this.ClientID, route, hard);
        }

        public void OpenPopup(string url, bool mini = false, string urlOnPopupClosed = null)
        {
            Reactor.Client.OpenPopup(url, mini, urlOnPopupClosed);
        }

        /// <summary>
        /// Invoked by model servers to signal to clients that
        /// they are ready to start.
        /// </summary>   
        public Task StartupAsync()
        {
            return Client.StartupAsync();
        }

        public void RecordUserActivity()
        {
            Client.RecordUserActivity();
        }

        public DateTime GetLastActivity()
        {
            return Client.GetLastActivity();
        }

        public async Task<ClientFile[]> SelectFileAsync(string acceptList, bool allowMultiple = false)
        {
            var files = await Client.SelectFileAsync(acceptList, allowMultiple);
            foreach (var file in files)
            {
                (file as IReactorObject).ReactorClient = Client;
                (file as IReactorObject).Reactor = this;
            }
            return files;
        }

        public void TriggerLocalDownload(string filename, byte[] data)
        {
            Client.TriggerLocalDownload(filename, data);
        }

        public object InvokeClientMethod(string identifier, object args, Type desiredReturnType = null)
        {
            var mv = Client.InvokeClientMethod(identifier, args);
            return mv.Value(this, out _, desiredReturnType);
        }

        public async Task<T> InvokeClientMethodAsync<T>(string identifier, object args)
        {
            return await Client.InvokeClientMethodAsync<T>(identifier, args);
        }

        public async Task<string> InvokeClientMethodRawAsync(string identifier, string jsonArgs)
        {
            return await Client.InvokeClientMethodRawAsync(identifier, jsonArgs);
        }

        public bool GetIsMobile()
        {
            return Client.GetIsMobile();
        }

        public void CopyToClipboard(byte[] data, string mimeType)
        {
            var mv = GetModelValue(data);
            Client.CopyToClipboard(mv, mimeType);
            if (mv.IsReferenceCounted)
                ReleaseObject(data);
        }

        public static object SessionContext => _currentSessionContext.Value;

        #endregion

        #region Client-Invocable Methods

        public void NotifyUserNotIdle()
        {
            this.UserNotIdle?.Invoke(this, null);
        }

        public bool InvokeBeforeClose()
        {
            return this.BeforeClose?.Invoke() == true;
        }

        /// <summary>
        /// Invoked by clients to call methods on model-side objects. See remarks.
        /// </summary>
        /// <param name="handle">The model reference handle to the instance being invoked.</param>
        /// <param name="method">The name of the method.</param>
        /// <param name="args">An array of <see cref="ModelValue"/>s 
        /// representing the arguments.
        /// </param>
        /// <remarks>
        /// This should be used EXTREMELY rarely. The client/caller must have precise knowledge
        /// of the method name and argument signature of the instance being invoked, or exceptions
        /// will be thrown.
        /// </remarks>
        [AMXClientInvocable]
        public ModelValue InvokeModelObjectMethod(int handle, string method, ModelValue[] args)
        {
            var objRef = GetReference(handle);
            if (objRef?.Object == null)
                return ModelValue.Null;

            var obj = objRef.Object;
            var type = obj.GetType();

            var mi = type.GetMethod(method);
            if (mi == null)
                return ModelValue.Null;

            var argObjs = args.Select(arg => arg.Value(this, out _)).ToArray();

            var result = mi.Invoke(obj, argObjs);
            return GetModelValue(result);
        }

        [AMXClientInvocable]
        public int GetCollectionSize(int handle)
        {
            var objRef = GetReference(handle);
            if (objRef?.Object == null)
                return -1;

            var obj = objRef.Object;
            if (!(obj is IList list))
                return -1;

            return list.Count;
        }

        [AMXClientInvocable]
        public ModelValue[] GetCollectionMembers(int handle, int offset, int count)
        {
            var objRef = GetReference(handle);
            if (objRef?.Object == null)
                return null;

            var obj = objRef.Object;
            if (!(obj is IList list))
                return null;

            if (offset >= list.Count)
                return null;

            count = Math.Min(count, list.Count - offset);
            var items = new object[count];

            for (int i = offset, j = 0; i < offset + count; i++, j++)
            {
                items[j] = list[i];
            }

            return GetModelValueArray(items);
        }

        [AMXClientInvocable]
        public void AddRef(int objectHandle)
        {
            if (this._refsByHandle.TryGetValue(objectHandle, out var objRef))
                objRef.AddRef();            
        }

        [AMXClientInvocable]
        public void ReleaseRef(int objectHandle)
        {
            if (this._refsByHandle.TryGetValue(objectHandle, out var objRef))
                objRef.Release(this);
        }

        /// <summary>
        /// Invoked by clients to update model (source) properties in response to
        /// UI actions.
        /// </summary>
        [AMXClientInvocable]
        public void UpdateBindingSource(int bxIndex, ModelValue newValue)
        {
            //BindingExpression bx = this.Bindings[bxIndex];
            //if (bx is null)
            //    return;
            if (!this.Bindings.TryGetValue(bxIndex, out var bx))
                return;
            _currentSessionContext.Value = _sessionContextObject;
            bx.UpdateSource(newValue);
        }

        [AMXClientInvocable]
        public void UpdateBoundCollection(int bxIndex, CollectionUpdate update)
        {
            //BindingExpression bx = this.Bindings[bxIndex];
            //if (bx is null)
            //    return;
            if (!this.Bindings.TryGetValue(bxIndex, out var bx))
                return;
            _currentSessionContext.Value = _sessionContextObject;
            bx.UpdateBoundCollection(update);
        }

        /// <summary>
        /// Invoked by clients to create new bindings to model objects and
        /// properties.
        /// </summary>
        [AMXClientInvocable]
        public void Bind(
            int handle,
            string path,
            int bxIndex,
            BindingMode bindingMode,
            bool marshalValue,
            string converterKey)
        {
            try
            {
                ObjectReference objRef;
                if (!_refsByHandle.TryGetValue(handle, out objRef) ||
                    objRef == null)
                {
                    Reactor.DebugWriteLine(
                        $"WARNING: Attempt to bind to released or non-existent object handle {handle}");
                    return;
                }

                var bx = new BindingExpression(this, path)
                {
                    BXIndex = bxIndex,
                    Mode = bindingMode,
                    MarshalValue = marshalValue
                };

                if (!string.IsNullOrEmpty(converterKey) &&
                    _customConverters.TryGetValue(converterKey, out IModelValueConverter conv))
                {
                    bx.Converter = conv;
                }

                this.Bindings[bxIndex] = bx;

                if (!bx.Apply(objRef))
                    this.Bindings.Remove(bxIndex);
                //this.Bindings[bxIndex] = null;
            }
            catch (Exception ex)
            {
                Reactor.DebugWriteLine(ex);
            }
        }

        /// <summary>
        /// Invoked by clients to release bindings created with <see cref="Bind"/>.
        /// </summary>
        [AMXClientInvocable]
        public void Unbind(int bxIndex)
        {
            //BindingExpression bx = this.Bindings[bxIndex];
            if (!this.Bindings.TryGetValue(bxIndex, out var bx))
            {
                DebugWriteLine($"WARNING: No binding with index {bxIndex} found. Was it already unbound?");
                return;
            }

            bx.Unbind();

            this.Bindings.Remove(bxIndex);
            //this.Bindings[bxIndex] = null;
        }

        /// <summary>
        /// Invoked by clients to notify of a cross-instance forced logout request
        /// (i.e. from another browser tab or application instance or whatnot). This
        /// is never generated by the instance's own call to
        /// <see cref="ForceLogut"/>.
        /// </summary>
        [AMXClientInvocable]
        public void OnForceLogout()
        {
            this.ForcedLogout?.Invoke(this, null);
        }

        /// <summary>
        /// Invoked by clients in response to UI actions (like button presses)
        /// triggering bound <see cref="ICommand"/>s on model objects.
        /// </summary>
        [AMXClientInvocable]
        public void ExecuteICommand(int netRef, ModelValue commandParameter)
        {
            _currentSessionContext.Value = _sessionContextObject;
            var cmd = GetReference(netRef)?.Object as ICommand;
            if (cmd == null)
                return;
            
            cmd?.Execute(commandParameter?.Value(this, out _, cmd.GetType().GenericTypeArguments?.FirstOrDefault()));
        }

        /// <summary>
        /// Invoked by clients to obtain root level model objects without binding.
        /// See also <see cref="RegisterRootObject"/>.
        /// </summary>
        [AMXClientInvocable]
        public int GetRootObject(string identifier)
        {
            ObjectReference objRef = null;
            if (_rootObjects.TryGetValue($"{identifier}", out objRef))
                return objRef.Handle;
            return -1;
        }

        #endregion

        #region Internals

        internal static IClient Client { get; private set; }

        internal string ClientID { get; }

        internal void FinalDispose(ObjectReference reference)
        {            
            var obj = reference.Object;
            if (obj is IAntimatterParticle p)
            {
                p.Reference = null;
                p.Reactor = null;
            }
            else
            {
                _refsByInstance.Remove(obj);
                _reactors.Remove(obj);
            }
            _refsByHandle.Remove(reference.Handle);            
        }

        internal void Release(int objHandle, bool includeCollection = true)
        {
            var reference = GetReference(objHandle);
            if (reference == null)
                return;
            reference.Release(this);
            if (includeCollection && reference.Object is IEnumerable ienum)
            {
                foreach (var item in ienum)
                {
                    var childRef = TryGetObjectReference(item);
                    if (childRef != null)
                        Release(childRef, true);
                }
            }
        }

        internal void Release(ObjectReference reference, bool includeCollection = true)
        {
            Release(reference.Handle);
            if (!includeCollection || !(reference.Object is IEnumerable ienum))
                return;
            foreach (var item in ienum)
            {
                var childRef = TryGetObjectReference(item);
                if (childRef != null)
                    Release(childRef, true);
            }
        }

        internal void Release(ModelValue value, bool includeCollection = true)
        {
            if (value == null)
                return;
            if (value.IsReferenceCounted)
                Release(value.ObjectHandle);
            else if (includeCollection && value.Type == ModelValueType.Collection)
            {
                foreach (var val in value.Collection)
                    Release(val);
                value.Collection = null;
            }
        }

        internal ObjectReference GetReference(int handle)
        {
            ObjectReference dnor = null;
            _refsByHandle.TryGetValue(handle, out dnor);                
            return dnor;
        }

        private ModelValue[] GetModelValueArray(IEnumerable pocos)
        {
            IModelValueConverter conv = null;
            Type lastType = null;
            List<ModelValue> values = new List<ModelValue>();
            foreach (var item in pocos)
            {
                var finalItem = item;
                if (finalItem != null)
                {
                    // This is so we don't have to ping the custom converter
                    // dictionary potentially 1000s of times when usually all
                    // the collection members will have the same type.
                    var itemType = finalItem.GetType();
                    if (itemType != lastType)
                        _customConverters.TryGetValue(lastType = itemType, out conv);
                    if (conv != null)
                        finalItem = conv.ConvertTo(item);
                }
                values.Add(GetModelValue(finalItem));
            }
            return values.ToArray();
        }

        internal ModelValue GetModelValue(object obj, bool marshalled = false, ModelValueType? preferredType = null)
        {
            if (obj == null)
                return new ModelValue
                {
                    Type = ModelValueType.None
                };
            
            var type = obj.GetType();
            Type underlyingNullable;
            ModelValueType t = ModelValueType.None;
            if (!_typeConv.TryGetValue(type, out t))
            {
                if (marshalled)
                {
                    return Reactor.Client.MarshalObject(obj);
                }
                if (obj is Enum en)
                {
                    var underlyingType = Enum.GetUnderlyingType(en.GetType());
                    return GetModelValue(Convert.ChangeType(en, underlyingType), false);
                }
                else if (
                    obj is IEnumerable ienum && 
                    (preferredType != ModelValueType.CollectionReference || !(obj is IList)))
                {                   
                    return new ModelValue
                    {
                        Type = ModelValueType.Collection,
                        Collection = GetModelValueArray(ienum),
                        ObjectHandle = GetOrCreateReference(obj).Handle,
                    };
                }
                else if (obj is IList && preferredType == ModelValueType.CollectionReference)
                {
                    return new ModelValue
                    {
                        Type = ModelValueType.CollectionReference,
                        ObjectHandle = GetOrCreateReference(obj).Handle
                    };
                }
                else if ((underlyingNullable = Nullable.GetUnderlyingType(type)) != null)
                {
                    if (obj == null)
                        return ModelValue.Null;
                    return GetModelValue(Convert.ChangeType(obj, underlyingNullable), marshalled, preferredType);
                }
                else
                {
                    var handle = GetOrCreateReference(obj).Handle;
                    return new ModelValue
                    {
                        Type = ModelValueType.Object,
                        Key = (obj is IAntimatterParticle p)
                            ? p.GetKey() ?? obj.GetHashCode().ToString()
                            : obj.GetHashCode().ToString(),
                        ObjectHandle = handle,
                    };
                }
            }

            ModelValue dnv = new ModelValue
            {
                Type = t,
            };

            unsafe
            {
                var del = _setters[(int)t];
                del(this, dnv, obj);
            }

            return dnv;
        }

        public int GetObjectHandle(object obj)
        {
            var objRef = GetOrCreateReference(obj);
            if (objRef == null)
                return 0;
            return objRef.Handle;
        }

        internal ObjectReference TryGetObjectReference(object obj)
        {
            if (obj is IAntimatterParticle p)
                return p.Reference;
            if (obj is null || obj is string || obj?.GetType()?.IsValueType == true)
                return null;
            ObjectReference reference = null;
            this._refsByInstance.TryGetValue(obj, out reference);
            return reference;
        }

        private ObjectReference CreateObjectReference(object obj)
        {
            var reference = new ObjectReference
            {
                Object = obj
            };
            reference.Handle = _refsByHandle.Add(reference);
            if (obj is IAntimatterParticle p)
            {
                p.Reference = reference;
                p.Reactor = this;
            }
            else
            {
                this._refsByInstance.Add(obj, reference);
                _reactors.Add(obj, this);
            }
            //DebugWriteLine($"Creating ref {reference.Handle} to {obj?.ToString()}");
            return reference;
        }

        public int GetOrCreateHandle(object obj)
        {
            return this.GetOrCreateReference(obj).Handle;
        }

        public void ReleaseObject(object obj)
        {
            var refr = TryGetObjectReference(obj);
            if (refr == null)
                return;
            refr.Release(this);
        }

        internal ObjectReference GetOrCreateReference(object obj)
        {
            ObjectReference reference = TryGetObjectReference(obj)
                ?? CreateObjectReference(obj);
            reference.AddRef();
            return reference;
        }

        //private readonly GrowableArray<BindingExpression> Bindings = new GrowableArray<BindingExpression>();
        private readonly Dictionary<int, BindingExpression> Bindings = new Dictionary<int, BindingExpression>();
        private KeyDictionary<ObjectReference> _refsByHandle = new KeyDictionary<ObjectReference>();
        private ConditionalWeakTable<object, ObjectReference> _refsByInstance =
            new ConditionalWeakTable<object, ObjectReference>();
        private Dictionary<string, ObjectReference> _rootObjects = new Dictionary<string, ObjectReference>();
        
        private object _sessionContextObject;
        private static AsyncLocal<object> _currentSessionContext = new AsyncLocal<object>();
        private static ConditionalWeakTable<object, Reactor> _reactors = new ConditionalWeakTable<object, Reactor>();
        
        private static unsafe delegate*<Reactor, ModelValue, object, void>[] _setters =
            // This order MUST match the order in hte ModelValueType enum
            new delegate*<Reactor, ModelValue, object, void>[]
            {
                null,                           // None (0)
                &ModelValue.set_ObjectHandle,   // Object (1)
                &ModelValue.set_StringValue,    // String (2)
                &ModelValue.set_IntValue,       // Int (3) 
                null,                           // Long (4) 
                &ModelValue.set_FloatValue,     // Float (5) 
                &ModelValue.set_DoubleValue,    // Double (6) 
                &ModelValue.set_ObjectHandle,   // Collection (7)
                &ModelValue.set_BoolValue,      // Bool (8)
                &ModelValue.set_GuidValue,      // Guid (9)
                &ModelValue.set_DateTimeValue,  // DateTime (10)
                &ModelValue.set_TimeSpanValue,  // TimeSpan (11) 
                &ModelValue.set_StringValue,    // Marshalled JSON (12)
                &ModelValue.set_SizeValue,      // Size (13)
                &ModelValue.set_RectValue,      // Rect (14)
                null,                               // ClientFile (15)
                &ModelValue.set_MultimediaEvent,    // MultimediaEvent (16)
            };
        private static Dictionary<Type, ModelValueType> _typeConv = new Dictionary<Type, ModelValueType>
        {
            { typeof(string), ModelValueType.String },
            { typeof(int), ModelValueType.Int },
            { typeof(uint), ModelValueType.Int },
            { typeof(long), ModelValueType.Double },
            { typeof(ulong), ModelValueType.Double },
            { typeof(short), ModelValueType.Int },
            { typeof(ushort), ModelValueType.Int },
            { typeof(byte), ModelValueType.Int },
            { typeof(char), ModelValueType.Int },
            { typeof(float), ModelValueType.Float },
            { typeof(double), ModelValueType.Float },
            { typeof(bool), ModelValueType.Bool },
            { typeof(Guid), ModelValueType.Guid },
            { typeof(DateTime), ModelValueType.DateTime },
            { typeof(TimeSpan), ModelValueType.TimeSpan },
            { typeof(System.Drawing.SizeF), ModelValueType.Size },
            { typeof(System.Drawing.RectangleF), ModelValueType.Rect },
            { typeof(ClientFile), ModelValueType.ClientFile },
            { typeof(MultimediaEvent), ModelValueType.MultimediaEvent }
        };
        internal static Dictionary<object, IModelValueConverter> _customConverters =
            new Dictionary<object, IModelValueConverter>();

        internal static IModelValueConverter _clientFileConverter = null;

        #endregion
    }
}
