using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Windows.Input;

namespace Antimatter.Net.Interop
{
    public class ObjectManager
    {        
        private int _nextHandle = 0;
        private Dictionary<int, ObjectReference> _dict = new Dictionary<int, ObjectReference>();
        private ConditionalWeakTable<object, ObjectReference> _references =
            new ConditionalWeakTable<object, ObjectReference>();
        private Dictionary<string, ObjectReference> _rootObjects = new Dictionary<string, ObjectReference>();
        private static Action<ObjectManager, DotNetValue, object>[] _setters = 
            new Action<ObjectManager, DotNetValue, object>[]
            {
                (mgr, dnv, value) => { },
                (mgr, dnv, value) =>
                {
                    var dnr = mgr.GetOrCreateReference(value);
                    if (dnr == null)
                    {
                        dnv.Type = DotNetValueType.None;
                        return;
                    }
                    dnv.ObjectHandle = dnr.Handle;
                },
                (mgr, dnv, value) => dnv.StringValue = (string)value,
                (mgr, dnv, value) => dnv.IntValue = (int)value,
                (mgr, dnv, value) => dnv.LongValue = (long)value,
                (mgr, dnv, value) => dnv.FloatValue = (float)value,
                (mgr, dnv, value) => dnv.DoubleValue = (double)value
            };
        private static Dictionary<Type, DotNetValueType> _typeConv = new Dictionary<Type, DotNetValueType>
        {
            { typeof(string), DotNetValueType.String },
            { typeof(int), DotNetValueType.Int },
            { typeof(uint), DotNetValueType.Int },
            { typeof(long), DotNetValueType.Long },
            { typeof(ulong), DotNetValueType.Long },
            { typeof(short), DotNetValueType.Int },
            { typeof(ushort), DotNetValueType.Int },
            { typeof(byte), DotNetValueType.Int },
            { typeof(char), DotNetValueType.Int },
            { typeof(float), DotNetValueType.Float },
            { typeof(double), DotNetValueType.Double },
        };

        internal readonly Dictionary<int, BindingExpression> Bindings = new Dictionary<int, BindingExpression>();

        public ObjectManager(string clientid)
        {
            this.ClientID = clientid;
        }

        public void RegisterRootObject(string referenceName, object obj)
        {
            _rootObjects[$"{referenceName}"] = GetOrCreateReference(obj);
        }

        public void Bind(int handle, string path, int bxIndex)
        {
            ObjectReference objRef;
            if (!_dict.TryGetValue(handle, out objRef))
                return;

            var bx = new BindingExpression(this)
            {
                BXIndex = bxIndex,
                SourceObjectReference = objRef,
                Path = path
            };

            this.Bindings[bxIndex] = bx;

            if (!bx.Apply())
                this.Bindings.Remove(bxIndex);
        }

        public void ExecuteICommand(int netRef)
        {
            (GetReference(netRef)?.Object as ICommand)?.Execute(null);
        }

        public int GetRootObject(string identifier)
        {
            ObjectReference objRef = null;
            if (_rootObjects.TryGetValue($"{identifier}", out objRef))
                return objRef.Handle;
            return -1;
        }

        internal string ClientID { get; }

        internal void Dispose(ObjectReference reference)
        {
            var obj = reference.Object;
            if (obj != null)
                _references.Remove(obj);
            _dict.Remove(reference.Handle);
        }

        internal ObjectReference GetReference(int index)
        {
            ObjectReference dnor = null;
            _dict.TryGetValue(index, out dnor);
            return dnor;
        }

        internal DotNetValue GetDotNetValue(object obj)
        {
            if (obj == null)
                return new DotNetValue
                {
                    Type = DotNetValueType.None
                };

            var type = obj.GetType();
            DotNetValueType t = DotNetValueType.None;
            if (!_typeConv.TryGetValue(type, out t))
            {
                return new DotNetValue
                {
                    Type = DotNetValueType.Object,
                    ObjectHandle = GetOrCreateReference(obj).Handle
                };
            }

            DotNetValue dnv = new DotNetValue
            {
                Type = t,
            };
            _setters[(int)t](this, dnv, obj);

            return dnv;
        }
       
        internal void SetValue(int objectReference, string property, DotNetValue value)
        {
            ObjectReference reference;
            if (!_dict.TryGetValue(objectReference, out reference))
                return;

            var obj = reference.Object;
            if (obj == null)
                return;

            var pi = obj.GetType().GetProperty(property);
            if (pi == null)
            {
                return;
            }

            switch (value.Type)
            {
                case DotNetValueType.Object:
                    ObjectReference valueObjRef;
                    object valueObj = null;
                    _dict.TryGetValue(value.ObjectHandle, out valueObjRef);
                    pi.SetValue(obj, valueObj);
                    break;
                case DotNetValueType.Float:
                    pi.SetValue(obj, value.FloatValue);
                    break;
                case DotNetValueType.Double:
                    pi.SetValue(obj, value.DoubleValue);
                    break;
                case DotNetValueType.Int:
                    pi.SetValue(obj, value.IntValue);
                    break;
                case DotNetValueType.Long:
                    pi.SetValue(obj, value.LongValue);
                    break;
                case DotNetValueType.String:
                    pi.SetValue(obj, value.StringValue);
                    break;
            }
        }
        
        internal DotNetValue GetValue(int objectReference, string property)
        {
            ObjectReference reference;
            if (!_dict.TryGetValue(objectReference, out reference))
                return default;

            var obj = reference.Object;
            if (obj == null)
                return default;

            var pi = obj.GetType().GetProperty(property);
            if (pi == null)
                return default;

            DotNetValueType type;
            if (!_typeConv.TryGetValue(pi.PropertyType, out type))
                type = DotNetValueType.Object;

            DotNetValue v = new DotNetValue
            {
                Type = type
            };

            object value = pi.GetValue(obj);
            if (value != null)
            {
                switch (type)
                {
                    case DotNetValueType.Object:
                        v.ObjectHandle = GetOrCreateReference(value).Handle;
                        break;
                    case DotNetValueType.Int:
                        v.IntValue = (int)value;
                        break;
                    case DotNetValueType.Long:
                        v.LongValue = (long)value;
                        break;
                    case DotNetValueType.Float:
                        v.FloatValue = (float)value;
                        break;
                    case DotNetValueType.Double:
                        v.DoubleValue = (double)value;
                        break;
                    case DotNetValueType.String:
                        v.StringValue = (string)value;
                        break;
                }
            }

            return v;
        }

        private ObjectReference GetOrCreateReference(object obj)
        {
            ObjectReference reference = null;
            if (!this._references.TryGetValue(obj, out reference))
            {
                reference = new ObjectReference
                {
                    Handle = this._nextHandle,
                    Object = obj
                };
                this._dict[this._nextHandle] = reference;
                this._references.Add(obj, reference);
                this._nextHandle++;
            }

            reference.AddRef();
            return reference;
        }
    }
}
