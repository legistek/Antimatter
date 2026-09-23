using System.Diagnostics;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Runtime.Versioning;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Antimatter.Net.Hosting
{
    /// <summary>
    /// Starts the webpack dev server as a hidden child process and proxies the SPA
    /// to it.
    ///
    /// SpaProxy (SpaProxyLaunchCommand) is not used here: it redirects the browser to
    /// the dev server's own origin, and two origins means the Blazor WASM debugger and
    /// the JavaScript debugger end up in two different browser windows. This server
    /// proxies to the dev server instead, so it also has to own its lifetime.
    ///
    /// Readiness is resolved PER REQUEST rather than at startup. Kestrel binds and
    /// serves _framework immediately; only requests that actually need the dev server
    /// wait for it. That is what removes the "connection refused on xxxxx" race - the
    /// first request blocks until webpack is listening instead of failing.
    /// </summary>
    public static class SpaDevelopmentServer
    {
        /// <summary>
        /// Runs "npm run {npmScript}" in the SPA source path and proxies to
        /// <paramref name="devServerUrl"/> once it is accepting connections.
        /// </summary>
        public static void UseGenericSpaDevelopmentServer(
            this ISpaBuilder spaBuilder,
            string devServerUrl,
            string npmScript)
        {
            ArgumentNullException.ThrowIfNull(spaBuilder);

            var sourcePath = spaBuilder.Options.SourcePath;
            if (string.IsNullOrEmpty(sourcePath))
            {
                throw new InvalidOperationException(
                    $"To use {nameof(UseGenericSpaDevelopmentServer)} you must set " +
                    $"{nameof(SpaOptions)}.{nameof(SpaOptions.SourcePath)} when calling UseSpa.");
            }

            var uri = new Uri(devServerUrl);
            var services = spaBuilder.ApplicationBuilder.ApplicationServices;

            var logger = services
                .GetRequiredService<ILoggerFactory>()
                .CreateLogger(nameof(SpaDevelopmentServer));

            var environment = services.GetRequiredService<IWebHostEnvironment>();
            var lifetime = services.GetRequiredService<IHostApplicationLifetime>();

            var root = Path.GetFullPath(
                Path.Combine(environment.ContentRootPath, sourcePath));

            // Kick the dev server off now so it is compiling while the rest of the
            // pipeline builds, but do NOT wait for it here.
            var ready = StartAsync(root, npmScript, uri.Port, logger, lifetime);

            var timeout = spaBuilder.Options.StartupTimeout;

            SpaProxyingExtensions.UseProxyToSpaDevelopmentServer(spaBuilder, async () =>
            {
                // Each request gets its own timeout against the shared startup task,
                // so one slow compile does not permanently poison the proxy - a
                // request that times out fails alone and the next one tries again.
                try
                {
                    await ready.WaitAsync(timeout);
                }
                catch (TimeoutException)
                {
                    throw new InvalidOperationException(
                        $"The webpack dev server did not start listening on {uri} within " +
                        $"{timeout.TotalSeconds} seconds. Check the log output above for " +
                        "compilation errors.");
                }

                return uri;
            });
        }

        private static async Task StartAsync(
            string root,
            string npmScript,
            int port,
            ILogger logger,
            IHostApplicationLifetime lifetime)
        {
            if (IsListening(port))
            {
                logger.LogInformation(
                    "SPA dev server already listening on {Port}; not starting another.",
                    port);
                return;
            }

            if (!Directory.Exists(root))
                throw new InvalidOperationException($"SPA source path not found: {root}");

            var startInfo = new ProcessStartInfo
            {
                // cmd /c so that npm.cmd resolves through PATH the same way it would
                // in a terminal. Streams are redirected so the output lands in the
                // Visual Studio Output window instead of a separate console.
                FileName = "cmd.exe",
                Arguments = $"/c npm run {npmScript}",
                WorkingDirectory = root,
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            };

            var process = Process.Start(startInfo)
                ?? throw new InvalidOperationException("Process.Start returned null.");

            process.OutputDataReceived += (_, e) =>
            {
                if (!string.IsNullOrWhiteSpace(e.Data)) logger.LogInformation("{Line}", e.Data);
            };
            process.ErrorDataReceived += (_, e) =>
            {
                if (!string.IsNullOrWhiteSpace(e.Data)) logger.LogWarning("{Line}", e.Data);
            };
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            logger.LogInformation(
                "SPA dev server starting (pid {Pid}) in {Root} on port {Port}.",
                process.Id, root, port);

            // Belt: the OS kills the whole tree if WE die without running any
            // shutdown code at all - "Stop Debugging" in Visual Studio, taskkill /F,
            // or a crash. ApplicationStopping below does not fire in those cases,
            // which is how node survives and keeps the port held.
            KillTreeWhenThisProcessDies(process, logger);

            // Braces: on a graceful shutdown this stops the tree immediately rather
            // than waiting for our own process handle to be released.
            lifetime.ApplicationStopping.Register(() =>
            {
                try
                {
                    if (!process.HasExited) process.Kill(entireProcessTree: true);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Could not stop the SPA dev server.");
                }
            });

            // Ready means "accepting connections", not "printed something". npm echoes
            // its own banner lines seconds before webpack binds, so keying off output -
            // any output, or even "compiled successfully" - either fires too early or
            // depends on log formatting that stats/infrastructureLogging settings can
            // suppress. The socket is the thing the proxy actually needs.
            while (!IsListening(port))
            {
                if (process.HasExited)
                {
                    throw new InvalidOperationException(
                        $"The npm script '{npmScript}' exited with code {process.ExitCode} " +
                        "without listening for requests. See the log output above.");
                }

                await Task.Delay(250);
            }

            logger.LogInformation("SPA dev server is listening on {Port}.", port);
        }

        /// <summary>
        /// Places the child in a Windows job object marked KILL_ON_JOB_CLOSE. The
        /// only handle to that job is held by this process, so when this process
        /// exits - gracefully or not - the kernel closes the handle and terminates
        /// every process in the job, including the node grandchildren that npm
        /// spawned.
        /// </summary>
        private static void KillTreeWhenThisProcessDies(Process process, ILogger logger)
        {
            if (!OperatingSystem.IsWindows())
                return;

            try
            {
                if (!AssignToKillOnCloseJob(process))
                    logger.LogWarning(
                        "Could not place the SPA dev server in a job object; it may " +
                        "outlive this process if the process is killed abruptly.");
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Could not place the SPA dev server in a job object.");
            }
        }

        // Held for the lifetime of the process. Letting this go out of scope would
        // close the job handle and kill the dev server immediately.
        private static IntPtr _job = IntPtr.Zero;

        [SupportedOSPlatform("windows")]
        private static bool AssignToKillOnCloseJob(Process process)
        {
            if (_job == IntPtr.Zero)
            {
                _job = CreateJobObject(IntPtr.Zero, null);
                if (_job == IntPtr.Zero)
                    return false;

                var info = new JOBOBJECT_EXTENDED_LIMIT_INFORMATION
                {
                    BasicLimitInformation = new JOBOBJECT_BASIC_LIMIT_INFORMATION
                    {
                        LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
                    }
                };

                var length = Marshal.SizeOf<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>();
                var ptr = Marshal.AllocHGlobal(length);
                try
                {
                    Marshal.StructureToPtr(info, ptr, false);
                    if (!SetInformationJobObject(
                            _job, JobObjectExtendedLimitInformation, ptr, (uint)length))
                    {
                        return false;
                    }
                }
                finally
                {
                    Marshal.FreeHGlobal(ptr);
                }
            }

            return AssignProcessToJobObject(_job, process.Handle);
        }

        private const int JobObjectExtendedLimitInformation = 9;
        private const uint JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x2000;

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern IntPtr CreateJobObject(IntPtr securityAttributes, string? name);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool SetInformationJobObject(
            IntPtr job, int infoClass, IntPtr info, uint infoLength);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);

        [StructLayout(LayoutKind.Sequential)]
        private struct JOBOBJECT_BASIC_LIMIT_INFORMATION
        {
            public long PerProcessUserTimeLimit;
            public long PerJobUserTimeLimit;
            public uint LimitFlags;
            public UIntPtr MinimumWorkingSetSize;
            public UIntPtr MaximumWorkingSetSize;
            public uint ActiveProcessLimit;
            public UIntPtr Affinity;
            public uint PriorityClass;
            public uint SchedulingClass;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct IO_COUNTERS
        {
            public ulong ReadOperationCount;
            public ulong WriteOperationCount;
            public ulong OtherOperationCount;
            public ulong ReadTransferCount;
            public ulong WriteTransferCount;
            public ulong OtherTransferCount;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct JOBOBJECT_EXTENDED_LIMIT_INFORMATION
        {
            public JOBOBJECT_BASIC_LIMIT_INFORMATION BasicLimitInformation;
            public IO_COUNTERS IoInfo;
            public UIntPtr ProcessMemoryLimit;
            public UIntPtr JobMemoryLimit;
            public UIntPtr PeakProcessMemoryUsed;
            public UIntPtr PeakJobMemoryUsed;
        }

        private static bool IsListening(int port)
        {
            try
            {
                using var client = new TcpClient();
                return client.ConnectAsync("localhost", port).Wait(TimeSpan.FromMilliseconds(500))
                    && client.Connected;
            }
            catch
            {
                return false;
            }
        }
    }
}
