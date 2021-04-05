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
        bool _suspendPropertyChangeReport;

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

        public void UpdateSource(DotNetValue value)
        {
            this._suspendPropertyChangeReport = true;
            try
            {
                var rs = this.ResolvedSource;
                if (this._pi == null || rs == null)
                    return;
                var val = value.ToCSValue(this._manager);
                this._pi.SetValue(rs, val);
            }
            finally
            {
                this._suspendPropertyChangeReport = false;
            }
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
                inpc.PropertyChanged += OnSourcePropertyChanged; ;
            }

            // Notify the binding target of the new value just as 
            // if it had changed.
            ReportSourcePropertyUpdate();

            return true;
        }

        private void OnSourcePropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (this._suspendPropertyChangeReport || e.PropertyName != this.Path)
                return;
            ReportSourcePropertyUpdate();
        }

        private void Unapply()
        {
        }

        private void ReportSourcePropertyUpdate()
        {
            var obj = this.ResolvedSource;
            if (obj == null)
                return;

            var value = _pi.GetValue(obj);
            var dnv = _manager.GetDotNetValue(value);

            // TODO - What if value is unchanged?

            if (_lastValue?.type == DotNetValueType.Object)
            {
                _manager.GetReference(_lastValue.objectHandle)?.Release(this._manager);
            }

            _lastValue = dnv;

            Reactor.Client.UpdateBinding(this._manager.ClientID, this.BXIndex, dnv);
        }
    }
}
