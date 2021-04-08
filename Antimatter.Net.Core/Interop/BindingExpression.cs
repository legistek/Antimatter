using System;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Diagnostics;
using System.Reflection;

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

        public bool NotifyCollectionChanged { get; set; }

        public ObjectReference SourceReference { get; set; }

        private WeakReference _resolvedSource;
        public object ResolvedSource
        {
            get
            {
                return this._resolvedSource?.Target;
            }
            set
            {
                if (value == null)
                    this._resolvedSource = null;
                else
                    this._resolvedSource = new WeakReference(value);
            }
        }

        public string Path { get; set; }

        public void Unbind()
        {
            if (this.ResolvedSource is INotifyPropertyChanged inpc)
                inpc.PropertyChanged -= OnSourcePropertyChanged;

            ReleaseLastValue();
            this.ResolvedSource = null;
            this.SourceReference = null;
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

        public bool Apply(ObjectReference sourceRef)
        {
            // Always store this locally to make sure
            // it doesn't get GC'd out from under us
            var pocoSource = this.ResolvedSource = sourceRef.Object;

            if (pocoSource == null)
                return false;

            if (!string.IsNullOrEmpty(this.Path))
            {
                this._pi = pocoSource.GetType().GetProperty(this.Path);
                if (this._pi == null)
                {
                    Debug.WriteLine(
                        $"Binding Error: Could not find property {Path} " +
                        $"on type {pocoSource.GetType()}. Bindable properties must be public.");
                    return false;
                }
                if (pocoSource is INotifyPropertyChanged inpc)
                {
                    inpc.PropertyChanged += OnSourcePropertyChanged;
                }
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

        private void ReportSourcePropertyUpdate()
        {
            var obj = this.ResolvedSource;
            if (obj == null)
                return;

            var value = _pi?.GetValue(obj) ?? obj;

            if (this.NotifyCollectionChanged && value is INotifyCollectionChanged incc)
                incc.CollectionChanged += OnSourceCollectionChanged;

            // TODO - What if value is unchanged?
            ReleaseLastValue();

            var dnv = _manager.GetDotNetValue(value);
            _lastValue = dnv;

            Reactor.Client.UpdateBinding(this._manager.ClientID, this.BXIndex, dnv);
        }

        private void ReleaseLastValue()
        {
            if (_lastValue?.type == DotNetValueType.Object ||
                _lastValue?.type == DotNetValueType.Collection)
            {
                var reference = _manager.GetReference(_lastValue.objectHandle);
                if (reference != null && reference.Object is INotifyCollectionChanged oldIncc && this.NotifyCollectionChanged)
                    oldIncc.CollectionChanged -= OnSourceCollectionChanged;
            }
            _manager.Release(_lastValue);
            _lastValue = null;
        }

        private void OnSourceCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            ReportSourcePropertyUpdate();
        }
    }
}
