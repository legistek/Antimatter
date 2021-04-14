using System;
using System.IdentityModel.Tokens.Jwt;
using System.Threading.Tasks;

using Antimatter.Net.Webassembly;
using Legistek.Framework.API;
using Limine.Web;
using Limine.Core;

namespace AntimatterJS.Sample.WASM
{
    public class Program
    {
        public static async Task Main(string[] args)
        {                       
            Console.WriteLine($"C# WASM Antimatter App Server started!!");            
            var app = new AntimatterJS.Sample.AppModel.App();
            await app.StartAsync();

            var limine = LimineWebSession.Current;

            var hs = limine.GetHomeService("https://dev.limine.com/limineapi");
            var r = await hs.LoginAsync(new Limine.Core.API.LoginRequest
            {
                Login = "test@legistek.com",
                Password = "Test.1234",
                EmbedPassword = true,
                Product = Legistek.Framework.API.Product.LimineWeb,
            });
            Console.WriteLine($"Log in status: {r.InnerResult.LongMessageDebug}");

            JwtSecurityToken jwt = new JwtSecurityToken(r.Value.JWT);
            var claimDict = jwt.Claims.ToDictionarySafe(c => c.Type, c => c.Value);
            string xsrf = claimDict[AccountClaimTypes.Xsrf];
            Console.WriteLine($"XSRF-TOKEN: {xsrf}");

            //try
            //{
            //    var xsrf = JS.InvokeJS(
            //        "window.getCookie",
            //        "[\"XSRF-TOKEN\"]");
            //    Console.WriteLine($"XSRF-TOKEN: {xsrf}");
            //}
            //catch (Exception ex)
            //{
            //    Console.WriteLine($"Could not retrieve XSRF: {ex.Message}");
            //}

            LimineWebSession.Current.XSRFToken = xsrf;

            r = await limine.UI.StartupAsync();
            Console.WriteLine($"Startup status: {r.InnerResult.LongMessageDebug}");

            WebassemblyServer.Reactor.RegisterRootObject("app", app);
            WebassemblyServer.Reactor.RegisterRootObject("limine", limine);
        }
    }
}
