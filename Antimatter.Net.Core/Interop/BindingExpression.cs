using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Antimatter.Net.Interop
{
    internal class BindingExpression
    {        
        PropertyInfo _pi;
        DotNetValue _lastValue;
        ObjectManager _manager;

        internal BindingExpression(ObjectManager manager)
        {
            _manager = manager;
        }

        public int BXIndex { get; set; }

        public ObjectReference SourceObjectReference { get; set; }

        private WeakReference _resolvedSource;
        public object ResolvedSource
        {
            get
            {
                return this._resolvedSource?.Target;
            }
            set
            {
                this._resolvedSource = new WeakReference(value);
            }
        }

        public string Path { get; set; }

        public void Unbind(int index)
        {
        }

        public bool Apply()
        {
            // Always store this locally to make sure
            // it doesn't get GC'd out from under us
            var source = this.ResolvedSource = this.SourceObjectReference.Object;

            if (source == null)
                return false;

            this._pi = source.GetType().GetProperty(this.Path);
            if (this._pi == null)
            {
                Debug.WriteLine(
                    $"Binding Error: Could not find property {Path} " +
                    $"on type {source.GetType()}. Bindable properties must be public.");
                return false;
            }

            if (source is INotifyPropertyChanged inpc)
            {
                inpc.PropertyChanged += OnSourcePropertyChanged;
            }

            // Notify the binding target of the new value just as 
            // if it had changed.
            OnSourcePropertyChanged(
                this.ResolvedSource, 
                new PropertyChangedEventArgs(this.Path));

            return true;
        }

        private void Unapply()
        {
        }

        private void OnSourcePropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (e.PropertyName != this.Path)
                return;

            var obj = this.ResolvedSource;
            if (obj == null)
                return;

            var value = _pi.GetValue(obj);
            var dnv = _manager.GetDotNetValue(value);

            // TODO - What if value is unchanged?

            if (_lastValue?.Type == DotNetValueType.Object)
            {
                _manager.GetReference(_lastValue.ObjectHandle)?.Release(this._manager);
            }

            _lastValue = dnv;

            Reactor.Client.UpdateBinding(this._manager.ClientID, this.BXIndex, dnv);
        }
    }
}
