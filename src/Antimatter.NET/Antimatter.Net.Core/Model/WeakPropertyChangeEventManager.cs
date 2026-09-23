using System;
using System.Linq;
using System.ComponentModel;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace Antimatter.Net
{
    public class WeakPropertyChangeEventManager
    {
		private static object _lock = new object();

		private WeakPropertyChangeEventManager() { }

		private static WeakPropertyChangeEventManager Manager { get; } = new WeakPropertyChangeEventManager();

		Dictionary<Type, List<WeakEventListener>> _listeners = new Dictionary<Type, List<WeakEventListener>>();
		ConditionalWeakTable<object, object> _cwt = new ConditionalWeakTable<object, object>();
		
		public static void Subscribe(INotifyPropertyChanged target, PropertyChangedEventHandler handler)
		{
			var listener = new WeakEventListener(target, handler);
			target.PropertyChanged -= Manager.OnTargetPropertyChanged;
			target.PropertyChanged += Manager.OnTargetPropertyChanged;
			lock (_lock)
			{
				Manager.AddHandlerToCWT(target, handler);
				var list = Manager.GetListenersLocked(target.GetType());
				list.Add(listener);
			}
		}

		public static void Unsubscribe(INotifyPropertyChanged target, PropertyChangedEventHandler handler)
		{
			var listener = new WeakEventListener(target, new EventHandler<PropertyChangedEventArgs>(handler));
			lock (_lock)
			{
				var list = Manager.GetListenersLocked(target.GetType());

				var match = list.FirstOrDefault(l => l.Matches(target, handler));
				if (match != null)
					list.Remove(match);
				Manager.RemoveHandlerFromCWT(target, handler);
			}
		}

		private void AddHandlerToCWT(object target, Delegate handler)
		{
			object value;
			if (!_cwt.TryGetValue(target, out value))
			{
				// 99% case - the target only listens once
				_cwt.Add(target, handler);
			}
			else
			{
				// 1% case - the target listens multiple times
				// we store the delegates in a list
				List<Delegate> list = value as List<Delegate>;
				if (list == null)
				{
					// lazily allocate the list, and add the old handler
					Delegate oldHandler = value as Delegate;
					list = new List<Delegate>();
					list.Add(oldHandler);

					// install the list as the CWT value
					_cwt.Remove(target);
					_cwt.Add(target, list);
				}

				// add the new handler to the list
				list.Add(handler);
			}
		}

		private void RemoveHandlerFromCWT(object target, Delegate handler)
		{
			object value;
			// remove the handler from the CWT
			if (_cwt.TryGetValue(target, out value))
			{
				List<Delegate> list = value as List<Delegate>;
				if (list == null)
				{
					// 99% case - the target is removing its single handler
					_cwt.Remove(target);
				}
				else
				{
					// 1% case - the target had multiple handlers, and is removing one
					list.Remove(handler);
					if (list.Count == 0)
					{
						_cwt.Remove(target);
					}
				}
			}
			else
			{
				// target has been GC'd.  This probably can't happen, since the
				// target initiates the Remove.  But if it does, there's nothing
				// to do - the target is removed from the CWT automatically,
				// and the weak-ref in the main list will be removed
				// at the next Purge.
			}
		}

		private List<WeakEventListener> GetListenersLocked(Type t)
		{
			List<WeakEventListener> list;
			if (!_listeners.TryGetValue(t, out list))
			{
				list = new List<WeakEventListener>();
				_listeners[t] = list;
			}
			return list;
		}

		private static int c_notifications = 0;

		private void OnTargetPropertyChanged(object sender, PropertyChangedEventArgs e)
		{
			List<WeakEventListener> listeners;
			lock (_lock)
			{
				listeners = new List<WeakEventListener>(GetListenersLocked(sender.GetType()));
			}
			
			foreach ( var listener in listeners )
			{
				if (object.ReferenceEquals(sender, listener.Target))
				{
					(listener.Handler as Delegate)?.DynamicInvoke(sender, e);
				}
			}

			c_notifications++;
		}
	}

	internal class WeakEventListener
	{
		private WeakReference _target;
		private WeakReference _handler;

		internal WeakEventListener(object target, Delegate handler)
		{
			_target = new WeakReference(target);
			_handler = new WeakReference(handler);
		}

		internal object Target => _target.Target;

		internal Delegate Handler => _handler?.Target as Delegate;
		
		internal bool Matches(object target, Delegate handler)
		{
			return object.ReferenceEquals(target, this.Target) &&
				object.Equals(handler, this.Handler);
		}
	}
}
