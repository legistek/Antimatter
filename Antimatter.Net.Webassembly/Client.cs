using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Antimatter.Net.Interop;

namespace Antimatter.Net.Webassembly
{
    public class Client : IClient
    {
        public void UpdateBinding(string clientid, int bxIndex, DotNetValue value)
        {
            JS.InvokeUnmarshalled<int, object, object, object>(
                "window.AntimatterServer.UpdateBinding",
                bxIndex,
                value,
                null);
        }
    }
}
