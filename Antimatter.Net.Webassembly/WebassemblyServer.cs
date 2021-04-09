using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;

namespace Antimatter.Net.Webassembly
{
    public static class WebassemblyServer
    {
        static WebassemblyServer()
        {
            Reactor.Initialize(new Client());
        }

        public static readonly Reactor Reactor = new Reactor(null);

        [AMXClientInvocable]
        public static void Bind(int netRef, string path, int bxIndex, bool notifyCollectionChanged)
        {
            Reactor.Bind(netRef, path, bxIndex, notifyCollectionChanged);            
        }

        [AMXClientInvocable]
        public static void Unbind(int bxIndex)
        {
            Reactor.Unbind(bxIndex);
        }

        [AMXClientInvocable]
        public static void UpdateBindingSource(int bxIndex, string valueJson)
        {
            var value = JsonSerializer.Deserialize<ModelValue>(valueJson);
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
            var value = JsonSerializer.Deserialize<ModelValue>(commandParameterJson);
            Reactor.ExecuteICommand(netRef, value);
        }
    }
}
