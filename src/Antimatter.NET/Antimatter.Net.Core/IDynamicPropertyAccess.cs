using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Antimatter.Net
{
    public interface IDirectPropertyAccess
    {        
        bool TryGetValue(string property, out object value);
        bool TrySetValue(string property, object value);
        bool TryGetIndexedValue(object index, out object value);
        bool TrySetIndexedValue(object index, object value);
    }
}
