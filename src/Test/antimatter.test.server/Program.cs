using Antimatter.Net.Hosting;

namespace ReactFun2026_07.Server
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();

            // The SPA is served THROUGH this server in development (see UseSpa below),
            // so the browser stays on this origin instead of being redirected to the
            // Vite dev server's own origin.
            builder.Services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "wwwroot";
            });

            var app = builder.Build();

            if (builder.Environment.IsDevelopment())
            {
                app.UseWebAssemblyDebugging();
            }

            // Configure the HTTP request pipeline.

            app.UseHttpsRedirection();

            // Fingerprinted assets under _framework are normally served with
            // "max-age=31536000, immutable". In development that is actively
            // harmful: after a rebuild the fingerprints change, but a browser
            // holding a cached boot manifest keeps requesting the OLD names and
            // gets 404s - and because the responses are marked immutable, Chrome
            // will not revalidate, so an ordinary refresh never recovers. Only a
            // reload with the cache disabled does.
            //
            // Must run before UseBlazorFrameworkFiles/UseStaticFiles so the header
            // is overwritten after they set theirs.
            if (app.Environment.IsDevelopment())
            {
                app.Use(async (context, next) =>
                {
                    context.Response.OnStarting(() =>
                    {
                        context.Response.Headers.CacheControl = "no-store, no-cache, must-revalidate";
                        context.Response.Headers.Pragma = "no-cache";
                        context.Response.Headers.Remove("ETag");
                        context.Response.Headers.Remove("Last-Modified");
                        return Task.CompletedTask;
                    });
                    await next();
                });
            }

            // Serves _framework/* (blazor.webassembly.js, the runtime and the
            // referenced assemblies) from the Blazor WebAssembly project. Must
            // precede the static file middleware.
            //
            // Note: MapStaticAssets() is deliberately NOT used here. It builds
            // routing endpoints from the static web asset manifest, which now
            // includes the referenced WASM project's _framework/* files. Those
            // requests are handled by the static file middleware below, so the
            // matched endpoint is never executed and the pipeline throws
            // "reached the end of the pipeline without executing the endpoint".
            app.UseBlazorFrameworkFiles();

            app.UseDefaultFiles();
            app.UseStaticFiles(new StaticFileOptions
            {
                /*
                 * Antimatter - Add for all Servers
                 */
                ServeUnknownFileTypes = true
            });

            app.UseRouting();
            app.UseAuthorization();


            // Must be UseEndpoints, not MapControllers. UseSpa below is terminal
            // middleware, and WebApplication auto-appends the endpoint middleware to
            // the very END of the pipeline - after UseSpa. Controller endpoints would
            // be matched by routing but never executed, and every API call would fall
            // through to the SPA proxy instead. Executing endpoints here runs them
            // before the SPA middleware gets the request.
            app.UseEndpoints(endpoints => endpoints.MapControllers());

            // Everything not handled above goes to the SPA. In development this
            // PROXIES to the Vite dev server rather than redirecting the browser to
            // it, so the app is served entirely from this origin - which is what lets
            // a single browser host both the Blazor WASM debugger and Visual Studio's
            // ASP.NET JavaScript debugging.
            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "./ClientApp";

                if (app.Environment.IsDevelopment())
                {
                    // Starts the webpack dev server and proxies to it, gating each
                    // request on it actually listening rather than blocking startup.
                    spa.UseGenericSpaDevelopmentServer(
                        "https://localhost:44317",
                        "dev");
                }
            });

            app.Run();
        }
    }
}
