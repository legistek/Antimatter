using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Linq;
using System.Collections;

namespace Antimatter.Net
{
    [StructLayout(LayoutKind.Explicit)]
    public class ModelValue
    {
        public static readonly ModelValue Null = new ModelValue
        {
            Type = ModelValueType.None
        };

        public override bool Equals(object obj)
        {
            return obj is ModelValue mv &&
                mv.Type == this.Type &&
                mv.StringValue == this.StringValue &&
                mv.ObjectHandle == this.ObjectHandle;
        }

        [FieldOffset(0)]
        private ModelValueType type;
        public ModelValueType Type
        {
            get => type;
            set => type = value;
        }

        [FieldOffset(8)]
        private string stringValue;
        public string StringValue
        {
            get => stringValue;
            set => stringValue = value;
        }

        [FieldOffset(8)]
        private string key;
        public string Key
        {
            get => key;
            set => key = value;
        }

        [FieldOffset(16)]
        private int objectHandle;
        public int ObjectHandle
        {
            get => objectHandle;
            set => objectHandle = value;
        }

        [FieldOffset(16)]
        public bool boolValue;
        public bool BoolValue
        {
            get => boolValue;
            set => boolValue = value;
        }

        [FieldOffset(16)]
        private float floatValue;
        public float FloatValue
        {
            get => floatValue;
            set => floatValue = value;
        }

        [FieldOffset(16)]
        private double doubleValue;
        public double DoubleValue
        {
            get => doubleValue;
            set => doubleValue = value;
        }

        [FieldOffset(16)]
        private int intValue;
        public int IntValue
        {
            get => intValue;
            set => intValue = value;
        }

        [FieldOffset(16)]
        private long longValue;
        public long LongValue
        {
            get => longValue;
            set => longValue = value;
        }

        [FieldOffset(16)]
        private Guid guidValue;
        public Guid GuidValue
        {
            get => guidValue;
            set => guidValue = value;
        }

        [FieldOffset(32)]
        private ModelValue[] _collection;
        public ModelValue[] Collection
        {
            get => _collection;
            set => _collection = value;
        }

        internal bool IsReferenceCounted => this.Type == ModelValueType.Collection ||
            this.Type == ModelValueType.Object;

        internal object ToCSValue(Reactor mgr, Type desiredType = null)
        {
            switch (this.Type)
            {
                case ModelValueType.Float:
                    return this.FloatValue;
                case ModelValueType.Double:
                    return this.DoubleValue;
                case ModelValueType.Int:
                    return this.IntValue;
                case ModelValueType.Long:
                    return this.LongValue;
                case ModelValueType.String:
                case ModelValueType.ValidationError:
                    return this.StringValue;
                case ModelValueType.Bool:
                    return this.BoolValue;
                case ModelValueType.Guid:
                    {
                        if (string.IsNullOrEmpty(this.StringValue))
                            return Guid.Empty;
                        Guid g;
                        Guid.TryParse(this.StringValue, out g);
                        return g;
                    }
                case ModelValueType.DateTime:
                    return new DateTime(
                        (long)(this.DoubleValue * 10000.0d), 
                        DateTimeKind.Utc);
                case ModelValueType.TimeSpan:
                    return new TimeSpan(
                        (long)(this.DoubleValue * 10000.0d));
                case ModelValueType.Object:                
                    return mgr.GetReference(this.objectHandle)?.Object;
                case ModelValueType.Collection:
                    if (desiredType.IsArray)
                    {
                        Type elementType = desiredType.GetElementType();
                        Array arr = Array.CreateInstance(elementType, this.Collection.Length);
                        for (int i = 0; i < this.Collection.Length; i++)
                            arr.SetValue(this.Collection[i].ToCSValue(mgr, elementType), i);
                        return arr;
                    }
                    else if (desiredType.IsGenericType && typeof(IList).IsAssignableFrom(desiredType))
                    {
                        var coll = Activator.CreateInstance(desiredType) as IList;
                        Type elementType = desiredType.GetGenericArguments()[0];
                        for (int i = 0; i < this.Collection.Length; i++)
                            coll.Add(this.Collection[i].ToCSValue(mgr, elementType));
                        return coll;
                    }
                    break;
            }
            return null;
        }
    }
}
