using System;
using System.Collections.Generic;
using System.Text;

using Antimatter.Net.Interop;

namespace Antimatter.Net
{
    public interface IClient
    {
        void UpdateBinding(string clientID, int bxIndex, DotNetValue value);
    }
}
