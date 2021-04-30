using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net
{
    // DO NOT CHANGE THESE NUMBERS; ONLY ADD
    public enum ModelValueType : int
    {
        None = 0,

        /// <summary>
        /// Object handle (see <see cref="ModelValue.ObjectHandle"/>.
        /// </summary>
        Object = 1,

        String = 2,

        Int = 3,

        Long = 4,

        Float = 5,
        //Double = 6,

        Collection = 7,

        /// <summary>
        /// Data contained in <see cref="ModelValue.BoolValue"/>.
        /// </summary>
        Bool = 8,

        /// <summary>
        /// Data contained in <see cref="ModelValue.GuidValue"/>.
        /// </summary>
        Guid = 9,

        /// <summary>
        /// Always use UTC; timezone conversions must be made UI-side. 
        /// Uses .NET ticks. Data contained in <see cref="ModelValue.LongValue"/>
        /// </summary>
        DateTime = 10,

        /// <summary>
        /// Ticks; data in <see cref="ModelValue.LongValue"/>
        /// </summary>
        TimeSpan = 11,

        /// <summary>
        /// Avoid whenever possible, but sometimes there's it's just way
        /// more efficient to give the UI layer access to a raw data object from the
        /// model layer rather than force a binding to every single property.
        /// Just remember big booms occur when too much matter and antimatter 
        /// collide uncontrolled... 
        /// </summary>
        MarshalledObject = 12,

        // This only gets sent from model to client. Validation
        // message is contained in StringValue.
        ValidationError = int.MaxValue,
    }
}
