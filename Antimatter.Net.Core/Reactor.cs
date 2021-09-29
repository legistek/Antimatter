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

namespace Antimatter.Net
{
    /// <summary>
    /// Controls all interactions between Models and Clients (UI),
    /// releasing trendous power in the process.
    /// </summary>
    public class Reactor
    {
        #region Static Methods

        /// <summary>
        /// Attempts to retrieve the <see cref="Reactor"/> instance associated
        /// with the model object. Used in rare cases when model operations need
        /// to directly invoke <see cref="Reactor"/> instance methods.
        /// </summary>
        /// <param name="obj">The model object.</param>
        /// <returns>The <see cref="Reactor"/> instance if any, otherwise 
        /// <c>null</c></returns>
        public static Reactor GetFor(object obj)
        {
            if (!_reactors.TryGetValue(obj, out var reactor))
                return null;
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

        public static void RegisterConverter(Type modelObjectType, IModelValueConverter converter)
        {
            _customConverters[modelObjectType] = converter;
        }

        #endregion

        #region Model Server-Invocable Methods

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
        public void NavigateTo(string route)
        {
            Reactor.Client.NavigateTo(this.ClientID, route);
        }

        /// <summary>
        /// Invoked by model servers to signal to clients that
        /// they are ready to start.
        /// </summary>   
        public Task StartupAsync()
        {
            return Client.StartupAsync();
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
                
        public static object SessionContext => _currentSessionContext.Value;

        #endregion

        #region Client-Invocable Methods

        /// <summary>
        /// Invoked by clients to update model (source) properties in response to
        /// UI actions.
        /// </summary>
        [AMXClientInvocable]
        public void UpdateBindingSource(int bxIndex, ModelValue newValue)
        {
            BindingExpression bx;
            if (!this.Bindings.TryGetValue(bxIndex, out bx))
                return;
            _currentSessionContext.Value = _sessionContextObject;
            bx.UpdateSource(newValue);
        }

        [AMXClientInvocable]
        public void UpdateBoundCollection(int bxIndex, CollectionUpdate update)
        {
            BindingExpression bx;
            if (!this.Bindings.TryGetValue(bxIndex, out bx))
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
            bool notifyCollectionChanged,
            bool marshalValue)
        {
            ObjectReference objRef;
            if (!_refsByHandle.TryGetValue(handle, out objRef))
                return;

            var bx = new BindingExpression(this, path)
            {
                BXIndex = bxIndex,
                NotifyCollectionChanged = notifyCollectionChanged,
                SourceReference = objRef,
                MarshalValue = marshalValue
            };

            this.Bindings[bxIndex] = bx;

            if (!bx.Apply(objRef))
                this.Bindings.Remove(bxIndex);
        }

        /// <summary>
        /// Invoked by clients to release bindings created with <see cref="Bind"/>.
        /// </summary>
        [AMXClientInvocable]
        public void Unbind(int bxIndex)
        {
            BindingExpression bx;
            if (this.Bindings.TryGetValue(bxIndex, out bx))
            {
                bx.Unbind();
                this.Bindings.Remove(bxIndex);
            }
            else
            {
                Debug.WriteLine($"WARNING: No binding with index {bxIndex} found. Was it already unbound?");
            }
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
            
            cmd?.Execute(commandParameter?.Value(this, cmd.GetType().GenericTypeArguments?.FirstOrDefault()));
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
            if (obj != null)
                _refsByInstance.Remove(obj);
            _refsByHandle.Remove(reference.Handle);
            _reactors.Remove(obj);
            //int liveObjects = _dict.Count;
            //Console.WriteLine($"Freeing {reference.Handle} {obj?.ToString()}; {liveObjects} remaining.");            
        }

        internal void Release(int objHandle)
        {
            var reference = GetReference(objHandle);
            if (reference != null)
                reference.Release(this);
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

        internal ObjectReference GetReference(int index)
        {
            ObjectReference dnor = null;
            _refsByHandle.TryGetValue(index, out dnor);                
            return dnor;
        }

        internal ModelValue GetModelValue(object obj, bool marshalled = false)
        {
            if (obj == null)
                return new ModelValue
                {
                    Type = ModelValueType.None
                };

            var type = obj.GetType();
            ModelValueType t = ModelValueType.None;
            if (!_typeConv.TryGetValue(type, out t))
            {
                if (obj is Enum en)
                {
                    return new ModelValue
                    {
                        Type = ModelValueType.Int,
                        IntValue = System.Convert.ToInt32(en)
                    };
                }
                else if (obj is IEnumerable ienum)
                {
                    var arr = ienum.Cast<object>().Select(item => GetModelValue(item)).ToArray();
                    return new ModelValue
                    {
                        Type = ModelValueType.Collection,
                        Collection = arr,
                        ObjectHandle = GetOrCreateReference(obj).Handle,
                    };
                }
                else if (_customConverters.TryGetValue(type, out IModelValueConverter converter))
                {
                    return converter.ConvertTo(obj);
                }
                else if (marshalled)
                {
                    return Reactor.Client.MarshalObject(obj);
                }
                else 
                {
                    var handle = GetOrCreateReference(obj).Handle;
                    return new ModelValue
                    {
                        Type = ModelValueType.Object,
                        Key = (obj is Model.ObservableObject oo)
                            ? oo.GetKey() ?? obj.GetHashCode().ToString()
                            : obj.GetHashCode().ToString(),
                        ObjectHandle = handle,
                    };
                }
            }

            ModelValue dnv = new ModelValue
            {
                Type = t,
            };
            _setters[(int)t](this, dnv, obj);

            return dnv;
        }

        internal ObjectReference TryGetObjectReference(object obj)
        {
            ObjectReference reference = null;
            this._refsByInstance.TryGetValue(obj, out reference);
            return reference;
        }

        private ObjectReference GetOrCreateReference(object obj)
        {
            ObjectReference reference = null;
            if (!this._refsByInstance.TryGetValue(obj, out reference))
            {                
                reference = new ObjectReference
                {                    
                    Object = obj
                };
                reference.Handle = _refsByHandle.Add(reference);                
                this._refsByInstance.Add(obj, reference);
                _reactors.Add(obj, this);
                //Console.WriteLine($"Creating ref {handle} to {obj?.ToString()}");
            }

            reference.AddRef();
            return reference;
        }

        private readonly Dictionary<int, BindingExpression> Bindings = new Dictionary<int, BindingExpression>();        
        private RecyclingDictionary<ObjectReference> _refsByHandle = new RecyclingDictionary<ObjectReference>();
        private ConditionalWeakTable<object, ObjectReference> _refsByInstance =
            new ConditionalWeakTable<object, ObjectReference>();
        private Dictionary<string, ObjectReference> _rootObjects = new Dictionary<string, ObjectReference>();
        
        private object _sessionContextObject;
        private static AsyncLocal<object> _currentSessionContext = new AsyncLocal<object>();
        private static ConditionalWeakTable<object, Reactor> _reactors = new ConditionalWeakTable<object, Reactor>();

        private static Action<Reactor, ModelValue, object>[] _setters =
            // This order MUST match the order in hte ModelValueType enum
            new Action<Reactor, ModelValue, object>[]
            {
                (mgr, dnv, value) => { },
                (mgr, dnv, value) =>
                {
                    var dnr = mgr.GetOrCreateReference(value);
                    if (dnr == null)
                    {
                        dnv.Type = ModelValueType.None;
                        return;
                    }
                    dnv.ObjectHandle = dnr.Handle;
                },
                (mgr, dnv, value) => dnv.StringValue = (string)value,
                (mgr, dnv, value) =>
                    dnv.IntValue = Convert.ToInt32(value),
                (mgr, dnv, value) =>
                    dnv.LongValue = Convert.ToInt64(value),
                (mgr, dnv, value) =>
                    dnv.FloatValue = Convert.ToSingle(value),
                (mgr, dnv, value) => 
                    dnv.DoubleValue = Convert.ToDouble(value),
                (mgr, dnv, value) =>
                {
                    var dnr = mgr.GetOrCreateReference(value);
                    if (dnr == null)
                    {
                        dnv.Type = ModelValueType.None;
                        return;
                    }
                    dnv.ObjectHandle = dnr.Handle;
                },
                (mgr, dnv, value) => dnv.BoolValue = (bool)value,
                (mgr, dnv, value) => 
                    dnv.GuidValue = (Guid)value,
                (mgr, dnv, value) =>
                {
                    dnv.DoubleValue = ((DateTime)value).ToUniversalTime().Ticks / 10000.0d; 
                },
                (mgr, dnv, value) => dnv.DoubleValue = ((TimeSpan)value).Ticks / 10000.0d,
                (mgr, dnv, value) => dnv.StringValue = (string)value
            };
        private static Dictionary<Type, ModelValueType> _typeConv = new Dictionary<Type, ModelValueType>
        {
            { typeof(string), ModelValueType.String },
            { typeof(int), ModelValueType.Int },
            { typeof(uint), ModelValueType.Int },
            { typeof(long), ModelValueType.Long },
            { typeof(ulong), ModelValueType.Long },
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
        };
        internal static Dictionary<Type, IModelValueConverter> _customConverters =
            new Dictionary<Type, IModelValueConverter>();

        #endregion
    }
}
