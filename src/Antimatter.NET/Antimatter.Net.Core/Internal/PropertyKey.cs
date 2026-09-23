using System;
using System.Linq;
using System.Collections.Generic;
using System.Reflection;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq.Expressions;

namespace Antimatter.Net.Internal
{
    internal abstract class PropertyKey
    {
        protected int _inefficientGets;
        private string _fullPath;        

        private static Dictionary<Type, TypeConverter> _typeConverters = new Dictionary<Type, TypeConverter>();
        private static Dictionary<Type, object> _defaultValues = new Dictionary<Type, object>()
        {
            { typeof(bool), false },
            { typeof(byte), 0 },
            { typeof(short), 0 },
            { typeof(ushort), 0 },
            { typeof(char), 0 },
            { typeof(int), 0 },
            { typeof(uint), 0 },
            { typeof(float), 0f },
            { typeof(double), 0d },
            { typeof(Guid), Guid.Empty },
            { typeof(DateTime), new DateTime(0) },
        };
        private static Dictionary<string, PropertyKey> _cachedKeys =
             new Dictionary<string, PropertyKey>();

        public abstract Type PropertyType { get; }

        internal virtual bool IsIndexedProperty { get; }

        protected PropertyKey(Type declaringType)
        {
            this.DeclaringType = declaringType;
        }

        //static Stopwatch _sw = new Stopwatch();
        //static long _totalKeyGetTime;
        //static int _totalKeyRequests;
        //static double _avgKeyGetTicks;

        public override string ToString()
        {
            return $"{this.GetType().Name}:{_fullPath}:{_inefficientGets}";
        }

        internal static PropertyKey Create(Type type, PathComponent pathComponent)
        {
            //_sw.Reset();
            //_sw.Start();

            //try
            {
                if (type == null || string.IsNullOrEmpty(pathComponent.ComponentName))
                    return null;

                var keyKey = type.FullName + "." + pathComponent.ComponentName;
                if (_cachedKeys.TryGetValue(keyKey, out var key))
                    return key;

                PropertyKey pk;
                pk = CreatePrivate(type, pathComponent.ComponentName);
                _cachedKeys[keyKey] = pk;
                if (pk != null)
                    pk._fullPath = keyKey;
                return pk;
            }
            //finally
            //{
            //    _totalKeyRequests++;
            //    _totalKeyGetTime += _sw.ElapsedTicks;
            //    _avgKeyGetTicks = _totalKeyGetTime / _totalKeyRequests;
            //}
        }

        private static PropertyKey CreatePrivate(Type type, string propertyName)
        {
            bool indexed = propertyName.StartsWith("[") && propertyName.EndsWith("]");

            if (indexed)
            {
                if (typeof(Array).IsAssignableFrom(type))
                {
                    propertyName = propertyName.Substring(1, propertyName.Length - 2);
                    if (int.TryParse(propertyName, out var index))
                        return new ArrayPropertyKey(index, type);
                    else
                        return null;
                }
                else
                {
                    propertyName = propertyName.Substring(1, propertyName.Length - 2);
                    return IndexedPropertyKey.Create(type, propertyName);
                }
            }
            //else if (typeof(IDirectPropertyAccess).IsAssignableFrom(type))
            //{
            //    return DirectAccessPropertyKey.Create(type, propertyName);
            //}
            else
            {
                return ReflectionPropertyKey.Create(type, propertyName);
            }
        }

        internal Type DeclaringType
        {
            get;
        }

        static Stopwatch _sw = new Stopwatch();
        static long _totalGetTime;
        static int _totalGets;
        static double _avgTicksPerGet;

        internal object GetValue(object obj, PathComponent pathComponent)
        {
            try
            {
                //_sw.Reset();
                //_sw.Start();                                
                return this.GetValueInternal(obj);
            }
            catch (Exception ex)
            {
                var theEx = ex.InnerException ?? ex;
                Console.WriteLine(
                    $"Caught error retrieving value " +
                    $"{_fullPath} " +
                    $"for binding {pathComponent.Binding?.Path}; " +
                    $"{theEx.Message};\r\n{theEx.StackTrace}");
                return null;
            }
            //finally
            //{
            //    _sw.Stop();
            //    _totalGetTime += _sw.ElapsedTicks;
            //    _avgTicksPerGet = _totalGetTime / ++_totalGets;
            //}
        }

        protected abstract object GetValueInternal(object obj);

        internal void SetValue(object obj, object value)
        {
            Type destType = this.PropertyType;
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

            SetValueInternal(obj, value);
        }

        protected abstract void SetValueInternal(object obj, object value);

        protected static PropertyInfo GetPropertyInfo(Type type, string propertyName)
        {
            PropertyInfo pi;
            try
            {
                pi = type.GetProperty(propertyName);
            }
            catch (AmbiguousMatchException)
            {
                var matches = type.GetProperties().Where(p => p.Name == propertyName);
                pi = matches.FirstOrDefault(p => p.DeclaringType == type) ?? matches.FirstOrDefault();
            }

            return pi;
        }

        protected static PropertyInfo GetIndexedPropertyInfo(Type type, string propertyName, out object indexer)
        {
            PropertyInfo pi;
            object indexParameter = null;
            var matches = type.GetProperties().Where(p =>
            {
                var idxParams = p.GetIndexParameters();
                if (idxParams.Length == 1)
                {
                    var ip = idxParams.First();
                    if (ip.ParameterType == typeof(string))
                    {
                        indexParameter = propertyName;
                        return true;
                    }
                    else if (ip.ParameterType == typeof(int))
                    {
                        if (!int.TryParse(propertyName, out var idx))
                            return false;
                        indexParameter = idx;
                        return true;
                    }
                    else if (ip.ParameterType.IsEnum)
                    {
                        try
                        {
                            indexParameter = Enum.Parse(ip.ParameterType, propertyName, ignoreCase: true);
                            return true;
                        }
                        catch
                        {
                            return false;
                        }
                    }
                }
                return false;
            });
            pi = matches.FirstOrDefault(p => p.DeclaringType == type) ?? matches.FirstOrDefault();
            indexer = indexParameter;
            return pi;
        }

        private static void PerformanceDump()
        {
            foreach (var key in _cachedKeys)
            {
                Debug.WriteLine($"{key.Key}: {key.Value._inefficientGets}");
            }
        }

        private static TypeConverter GetTypeConverterFor(Type destType)
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

        private static object GetDefaultValueFor(Type type)
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

    internal class ArrayPropertyKey : PropertyKey
    {
        int _index;
        Type _elementType;        

        internal ArrayPropertyKey(int index, Type declaringType) : base(declaringType)
        {
            _index = index;
            _elementType = declaringType.GetElementType();
        }

        internal override bool IsIndexedProperty => true;

        public override Type PropertyType => _elementType;

        protected override object GetValueInternal(object obj)
        {
            return (obj as Array).GetValue(_index);
        }

        protected override void SetValueInternal(object obj, object value)
        {
            (obj as Array).SetValue(value, (int)_index);
        }
    }

    internal class IndexedPropertyKeyWithDirectAccess : IndexedPropertyKey
    {
        internal IndexedPropertyKeyWithDirectAccess(Type declaringType) : base(declaringType)
        {
        }

        protected override object GetValueInternal(object obj)
        {
            if (((IDirectPropertyAccess)obj).TryGetIndexedValue(_indexParameter, out var value))
                return value;            
            return base.GetValueInternal(obj);
        }
    }

    internal class IndexedPropertyKey : PropertyKey
    {
        private object[] _indexParameterArray = null;
        protected object _indexParameter = null;        
        private Func<object, object[], object> _getter;
        private Action<object, object[], object> _setter;
        private Type _propertyType;
        
        protected IndexedPropertyKey(Type declaringType) : base(declaringType)
        {
        }

        internal static IndexedPropertyKey Create(Type type, string propertyName)
        {
            Func<object, object[], object> getter = null;
            Action<object, object[], object> setter = null;

            var pi = GetIndexedPropertyInfo(type, propertyName, out var indexParameter);
            if (pi == null)
                return null;

            //bool implsDirectAccess = typeof(IDirectPropertyAccess).IsAssignableFrom(type);
                        
            getter = FastInvoke.BuildUntypedIndexedGetter(pi);
            if (pi.CanWrite)
                setter = FastInvoke.BuildUntypedIndexedSetter(pi);

            IndexedPropertyKey key = null;
            //if (implsDirectAccess)
            //    key = new IndexedPropertyKeyWithDirectAccess(type);
            //else
                key = new IndexedPropertyKey(type);

            key._propertyType = pi.PropertyType;
            key._indexParameter = indexParameter;
            key._indexParameterArray = new object[] { indexParameter };            
            key._getter = getter;
            key._setter = setter;
            return key;
        }

        internal override bool IsIndexedProperty => true;

        public override Type PropertyType => _propertyType;

        protected override object GetValueInternal(object obj)
        {
            _inefficientGets++;
            return _getter(obj, _indexParameterArray);
        }

        protected override void SetValueInternal(object obj, object value)
        {
            if (_setter == null)
                return;
            _setter(obj, _indexParameterArray, value);
        }
    }

    internal class ReflectionPropertyKey : PropertyKey
    {                
        private Type _propertyType;
        private Func<object, object> _getter;
        private Action<object, object> _setter;
        
        public override Type PropertyType => _propertyType;

        internal static ReflectionPropertyKey Create(Type type, string propertyName)
        {
            PropertyInfo pi = GetPropertyInfo(type, propertyName);
            if (pi == null)
                return null;
            var accs = pi.GetAccessors();
            try
            {
                var getter = FastInvoke.BuildUntypedGetter(pi);
                var setter = FastInvoke.BuildUntypedSetter(pi);
                return new ReflectionPropertyKey(type)
                {
                    _propertyType = pi.PropertyType,
                    _getter = getter,
                    _setter = setter,
                };
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        private ReflectionPropertyKey(Type declaringType) : base(declaringType)
        {
        }

        protected override object GetValueInternal(object obj)
        {
            _inefficientGets++;
            return _getter(obj);            
        }

        protected override void SetValueInternal(object obj, object value)
        {
            if (_setter == null)
                return;           
            _setter(obj, value);
        }
    }

    internal class DirectAccessPropertyKey : PropertyKey
    {
        private string _propertyName;
        private Type _propertyType;        
        private Func<object, object> _getter;
        private Action<object, object> _setter;

        private DirectAccessPropertyKey(Type declaringType) : base(declaringType)
        {
        }

        internal static PropertyKey Create(Type declaringType, string propertyName)
        {
            PropertyInfo pi;
            Func<object, object> getter = null;
            Action<object, object> setter = null;

            pi = GetPropertyInfo(declaringType, propertyName);
            if (pi == null)
                return null;
            getter = FastInvoke.BuildUntypedGetter(pi);
            setter = FastInvoke.BuildUntypedSetter(pi);

            return new DirectAccessPropertyKey(declaringType)
            {
                _getter = getter,
                _setter = setter,
                _propertyType = pi.PropertyType,
                _propertyName = propertyName
            };
        }

        public override Type PropertyType => _propertyType;

        protected override object GetValueInternal(object obj)
        {
            object value;
            if (((IDirectPropertyAccess)obj).TryGetValue(_propertyName, out value))
                return value;
            _inefficientGets++;
            return _getter(obj);
        }

        protected override void SetValueInternal(object obj, object value)
        {
            if (((IDirectPropertyAccess)obj).TrySetValue(_propertyName, value))
                return;
            else if (_setter != null)
                _setter(obj, value);
        }
    }

    internal static class FastInvoke
    {
        public static Func<object, object> BuildUntypedGetter(MemberInfo memberInfo)
        {
            var targetType = memberInfo.DeclaringType;
            var exInstance = Expression.Parameter(typeof(object), "t");

            // Convert the object parameter to the specific target type
            var exInstanceCast = Expression.Convert(exInstance, targetType);
            var exMemberAccess = Expression.MakeMemberAccess(exInstanceCast, memberInfo);       // ((TargetType)t).PropertyName
            var exConvertToObject = Expression.Convert(exMemberAccess, typeof(object));         // Convert(((TargetType)t).PropertyName, typeof(object))
            var lambda = Expression.Lambda<Func<object, object>>(exConvertToObject, exInstance);

            var action = lambda.Compile();
            return action;
        }

        public static Action<object, object> BuildUntypedSetter(PropertyInfo memberInfo)
        {
            if (!memberInfo.CanWrite)
                return null;

            var targetType = memberInfo.DeclaringType;
            var exInstance = Expression.Parameter(typeof(object), "t");

            // Convert the object parameter to the specific target type
            var exInstanceCast = Expression.Convert(exInstance, targetType);
            var exMemberAccess = Expression.MakeMemberAccess(exInstanceCast, memberInfo);

            var exValue = Expression.Parameter(typeof(object), "p");
            var exConvertedValue = Expression.Convert(exValue, GetUnderlyingType(memberInfo));  // Convert(p, PropertyType)
            var exBody = Expression.Assign(exMemberAccess, exConvertedValue);

            var lambda = Expression.Lambda<Action<object, object>>(exBody, exInstance, exValue);
            var action = lambda.Compile();
            return action;
        }

        private static Type GetUnderlyingType(MemberInfo member)
        {
            switch (member.MemberType)
            {
                case MemberTypes.Event:
                    return ((EventInfo)member).EventHandlerType;
                case MemberTypes.Field:
                    return ((FieldInfo)member).FieldType;
                case MemberTypes.Method:
                    return ((MethodInfo)member).ReturnType;
                case MemberTypes.Property:
                    return ((PropertyInfo)member).PropertyType;
                default:
                    throw new ArgumentException
                    (
                     "Input MemberInfo must be of type EventInfo, FieldInfo, MethodInfo, or PropertyInfo"
                    );
            }
        }

        public static Func<object, object[], object> BuildUntypedIndexedGetter(PropertyInfo propertyInfo)
        {
            if (!propertyInfo.GetIndexParameters().Any())
                throw new ArgumentException("Property is not an indexed property.");

            var targetType = propertyInfo.DeclaringType;
            var exInstance = Expression.Parameter(typeof(object), "t");

            // Convert the object parameter to the specific target type
            var exInstanceCast = Expression.Convert(exInstance, targetType);

            var exIndexes = Expression.Parameter(typeof(object[]), "indexes");

            // Convert the index parameter to the proper type
            var indexParameters = propertyInfo.GetIndexParameters();
            if (indexParameters.Length != 1)
                throw new NotSupportedException("Only single index parameter properties are supported.");

            var indexType = indexParameters[0].ParameterType;
            var exIndexCast = Expression.Convert(
                Expression.ArrayIndex(exIndexes, Expression.Constant(0)), indexType);

            var exPropertyAccess = Expression.MakeIndex(
                exInstanceCast, propertyInfo, new[] { exIndexCast });

            var exConvertToObject = Expression.Convert(exPropertyAccess, typeof(object));
            var lambda = Expression.Lambda<Func<object, object[], object>>(
                exConvertToObject, exInstance, exIndexes);

            return lambda.Compile();
        }

        public static Action<object, object[], object> BuildUntypedIndexedSetter(PropertyInfo propertyInfo)
        {
            if (!propertyInfo.GetIndexParameters().Any())
                throw new ArgumentException("Property is not an indexed property.");

            var targetType = propertyInfo.DeclaringType;
            var exInstance = Expression.Parameter(typeof(object), "t");

            // Convert the object parameter to the specific target type
            var exInstanceCast = Expression.Convert(exInstance, targetType);

            var exIndexes = Expression.Parameter(typeof(object[]), "indexes");

            // Convert the index parameter to the proper type
            var indexParameters = propertyInfo.GetIndexParameters();
            if (indexParameters.Length != 1)
                throw new NotSupportedException("Only single index parameter properties are supported.");

            var indexType = indexParameters[0].ParameterType;
            var exIndexCast = Expression.Convert(
                Expression.ArrayIndex(exIndexes, Expression.Constant(0)), indexType);

            var exValue = Expression.Parameter(typeof(object), "p");
            var exConvertedValue = Expression.Convert(exValue, propertyInfo.PropertyType);

            var exPropertyAccess = Expression.MakeIndex(
                exInstanceCast, propertyInfo, new[] { exIndexCast });

            var exAssign = Expression.Assign(exPropertyAccess, exConvertedValue);

            var lambda = Expression.Lambda<Action<object, object[], object>>(
                exAssign, exInstance, exIndexes, exValue);

            return lambda.Compile();
        }
    }
}
