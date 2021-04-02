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
        public DotNetValueType Type;

        [FieldOffset(8)]
        public string StringValue;

        [FieldOffset(16)]
        public int ObjectHandle;

        [FieldOffset(16)]
        public float FloatValue;

        [FieldOffset(16)]
        public double DoubleValue;

        [FieldOffset(16)]
        public int IntValue;

        [FieldOffset(16)]
        public long LongValue;
    }
}
