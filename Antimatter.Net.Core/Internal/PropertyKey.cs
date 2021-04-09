using System;
using System.Linq;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using System.ComponentModel;

namespace Antimatter.Net.Internal
{
    internal class PropertyKey
    {
        private string _indexParameter = null;
        private static Dictionary<Type, TypeConverter> _typeConverters = new Dictionary<Type, TypeConverter>();
        private static Dictionary<Type, object> _defaultValues = new Dictionary<Type, object>();
        private static Dictionary<Type, Dictionary<string, PropertyKey>> _cachedKeys =
            new Dictionary<Type, Dictionary<string, PropertyKey>>();

        private PropertyKey()
        {
        }

        internal bool IsIndexedProperty { get; private set; }

        internal static PropertyKey Create(Type type, PathComponent pathComponent)
        {
            if (type == null || string.IsNullOrEmpty(pathComponent.ComponentName))
                return null;

            PropertyKey pk;

            // Apparently key caching is no better than
            // compiler optimizations, but maybe revisit later

            //Dictionary<string, PropertyKey> typeStore;
            //pk = TryGetCachedKey(type, pathComponent.ComponentName, out typeStore);
            //if (pk != null)
            //    return pk;

            pk = CreatePrivate(type, pathComponent.ComponentName);
            // typeStore[pathComponent.ComponentName] = pk;
            return pk;
        }

        private static PropertyKey TryGetCachedKey(
            Type type,
            string propertyName,
            out Dictionary<string, PropertyKey> typeStore)
        {
            if (!_cachedKeys.TryGetValue(type, out typeStore))
            {
                typeStore = new Dictionary<string, PropertyKey>();
                _cachedKeys[type] = typeStore;
                return null;
            }

            PropertyKey key;
            typeStore.TryGetValue(propertyName, out key);
            return key;
        }

        private static PropertyKey CreatePrivate(Type type, string propertyName)
        {
            bool indexed = propertyName.StartsWith("[") && propertyName.EndsWith("]");

            PropertyInfo pi = null;
            if (indexed)
            {
                var matches = type.GetProperties().Where(p =>
                {
                    var idxParams = p.GetIndexParameters();
                    return idxParams.Length == 1 && idxParams.First().ParameterType == typeof(string);
                });
                pi = matches.FirstOrDefault(p => p.DeclaringType == type) ?? matches.FirstOrDefault();
            }
            else
            {
                try
                {
                    pi = type.GetProperty(propertyName);
                }
                catch (AmbiguousMatchException)
                {
                    var matches = type.GetProperties().Where(p => p.Name == propertyName);
                    pi = matches.FirstOrDefault(p => p.DeclaringType == type) ?? matches.FirstOrDefault();
                }
            }

            if (pi == null)
                return null;

            return new PropertyKey
            {
                PropertyInfo = pi,
                IsIndexedProperty = indexed,
                _indexParameter = indexed ? propertyName.Substring(1, propertyName.Length - 2) : null
            };
        }

        internal PropertyInfo PropertyInfo { get; set; }

        internal string Name
        {
            get => this.PropertyInfo?.Name;
        }

        internal object Key
        {
            get => (object)this.PropertyInfo?.Name;
        }

        internal Type DeclaringType
        {
            get
            {
                return this.PropertyInfo?.DeclaringType;
            }
        }

        public override string ToString()
        {
            return this.PropertyInfo.Name;
        }

        internal object GetValue(object obj)
        {
            if (IsIndexedProperty)
                return this.PropertyInfo.GetValue(obj, new object[] { _indexParameter });
            else
                return this.PropertyInfo.GetValue(obj);
        }

        internal void SetValue(object obj, object value)
        {            
            Type destType = PropertyInfo.PropertyType;
            if (value == null)
                value = GetDefaultValueFor(destType);
            else
            {
                Type srcType = value.GetType();
                if (!destType.IsAssignableFrom(srcType))
                {
                    var conv = GetTypeConverterFor(destType);
                    if (conv?.CanConvertFrom(srcType) == true)
                        value = conv.ConvertFrom(value);
                }
            }

            if (IsIndexedProperty)
                this.PropertyInfo.SetValue(
                    obj,
                    value,
                    new object[] { _indexParameter });
            else
                this.PropertyInfo.SetValue(obj, value);
        }

        internal static TypeConverter GetTypeConverterFor(Type destType)
        {
            TypeConverter conv;
            if (!_typeConverters.TryGetValue(destType, out conv))
            {
                if (destType == typeof(string))
                    conv = new StringTypeConverter();
                else if (destType == typeof(double) || destType == typeof(int))
                    conv = new NumberTypeConverter(destType);
                else
                    conv = TypeDescriptor.GetConverter(destType);
                _typeConverters[destType] = conv;
            }
            return conv;
        }

        internal static object GetDefaultValueFor(Type type)
        {
            object defVal;
            if (!_defaultValues.TryGetValue(type, out defVal))
            {
                if (type.IsValueType)
                    defVal = Activator.CreateInstance(type);
                else
                    defVal = null;
                _defaultValues[type] = defVal;
            }
            return defVal;
        }
    }
}
