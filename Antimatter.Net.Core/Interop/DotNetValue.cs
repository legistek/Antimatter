using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

namespace Antimatter.Net.Interop
{
    [StructLayout(LayoutKind.Explicit)]
    public class DotNetValue
    {
        [FieldOffset(0)]
        public DotNetValueType type;
        public DotNetValueType Type
        {
            get => type;
            set => type = value;
        }

        [FieldOffset(8)]
        public string stringValue;
        public string StringValue
        {
            get => stringValue;
            set => stringValue = value;
        }

        [FieldOffset(16)]
        public int objectHandle;
        public int ObjectHandle
        {
            get => objectHandle;
            set => objectHandle = value;
        }

        [FieldOffset(16)]
        public float floatValue;
        public float FlatValue
        {
            get => floatValue;
            set => floatValue = value;
        }

        [FieldOffset(16)]
        public double doubleValue;
        public double DoubleValue
        {
            get => doubleValue;
            set => doubleValue = value;
        }

        [FieldOffset(16)]
        public int intValue;
        public int IntValue
        {
            get => intValue;
            set => intValue = value;
        }

        [FieldOffset(16)]
        public long longValue;
        public long LongValue
        {
            get => longValue;
            set => longValue = value;
        }
        
        [FieldOffset(24)]
        private DotNetValue[] _collection;
        public DotNetValue[] Collection
        {
            get => _collection;
            set => _collection = value;
        }

        public object ToCSValue(ObjectManager mgr)
        {
            switch (this.type)
            {
                case DotNetValueType.Double:
                    return this.doubleValue;
                case DotNetValueType.Float:
                    return this.floatValue;
                case DotNetValueType.Int:
                    return this.intValue;
                case DotNetValueType.Long:
                    return this.longValue;
                case DotNetValueType.String:
                    return this.stringValue;
                case DotNetValueType.Object:
                    return mgr.GetReference(this.objectHandle)?.Object;
                case DotNetValueType.Collection:
                    return mgr.GetReference(this.objectHandle)?.Object;
            }
            return null;
        }
    }
}
