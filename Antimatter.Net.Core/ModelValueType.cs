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
        
        Double = 6,

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
        /// This is milliseconds since January 1, 0001 12:00 AM UTC.
        /// (We don't use straight .NET ticks because BigInt support
        /// in Javascript is still sketchy on some older OS's, *cough*,
        /// Apple.) Since Javascript's max safe integer is 9 007 199 254 740 991, 
        /// (9 quadrillion) we are good until at least the year 285,616
        /// and even longer if millisecond precision is not needed.
        /// Data contained in <see cref="ModelValue.DoubleValue"/>.
        /// Remember timezone conversions must be made UI-side. 
        /// </summary>
        DateTime = 10,

        /// <summary>
        /// Substantive the same as <see cref="DateTime"/>. 
        /// </summary>
        TimeSpan = 11,

        /// <summary>
        /// Avoid whenever possible, but sometimes there's it's just way
        /// more efficient to give the UI layer access to a raw data object from the
        /// model layer rather than force a binding to every single property.
        /// Just remember big booms occur when too much matter and antimatter 
        /// collide uncontrolled... 
        /// </summary>
        JSON = 12,

        //
        // Values from 1000-2000 are reserved for specific platforms which
        // may have other means of communicating data.
        //
       
        // This only gets sent from model to client. Validation
        // message is contained in StringValue.
        ValidationError = int.MaxValue,
    }
}
