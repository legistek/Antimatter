using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using Antimatter.Net.SignalR;

namespace AntimatterJS.Sample.Client
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersWithViews();

            /*
             * Antimatter - Add for SignalR Server
             */
            services.AddSignalR();

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();

                /*
                 * Antimatter - Add for WASM Server
                 */
                app.UseWebAssemblyDebugging();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles(new StaticFileOptions
            {
                /*
                 * Antimatter - Add for all Servers
                 */
                ServeUnknownFileTypes = true
            });
            app.UseSpaStaticFiles(new StaticFileOptions
            {
                /*
                 * Antimatter - Add for all Servers
                 */
                ServeUnknownFileTypes = true
            });

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");

                /*
                 * Antimatter - Add for SignalR Server
                 */
                endpoints.MapHub<AntimatterRelay>("/interophub");

                Limine.Core.General.Initialize(Legistek.Framework.ClientType.BrowserBased);

                AntimatterRelay.StartupSession += async (mgr) =>
                {
                    var app = new AppModel.App();
                    await app.StartAsync();
                    mgr.RegisterRootObject("app", app);
                    mgr.RegisterSessionContext(app);

                    var limine = new Limine.Core.Session("https://devid.limine.com");
                    var hs = limine.GetHomeService("https://dev.limine.com/limineapi");
                    await hs.LoginAsync(new Limine.Core.API.LoginRequest
                    {
                        Login = "test@legistek.com",
                        Password = "Test.1234",
                        EmbedPassword = true,
                        Product = Legistek.Framework.API.Product.LimineWeb,
                    });
                    limine.UI.LimineSettings.ContentServerURL = "https://dev.limine.com/limineapi";

                    await limine.UI.StartupAsync();
                    mgr.RegisterRootObject("limine", limine);
                };
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";
                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
