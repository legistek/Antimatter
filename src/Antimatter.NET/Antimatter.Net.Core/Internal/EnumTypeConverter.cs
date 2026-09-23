using System;
using System.Collections.Generic;
using System.Reflection;
using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;

namespace Antimatter.Net.Internal
{
    internal class EnumTypeConverter<T> : TypeConverter
    {
        static Dictionary<string, T> _enumValues = new Dictionary<string, T>();

        static EnumTypeConverter()
        {
            var names = typeof(T).GetEnumNames();
            foreach (var name in names)
            {
                _enumValues[name] = (T)Enum.Parse(typeof(T), name);
            }
        }

        public override bool CanConvertFrom(
            ITypeDescriptorContext context, 
            Type sourceType)
        {
            if (sourceType == typeof(string))
                return true;
            return base.CanConvertFrom(context, sourceType);
        }

        public override object ConvertFrom(
            ITypeDescriptorContext context, 
            CultureInfo culture, 
            object value)
        {
            if (value is string s)
            {
                if (_enumValues.TryGetValue(s, out T enumVal))
                    return enumVal;
            }
            return null;
            // return base.ConvertFrom(context, culture, value);
        }
    }
}
