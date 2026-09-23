using Antimatter.Net;
using System;

namespace Antimatter.Net.Converters
{
    public class ToLocalDateTimeDisplayConverter : IModelValueConverter
    {
        public ToLocalDateTimeDisplayConverter(bool dateOnly = false)
        {
            _dateOnly = dateOnly;
        }

        private bool _dateOnly;

        public Type TargetType => typeof(string);

        public object ConvertTo(object obj)
        {
            DateTime dt;
            if (obj is DateTime d)
                dt = d;
            else if (obj is DateTimeOffset dto)
                dt = dto.UtcDateTime;
            else            
                return null;

            if (_dateOnly)
                return dt.ToLocalTime().ToShortDateString();
            return dt.ToLocalTime().ToString();
        }

        public object ConvertFrom(object value)
        {
            if (!(value is string st))
                return null;

            if (DateTime.TryParse(st, out DateTime dt))
                return dt;
            return null;
        }
    }
}
