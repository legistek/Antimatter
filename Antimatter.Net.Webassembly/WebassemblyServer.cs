using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;

using Antimatter.Net.Interop;

namespace Antimatter.Net.Webassembly
{
    public static class WebassemblyServer
    {
        static WebassemblyServer()
        {
            Reactor.Client = new Client();
        }

        public static readonly ObjectManager Manager = new ObjectManager(null);

        public static void Bind(int netRef, string path, int bxIndex, bool notifyCollectionChanged)
        {
            Manager.Bind(netRef, path, bxIndex, notifyCollectionChanged);            
        }

        public static void UpdateBindingSource(int bxIndex, string valueJson)
        {
            var value = JsonSerializer.Deserialize<DotNetValue>(valueJson);
            Manager.UpdateBindingSource(bxIndex, value);
        }

        public static int GetRootObject(string identifier)
        {
            return Manager.GetRootObject(identifier);
        }

        public static void ExecuteICommand(int netRef)
        {
            Manager.ExecuteICommand(netRef);
        }
    }
}
