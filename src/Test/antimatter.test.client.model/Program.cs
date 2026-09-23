using Antimatter.Net.Webassembly;

namespace antimatter.test.client.model
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine($"C# WASM Antimatter App Server started!!");
            var app = new AntimatterJS.Sample.AppModel.App();
            app.Start();
            WebassemblyReactor.Reactor.RegisterRootObject("app", app);
            WebassemblyReactor.Reactor.RegisterSessionContext(app);
            await WebassemblyReactor.Reactor.StartupAsync();
            Console.WriteLine($"C# WASM Antimatter App Startup Complete!!");
        }
    }
}
