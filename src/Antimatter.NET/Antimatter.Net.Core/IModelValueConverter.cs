using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net
{
    public interface IModelValueConverter
    {
        /// <summary>
        /// Converts a Model-side value to a value more suited to the UI.
        /// </summary>
        /// <param name="obj">The Model-side value.</param>
        /// <returns>
        /// An alternative value (still C#) that can be consumed by the UI.
        /// </returns>
        object ConvertTo(object obj);

        /// <summary>
        /// Converts a UI-provided <see cref="ModelValue"/> to a 
        /// value compatible with the model
        /// </summary>
        /// <param name="value">The UI-provided value.</param>
        object ConvertFrom(object value);

        /// <summary>
        /// The C# <see cref="Type"/> of the objects that this converter converts to
        /// and expects to be converted from.
        /// </summary>
        Type TargetType { get; }
    }
}
