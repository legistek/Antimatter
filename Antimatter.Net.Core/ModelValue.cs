using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

namespace Antimatter.Net
{
    [StructLayout(LayoutKind.Explicit)]
    public class ModelValue
    {
        public static readonly ModelValue Null = new ModelValue
        {
            Type = ModelValueType.None
        };

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
        private string keyValue;
        public string KeyValue
        {
            get => keyValue;
            set => keyValue = value;
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

        //[FieldOffset(16)]
        //private double doubleValue;
        //public double DoubleValue
        //{
        //    get => doubleValue;
        //    set => doubleValue = value;
        //}

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

        internal object ToCSValue(Reactor mgr)
        {
            switch (this.Type)
            {                
                case ModelValueType.Float:
                    return this.FloatValue;
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
                    return new DateTime(this.LongValue, DateTimeKind.Utc);
                case ModelValueType.TimeSpan:
                    return new TimeSpan(this.LongValue);
                case ModelValueType.Object:
                case ModelValueType.Collection:
                    return mgr.GetReference(this.objectHandle)?.Object;
            }
            return null;
        }
    }
}
