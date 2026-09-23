using System;

namespace Antimatter.Net.Converters
{
    public class TimeSpanToStringConverter : IModelValueConverter
    {
        public TimeSpanToStringConverter(bool simplifiedForm = false)
        {
            _simplifiedForm = simplifiedForm;
        }

        //Use shortened format without all the placeholders ("M:SS" vs. "HH:MM:SS")
        private bool _simplifiedForm;

        public Type TargetType => typeof(string);

        public object ConvertTo(object obj)
        {

            if (!(obj is TimeSpan t))
                return null;

            string minuteFormat = _simplifiedForm ? "0" : "00";
            string mm = t.Minutes.ToString(minuteFormat);
            string ss = t.Seconds.ToString("00");
            string result = $"{mm}:{ss}";

            if (t.TotalHours > 1.0 || !_simplifiedForm)
            {
                string hh = t.TotalHours.ToString("00");
                result = $"{hh}:{result}";
            }

            return result;
        }

        public object ConvertFrom(object value)
        {
            return null;
        }
    }
}
