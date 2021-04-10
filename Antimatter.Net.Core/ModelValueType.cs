using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net
{
    // DO NOT CHANGE THESE NUMBERS; ONLY ADD
    public enum ModelValueType : int
    {
        None = 0,
        Object = 1,
        String = 2,
        Int = 3,
        Long = 4,
        Float = 5,
        //Double = 6,
        Collection = 7,
        Bool = 8,
        Guid = 9,

        /// <summary>
        /// Always use UTC; conversions must be made client-side
        /// </summary>
        DateTime = 10,     
        
        TimeSpan = 11,

        // This only gets sent from model to client. Validation
        // message is contained in StringValue
        ValidationError = int.MaxValue,
    }
}
