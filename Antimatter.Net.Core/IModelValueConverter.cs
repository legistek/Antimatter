using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net
{
    public interface IModelValueConverter
    {
        ModelValue ConvertTo(object obj);
        object ConvertFrom(ModelValue value);
    }
}
