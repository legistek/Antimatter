using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;

namespace Antimatter.Net.Internal
{
    internal class NumberTypeConverter : TypeConverter
    {
        Type _destType;

        internal NumberTypeConverter(Type destType)
        {
            _destType = destType;
        }

        static HashSet<Type> _convertFroms = new HashSet<Type>
        {
            typeof(string),
            typeof(int),
            typeof(uint),
            typeof(long),
            typeof(ulong),            
            typeof(short),
            typeof(ushort),
            typeof(float),
            typeof(decimal),
            typeof(byte),
        };
        
        public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
        {
            return _convertFroms.Contains(sourceType);
        }

        public override bool CanConvertTo(ITypeDescriptorContext context, Type destinationType)
        {
            return false;
        }

        public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value)
        {
            if (_destType == typeof(double))
                return Convert.ToDouble(value);
            else if (_destType == typeof(int))
                return Convert.ToInt32(value);
            else if (_destType == typeof(long))
                return Convert.ToInt64(value);
            return null;
        }
    }
}
