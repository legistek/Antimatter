using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

namespace Antimatter.Net.Webassembly
{
    public static class WebassemblyServer
    {
        static WebassemblyServer()
        {
            WebAssemblyHostBuilder.CreateDefault(); // need this to ensure dlls are included
            Reactor.Initialize(new Client());
        }

        public static readonly Reactor Reactor = new Reactor(null);

        [AMXClientInvocable]
        public static void Bind(int netRef, string path, int bxIndex, bool notifyCollectionChanged, bool marshalValue)
        {
            Reactor.Bind(netRef, path, bxIndex, notifyCollectionChanged, marshalValue);
        }

        [AMXClientInvocable]
        public static void Unbind(int bxIndex)
        {
            Reactor.Unbind(bxIndex);
        }

        [AMXClientInvocable]
        public static void UpdateBindingSource(int bxIndex, string valueJson)
        {
            var value = JsonConvert.DeserializeObject<ModelValue>(valueJson);
            Reactor.UpdateBindingSource(bxIndex, value);
        }

        [AMXClientInvocable]
        public static int GetRootObject(string identifier)
        {
            return Reactor.GetRootObject(identifier);
        }

        [AMXClientInvocable]
        public static void ExecuteICommand(int netRef, string commandParameterJson)
        {
            var value = JsonConvert.DeserializeObject<ModelValue>(commandParameterJson);
            Reactor.ExecuteICommand(netRef, value);
        }
    }
}
