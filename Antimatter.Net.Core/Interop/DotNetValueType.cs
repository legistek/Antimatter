using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net.Interop
{
    // DO NOT CHANGE THESE NUMBERS; ONLY ADD
    public enum DotNetValueType : int
    {
        None = 0,
        Object = 1,
        String = 2,
        Int = 3,
        Long = 4,
        Float = 5,
        Double = 6,
        Collection = 7,
    }
}
