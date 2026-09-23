using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Linq;
using System.Collections;
using System.Globalization;

using Antimatter.Net.Internal;
using Antimatter.Net.Model;

namespace Antimatter.Net
{
    /// <summary>
    /// Represents a "particle" of data exchanged between the Model and UI
    /// layers. This is a low-level class that should rarely be used by
    /// applications unless implementing custom <see cref="IModelValueConverter"/>'s.
    /// Note that the data structure layout is controlled at a low level
    /// to maximize memory efficiency; as such, many of the property backing 
    /// fields in this class overlap in memory. To correctly use this class,
    /// the <see cref="Type"/> propriate must be get/set, followed by the appropriate
    /// value property. See the individual property descriptions for details.
    /// </summary>
    [StructLayout(LayoutKind.Explicit)]
    public class ModelValue
    {
        /// <summary>
        /// Gets or sets the <see cref="ModelValueType"/>. This must be
        /// set or referenced before any of the other properties have
        /// meaning.
        /// </summary>
        public ModelValueType Type
        {
            get => (ModelValueType)type;
            set => type = (ushort)value;
        }

        /// <summary>
        /// A <see cref="string"/> value; requires <see cref="Type"/>
        /// to be set to <see cref="ModelValueType.String"/>.
        /// </summary>
        public string StringValue
        {
            get => stringValue;
            set => stringValue = value;
        }

        /// <summary>
        /// A semi-unique key for an object instance. Typically this is
        /// the result of <see cref="Object.GetHashCode"/>. Can also be
        /// set through <see cref="Model.ObservableObject.GetKey"/> for 
        /// objects derived from that class. Requires <see cref="Type"/> 
        /// be set to <see cref="ModelValueType.Object"/>.
        /// </summary>
        public string Key
        {
            get => key;
            set => key = value;
        }

        /// <summary>
        /// A boolean value. Requires <see cref="Type"/> be set to
        /// <see cref="ModelValueType.Object"/>.
        /// </summary>
        public bool BoolValue
        {
            get => boolValue1 == 0 ? false : true;
            set => boolValue1 = value ? c_ByteTrue : c_ByteFalse;
        }

        /// <summary>
        /// A single-precision (32-bit) floating point value. Requires <see cref="Type"/> 
        /// be set to <see cref="ModelValueType.Float"/>.
        /// </summary>
        public float FloatValue
        {
            get => floatValue;
            set => floatValue = value;
        }

        public float FloatValue2
        {
            get => float2;
            set => this.float2 = value;
        }

        public float FloatValue3
        {
            get => float3;
            set => this.float3 = value;
        }

        public float FloatValue4
        {
            get => float4;
            set => this.float4 = value;
        }

        /// <summary>
        /// A double -precision (64-bit) floating point value. Used with <see cref="Type"/> 
        /// <see cref="ModelValueType.Double"/>, <see cref="ModelValueType.TimeSpan"/>,
        /// and <see cref="ModelValueType.DateTime"/>. When used with the latter two types,
        /// this value represents fractional milliseconds, i.e., it is the .NET Ticks value 
        /// / 10000.0d. While this can result in a small loss of precision, it allows very accurate 
        /// date and time values to be processed efficiently by other platforms that do not 
        /// support 64-bit integers. 
        /// </summary>
        public double DoubleValue
        {
            get => doubleValue;
            set => doubleValue = value;
        }

        /// <summary>
        /// A 32-bit integer value. Requires <see cref="Type"/> 
        /// be set to <see cref="ModelValueType.Int"/>.
        /// </summary>
        public int IntValue
        {
            get => intValue;
            set => intValue = value;
        }

        //[FieldOffset(16)]
        //private long longValue;
        ///// <summary>
        ///// A 64-bit signed integer. Requires <see cref="Type"/>
        ///// be set to <see cref="ModelValueType.Long"/>.
        ///// </summary>
        //public long LongValue
        //{
        //    get => longValue;
        //    set => longValue = value;
        //}

        /// <summary>
        /// A 16-byte unique identifier. Requires <see cref="Type"/> 
        /// be set to <see cref="ModelValueType.Guid"/>.
        /// </summary>
        public Guid GuidValue
        {
            get => guidValue;
            set => guidValue = value;
        }

        /// <summary>
        /// An array of other <see cref="ModelValue"/>s. Requires
        /// <see cref="Type"/> be set to <see cref="ModelValueType.Collection"/>.
        /// </summary>
        public ModelValue[] Collection
        {
            get => _collection;
            set => _collection = value;
        }

        /// <summary>
        /// Represents the C# <c>null</c>. This must always be used for
        /// <c>null</c> values regardless of the underlying C# type.
        /// </summary>
        public static readonly ModelValue Null = new ModelValue
        {
            Type = ModelValueType.None
        };

        /// <summary>
        /// Returns a POCO based on the current <see cref="ModelValue"/>.
        /// </summary>
        /// <param name="reactor">The <see cref="Reactor"/> for the client
        /// session.</param>
        /// <param name="desiredType">The desired return type, if known.
        /// If the default C# type for the <see cref="ModelValue"/> does not match,
        /// the method will attempt to covnert it to the desired type.
        /// </param>
        /// <returns></returns>
        public object Value(Reactor reactor, out ObjectReference objRef, Type desiredType = null)
        {
            object finalValue = null;
            objRef = null;
            bool gotten = false;

            if (this.type >= _getters.Length)
            {
                Console.WriteLine($"DataType: {this.type} but only {_getters.Length} getters");
            }
            unsafe
            {

                var getter = _getters[this.type];
                if (getter != null)
                {
                    finalValue = getter(reactor, this);
                    gotten = true;
                }
            }

            if (!gotten)
            {
                switch (this.Type)
                {
                    case ModelValueType.JSON:
                        var obj = Reactor.Client.MarshalClientObject(desiredType, this);
                        if (obj is IReactorObject iro)
                        {
                            iro.Reactor = reactor;
                            iro.ReactorClient = Reactor.Client;
                        }
                        finalValue = obj;
                        break;
                    case ModelValueType.ClientFile:
                        var cf = Reactor.Client.MarshalClientObject(typeof(ClientFile), this) as ClientFile;
                        (cf as IReactorObject).ReactorClient = Reactor.Client;
                        (cf as IReactorObject).Reactor = reactor;
                        finalValue = cf;
                        if (desiredType != typeof(ClientFile) && Reactor._clientFileConverter != null)
                            finalValue = Reactor._clientFileConverter.ConvertFrom(finalValue);
                        break;
                    case ModelValueType.Collection:
                        if (this.ObjectHandle != 0)
                        {
                            objRef = reactor.GetReference(this.ObjectHandle);
                            finalValue = objRef?.Object;
                            break;
                        }

                        if (desiredType == null || desiredType == typeof(IEnumerable))
                            desiredType = typeof(object[]);

                        if (desiredType.IsArray)
                        {
                            Type elementType = desiredType.GetElementType();
                            Array arr = Array.CreateInstance(elementType, this.Collection.Length);
                            for (int i = 0; i < this.Collection.Length; i++)
                                arr.SetValue(this.Collection[i].Value(reactor, out _, elementType), i);
                            finalValue = arr;
                        }
                        else if (typeof(IList).IsAssignableFrom(desiredType))
                        {
                            var coll = Activator.CreateInstance(desiredType) as IList;
                            Type elementType =
                                desiredType.IsGenericType
                                ? desiredType.GetGenericArguments()[0]
                                : null;
                            for (int i = 0; i < this.Collection.Length; i++)
                                coll.Add(this.Collection[i].Value(reactor, out _, elementType));
                            finalValue = coll;
                        }
                        break;
                }
            }

            if (desiredType == null || finalValue?.GetType() == desiredType)
                return finalValue;

            if (Reactor._customConverters.TryGetValue(desiredType, out var converter))
            {
                finalValue = converter.ConvertFrom(finalValue);
            }
            else if (finalValue?.GetType() != desiredType &&
                finalValue is IConvertible iconv)
            {
                if (desiredType.IsGenericType && desiredType.GetGenericTypeDefinition().Equals(typeof(Nullable<>)))
                    desiredType = Nullable.GetUnderlyingType(desiredType);
                else if (desiredType.IsEnum)
                    desiredType = Enum.GetUnderlyingType(desiredType);
                try
                {
                    finalValue = iconv.ToType(desiredType, CultureInfo.CurrentCulture);
                }
                catch (Exception ex)
                {
                    return new BindingException(ex.Message);
                }
            }

            return finalValue;
        }

        /// <inheritdoc/>
        public override bool Equals(object obj)
        {
            return obj is ModelValue mv &&
                mv.Type == this.Type &&
                mv.StringValue == this.StringValue &&
                mv.ObjectHandle == this.ObjectHandle;
        }

        /// <inheritdoc/>
        public override int GetHashCode()
        {
            return (int)this.Type ^
                (int)(this.StringValue?.GetHashCode() ?? 0) ^
                (int)this.ObjectHandle;
        }

        /// <inheritdoc/>
        public override string ToString()
        {
            return $"{this.Type.ToString()}";
        }

        public int ObjectHandle
        {
            get => objectHandle;
            set => objectHandle = value;
        }

        internal bool IsReferenceCounted => this.Type == ModelValueType.Collection ||
            this.Type == ModelValueType.Object;

        #region Low-Level Fields

        // 0-1
        [FieldOffset(0)]
        private ushort type;

        // 2
        [FieldOffset(2)]
        private byte boolValue1;
        // 2-3
        [FieldOffset(2)]
        private ushort shortValue;
        // 3
        [FieldOffset(3)]
        private byte boolValue2;

        // 4-7
        [FieldOffset(4)]
        private int objectHandle;
        [FieldOffset(4)]
        private float floatValue;
        [FieldOffset(4)]
        private int intValue;

        // 4-19
        [FieldOffset(4)]
        private Guid guidValue;

        // 8-11
        [FieldOffset(8)]
        private float float2;
        [FieldOffset(8)]
        private int int2;

        // 8-15
        [FieldOffset(8)]
        private double doubleValue;

        // 12-15
        [FieldOffset(12)]
        private float float3;
        [FieldOffset(12)]
        private int int3;

        // 16-19
        [FieldOffset(16)]
        private float float4;
        [FieldOffset(16)]
        private int int4;

        // 20-23 
        [FieldOffset(20)]
        private string stringValue;
        [FieldOffset(20)]
        private string key;
        [FieldOffset(20)]
        private ModelValue[] _collection;

        #endregion

        #region Static Setters/Getters for Function Pointers

        internal static object get_Null(Reactor mgr, ModelValue dnv) => null;

        internal static void set_ObjectHandle(Reactor mgr, ModelValue dnv, object value)
        {
            var dnr = mgr.GetOrCreateReference(value);
            if (dnr == null)
            {
                dnv.Type = ModelValueType.None;
                return;
            }
            dnv.ObjectHandle = dnr.Handle;
        }
        internal static object get_ObjectHandle(Reactor mgr, ModelValue dnv) =>
                mgr.GetReference(dnv.ObjectHandle)?.Object;

        internal static void set_IntValue(Reactor mgr, ModelValue dnv, object value) =>
            dnv.intValue = Convert.ToInt32(value);
        internal static object get_IntValue(Reactor mgr, ModelValue dnv) =>
            dnv.intValue;

        internal static void set_FloatValue(Reactor mgr, ModelValue dnv, object value) =>
            dnv.floatValue = Convert.ToSingle(value);
        internal static object get_FloatValue(Reactor manager, ModelValue dnv) =>
            dnv.floatValue;

        internal static void set_DoubleValue(Reactor mgr, ModelValue dnv, object value) =>
            dnv.doubleValue = Convert.ToDouble(value);
        internal static object get_DoubleValue(Reactor manager, ModelValue dnv) =>
            dnv.doubleValue;

        internal static void set_BoolValue(Reactor mgr, ModelValue dnv, object value) =>
            dnv.boolValue1 = ((bool)value) ? c_ByteTrue : c_ByteFalse;
        internal static object get_BoolValue(Reactor manager, ModelValue dnv) =>
            dnv.boolValue1 == 0 ? c_ObjectFalse : c_ObjectTrue;

        internal static void set_GuidValue(Reactor mgr, ModelValue dnv, object value) =>
            dnv.guidValue = (Guid)value;
        internal static object get_GuidValue(Reactor manager, ModelValue dnv)
        {
            if (string.IsNullOrEmpty(dnv.StringValue))
                return Guid.Empty;
            Guid g;
            Guid.TryParse(dnv.StringValue, out g);
            return g;
        }

        internal static void set_DateTimeValue(Reactor mgr, ModelValue dnv, object value) =>
            dnv.doubleValue = ((DateTime)value).ToUniversalTime().Ticks / 10000.0d;
        internal static object get_DateTimeValue(Reactor manager, ModelValue dnv)
        {
            long ticks = Math.Max(
                DateTime.MinValue.Ticks, 
                (long)dnv.doubleValue * 10000);
            var dt = new DateTime(ticks, DateTimeKind.Utc);
            return dt;
        }

        internal static void set_TimeSpanValue(Reactor mgr, ModelValue dnv, object value) =>
            dnv.doubleValue = ((TimeSpan)value).Ticks / 10000.0d;
        internal static object get_TimeSpanValue(Reactor manager, ModelValue dnv) =>
            new TimeSpan((long)(dnv.doubleValue * 10000.0d));

        internal static void set_StringValue(Reactor mgr, ModelValue dnv, object value) =>
            dnv.stringValue = (string)value;
        internal static object get_StringValue(Reactor manager, ModelValue dnv) => 
            dnv.stringValue;

        internal static void set_SizeValue(Reactor mgr, ModelValue dnv, object value)
        {
            System.Drawing.SizeF szf = (System.Drawing.SizeF)value;
            dnv.floatValue = szf.Width;
            dnv.float2 = szf.Height;
        }
        internal static object get_SizeValue(Reactor manager, ModelValue dnv) =>
            new System.Drawing.SizeF(dnv.floatValue, dnv.float2);

        internal static void set_RectValue(Reactor mgr, ModelValue dnv, object value)
        {
            System.Drawing.RectangleF rcf = (System.Drawing.RectangleF)value;
            dnv.floatValue = rcf.X;
            dnv.float2 = rcf.Y;
            dnv.float3 = rcf.Width;
            dnv.float4 = rcf.Height;
        }
        internal static object get_RectValue(Reactor manager, ModelValue dnv) =>
            new System.Drawing.RectangleF(dnv.floatValue, dnv.float2, dnv.float3, dnv.float4);

        internal static void set_MultimediaEvent(Reactor mgr, ModelValue dnv, object value)
        {
            MultimediaEvent evnt = (MultimediaEvent)value;            
            dnv.doubleValue = evnt.Timestamp / 10000.0d;
            dnv.intValue = evnt.Other1;
            dnv.int4 = evnt.Other2;
        }
        internal static object get_MultimediaEvent(Reactor manager, ModelValue dnv) =>
            new MultimediaEvent
            {
                Type = (MultimediaEventType)dnv.shortValue,
                Timestamp = (long)(dnv.doubleValue * 10000.0d),
                Other1 = dnv.intValue,
                Other2 = dnv.int4,
            };

        internal static object get_ClientFile(Reactor reactor, ModelValue dnv)
        {
            var cf = Reactor.Client.MarshalClientObject(typeof(ClientFile), dnv) as ClientFile;
            (cf as IReactorObject).ReactorClient = Reactor.Client;
            (cf as IReactorObject).Reactor = reactor;
            return cf;
        }

        #endregion

        private static unsafe delegate*<Reactor, ModelValue, object>[] _getters =
            // This order MUST match the order in hte ModelValueType enum
            new delegate*<Reactor, ModelValue, object>[]
            {
                &ModelValue.get_Null,               // None (0)
                &ModelValue.get_ObjectHandle,       // Object (1)
                &ModelValue.get_StringValue,        // String (2)
                &ModelValue.get_IntValue,           // Int (3) 
                null,                               // Long (4) 
                &ModelValue.get_FloatValue,         // Float (5) 
                &ModelValue.get_DoubleValue,        // Double (6) 
                null,                               // Collection (7) (special case)
                &ModelValue.get_BoolValue,          // Bool (8)
                &ModelValue.get_GuidValue,          // Guid (9)
                &ModelValue.get_DateTimeValue,      // DateTime (10)
                &ModelValue.get_TimeSpanValue,      // TimeSpan (11) 
                null,                               // Marshalled JSON (12) (special case)
                &ModelValue.get_SizeValue,          // Size (13)
                &ModelValue.get_RectValue,          // Rect (14)
                null,                               // ClientFile (15) (special case)
                &ModelValue.get_MultimediaEvent,    // MultimediaEvent (16)
                &ModelValue.get_StringValue,        // ValidationError (17)
            };

        private const byte c_ByteTrue = 1;
        private const byte c_ByteFalse = 0;

        private static object c_ObjectTrue = true;
        private static object c_ObjectFalse = false;

        private const long c_UnixTimeOffset = 62135596800000;
    }
}
