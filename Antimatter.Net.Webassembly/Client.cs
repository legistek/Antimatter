using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Newtonsoft.Json;

using Antimatter.Net.Internal;

namespace Antimatter.Net.Webassembly
{
    public class Client : IClient
    {
        public void UpdateBinding(string clientid, int bxIndex, ModelValue value)
        {
            JS.InvokeUnmarshalled<int, object, object, object>(
                "window.AntimatterServer.UpdateBinding",
                bxIndex,
                value,
                null);
        }

        public void NavigateTo(string clientid, string route)
        {
            JS.InvokeJS(
                "window.AntimatterServer.NavigateTo",
                $"[\"{route}\"]");
        }

        public ModelValue MarshalObject(object obj)
        {
            try
            {
                return new ModelValue
                {
                    Type = ModelValueType.MarshalledObject,
                    StringValue = JsonConvert.SerializeObject(obj)
                };
            }
            catch (Exception ex)
            {
                return ModelValue.Null;
            }
        }
    }
}
