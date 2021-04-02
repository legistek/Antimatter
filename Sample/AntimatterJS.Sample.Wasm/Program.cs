using System;
using System.Threading.Tasks;

using Antimatter.Net.Webassembly;

namespace AntimatterJS.Sample.WASM
{
    public class Program
    {
        public static async Task Main(string[] args)
        {                       
            Console.WriteLine($"C# WASM Antimatter App Server started!!");            
            var app = new AntimatterJS.Sample.AppModel.App();
            await app.StartAsync();            
            WebassemblyServer.Manager.RegisterRootObject("app", app);
        }
    }
}
