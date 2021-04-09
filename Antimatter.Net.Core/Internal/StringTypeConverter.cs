using System;
using System.Reflection;
using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;

namespace Antimatter.Net.Internal
{
    internal class StringTypeConverter : TypeConverter
    {
        public override bool CanConvertTo(ITypeDescriptorContext context, Type destinationType)
        {
            return destinationType == typeof(string);
        }

        public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
        {
            return true;
        }

        public override object ConvertTo(
            ITypeDescriptorContext context, 
            CultureInfo culture, 
            object value, 
            Type destinationType)
        {
            if (destinationType != typeof(string))
                return null;
            return value?.ToString();
        }

        public override object ConvertFrom(
            ITypeDescriptorContext context, 
            CultureInfo culture, 
            object value)
        {
            return value?.ToString();
        }
    }
}
