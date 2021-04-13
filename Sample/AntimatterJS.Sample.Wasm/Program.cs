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

            var limine = new Limine.Core.Session();
            var hs = limine.GetHomeService("https://dev.limine.com/limineapi");
            var r = await hs.LoginAsync(new Limine.Core.API.LoginRequest
            {
                Login = "test@legistek.com",
                Password = "Test.1234",
                EmbedPassword = true,
                Product = Legistek.Framework.API.Product.LimineWeb,
            });
            Console.WriteLine($"Log in status: {r.Message}");

            r = await limine.UI.StartupAsync();
            Console.WriteLine($"Startup status: {r.Message}");

            WebassemblyServer.Reactor.RegisterRootObject("app", app);
            WebassemblyServer.Reactor.RegisterRootObject("limine", limine);
        }
    }
}
