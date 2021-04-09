using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

namespace Antimatter.Net
{
    [StructLayout(LayoutKind.Explicit)]
    public class ModelValue
    {
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

        [FieldOffset(16)]
        private int objectHandle;
        public int ObjectHandle
        {
            get => objectHandle;
            set => objectHandle = value;
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
        
        [FieldOffset(24)]
        private ModelValue[] _collection;
        public ModelValue[] Collection
        {
            get => _collection;
            set => _collection = value;
        }

        public object ToCSValue(Reactor mgr)
        {
            switch (this.Type)
            {
                case ModelValueType.Double:
                    return this.DoubleValue;
                case ModelValueType.Float:
                    return this.FloatValue;
                case ModelValueType.Int:
                    return this.IntValue;
                case ModelValueType.Long:
                    return this.LongValue;
                case ModelValueType.String:
                    return this.StringValue;
                case ModelValueType.Object:
                    return mgr.GetReference(this.objectHandle)?.Object;
                case ModelValueType.Collection:
                    return mgr.GetReference(this.objectHandle)?.Object;
            }
            return null;
        }
    }
}
