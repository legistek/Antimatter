using System;
using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;

namespace WebAssembly
{
	internal sealed class Runtime
	{
		/// <summary>
		/// Mono specific internal call.
		/// </summary>
		[MethodImpl(MethodImplOptions.InternalCall)]
		private static extern string InvokeJS(string str, out int exceptional_result);

		// Disable inlining to avoid the interpreter to evaluate an internal call that may not be available
		[MethodImpl(MethodImplOptions.NoInlining)]
		private static string MonoInvokeJS(string str, out int exceptionResult) => InvokeJS(str, out exceptionResult);

		// Disable inlining to avoid the interpreter to evaluate an internal call that may not be available
		[MethodImpl(MethodImplOptions.NoInlining)]
		private static string NetCoreInvokeJS(string str, out int exceptionResult)
			=> Runtime.InvokeJS(str, out exceptionResult);

		/// <summary>
		/// Invokes Javascript code in the hosting environment
		/// </summary>
		internal static string InvokeJS(string str)
		{
			var r = PlatformHelper.IsNetCore
			? NetCoreInvokeJS(str, out var exceptionResult)
			: MonoInvokeJS(str, out exceptionResult);

			if (exceptionResult != 0)
			{
				Console.Error.WriteLine($"Error #{exceptionResult} \"{r}\" executing javascript: \"{str}\"");
			}
			return r;
		}

		internal static bool IsNetCore
#if NET5_0
			 => true;
#else
			 => Type.GetType("System.Runtime.Loader.AssemblyLoadContext") != null;
#endif
	}

	internal class PlatformHelper
	{
		private static bool _isNetCore;
		private static bool _initialized;
		private static bool _isWebAssembly;

		internal static bool IsWebAssembly
		{
			get
			{
				EnsureInitialized();
				return _isWebAssembly;
			}
		}

		internal static bool IsNetCore
		{
			get
			{
				EnsureInitialized();
				return _isNetCore;
			}
		}

		/// <summary>
		/// Initialization is performed explicitly to avoid a mono/mono issue regarding .cctor and FullAOT
		/// see https://github.com/unoplatform/uno/issues/5395
		/// </summary>
		private static void EnsureInitialized()
		{
			if (!_initialized)
			{
				_initialized = true;

				_isNetCore = Type.GetType("System.Runtime.Loader.AssemblyLoadContext") != null;

				// Origin of the value : https://github.com/mono/mono/blob/a65055dbdf280004c56036a5d6dde6bec9e42436/mcs/class/corlib/System.Runtime.InteropServices.RuntimeInformation/RuntimeInformation.cs#L115
				_isWebAssembly =
					RuntimeInformation.IsOSPlatform(OSPlatform.Create("WEBASSEMBLY")) // Legacy Value (Bootstrapper 1.2.0-dev.29 or earlier).
					|| RuntimeInformation.IsOSPlatform(OSPlatform.Create("BROWSER"));
			}
		}
	}
}

namespace WebAssembly.JSInterop
{
	/// <summary>
	/// Methods that map to the functions compiled into the Mono WebAssembly runtime,
	/// as defined by 'mono_add_internal_call' calls in driver.c.
	/// </summary>
	internal static class InternalCalls
	{
		// The exact namespace, type, and method names must match the corresponding entries
		// in driver.c in the Mono distribution
		/// See: https://github.com/mono/mono/blob/90574987940959fe386008a850982ea18236a533/sdks/wasm/src/driver.c#L318-L319

		[MethodImpl(MethodImplOptions.InternalCall)]
		public static extern TRes InvokeJS<T0, T1, T2, TRes>(out string exception, ref JSCallInfo callInfo, [AllowNull] T0 arg0, [AllowNull] T1 arg1, [AllowNull] T2 arg2);
	}	
}
