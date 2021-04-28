using System;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;

namespace Antimatter.Net.Internal
{
    internal class BindingExpression
    {        
        ModelValue _lastValue;
        Reactor _reactor;
        bool _suspendPropertyChangeReport;
        
        internal BindingExpression(Reactor manager, string path)
        {
            _reactor = manager;
            this.Path = path;
            this.ParsePath();
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

        public string Path { get; }

        public void Unbind()
        {
            UnsubscribePropertyChange(0);
            ReleaseLastValue();
            this.ResolvedSource = null;
            this.SourceReference = null;
        }

        public void UpdateSource(ModelValue value)
        {
            this._suspendPropertyChangeReport = true;
            try
            {
                if (!(this.PathComponents.Length > 0))
                    // No two-way binding if no path
                    return;
                this.PathComponents.Last()
                    .OnTargetPropertyChanged(value, _reactor);                
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
            
            SubscribePropertyChange(0);

            // Notify the binding target of the new value just as 
            // if it had changed.
            SetTargetValue(0);

            return true;
        }

        internal PathComponent[] PathComponents
        {
            get;
            set;
        }

        internal void SetEffectiveValue(int pathStart)
        {
            UnsubscribePropertyChange(pathStart);
            this.SetTargetValue(pathStart);
            SubscribePropertyChange(pathStart);
        }

        private object SetTargetValue(int pathStart)
        {           
            object newVal = null;
            newVal = this.GetEffectiveValue(pathStart);
            this.ReportSourcePropertyUpdate(newVal);
            return newVal;
        }

        private void UnsubscribePropertyChange(int pathStart)
        {
            if (!(this.PathComponents?.Length > 0))
                return;

            for (int i = pathStart; i < this.PathComponents.Length; i++)
                this.PathComponents[i].Unsubscribe();
            if (this.PathComponents.Last().LastPropertySource is INotifyDataErrorInfo oldIndei)
            {
                oldIndei.ErrorsChanged -= OnSourceValidationError;
            }
        }

        private void SubscribePropertyChange(int pathStart)
        {
            if (!(this.PathComponents?.Length > 0))
                return;
            TraversePath(pathStart, (source, pathComponent) =>
            {
                pathComponent.SubscribePropertyChange(source, false);
            });
            if (this.PathComponents.Last().LastPropertySource is INotifyDataErrorInfo indei)
            {
                indei.ErrorsChanged += OnSourceValidationError;
            }
        }

        private object GetEffectiveValue(int pathStart)
        {            
            if (!(this.PathComponents?.Length > 0))
                return this.ResolvedSource;

            object effectiveValueSource = null;
            TraversePath(pathStart, (o, component) =>
            {
                effectiveValueSource = o;
            });

            if (effectiveValueSource == null)
                return null;

            return this.PathComponents.Last().PropertyKey?.GetValue(effectiveValueSource);
        }

        private void ParsePath()
        {
            int index = 0;
            this.PathComponents = this.Path
                ?.Split(
                    new char[] { '.', '[' },
                    StringSplitOptions.RemoveEmptyEntries)
                ?.Select(component =>
                {
                    if (component.EndsWith("]"))
                        return new PathComponent
                        {
                            Index = index++,
                            Binding = this,
                            ComponentName = "[" + component
                        };
                    else
                        return new PathComponent
                        {
                            Index = index++,
                            Binding = this,
                            ComponentName = component
                        };
                })
                ?.ToArray();
        }

        internal void ReportValidationError(string message)
        {
            Reactor.Client.UpdateBinding(
                this._reactor.ClientID,
                this.BXIndex,
                new ModelValue
                {
                    Type = ModelValueType.ValidationError,
                    StringValue = message
                });
        }

        internal void ReportSourcePropertyUpdate(object value)
        {
            if (_suspendPropertyChangeReport)
                return;

            if (this.NotifyCollectionChanged && value is INotifyCollectionChanged incc)
                incc.CollectionChanged += OnSourceCollectionChanged;

            // TODO - What if value is actually unchanged (but collections?)
            var dnv = _reactor.GetModelValue(value);   // do this first
            ReleaseLastValue(); // now release old to avoid unnecessary release if overlap
            _lastValue = dnv;

            Reactor.Client.UpdateBinding(this._reactor.ClientID, this.BXIndex, dnv);
            CheckReportIDEIValidationError();
        }

        internal void CheckReportIDEIValidationError()
        {
            var pc = this.PathComponents?.LastOrDefault();
            if (pc == null)
                return;

            var lastPropertySource = pc.LastPropertySource;

            if (lastPropertySource is IDataErrorInfo && !(lastPropertySource is INotifyDataErrorInfo))
            {
                string selfValidationError = GetErrorsForProperty(lastPropertySource, pc.ComponentName);
                if (!string.IsNullOrEmpty(selfValidationError))
                {
                    pc.HasIDEIValidationError = true;
                    this.ReportValidationError(selfValidationError);
                }
            }
        }

        internal static string GetErrorsForProperty(object source, string property)
        {
            if (source is INotifyDataErrorInfo indei)
                return indei.GetErrors(property)?.Cast<string>()?.FirstOrDefault();
            else if (source is IDataErrorInfo idei)
                return idei[property];
            return null;
        }

        private void ReleaseLastValue()
        {
            if (_lastValue?.Type == ModelValueType.Object ||
                _lastValue?.Type == ModelValueType.Collection)
            {
                var reference = _reactor.GetReference(_lastValue.ObjectHandle);
                if (reference != null && reference.Object is INotifyCollectionChanged oldIncc && this.NotifyCollectionChanged)
                    oldIncc.CollectionChanged -= OnSourceCollectionChanged;                   
            }
            _reactor.Release(_lastValue);
            _lastValue = null;
        }

        private void OnSourceCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            ReportSourcePropertyUpdate(sender);
        }

        private void OnSourceValidationError(object sender, DataErrorsChangedEventArgs e)
        {
            if (sender is INotifyDataErrorInfo indei)
            {
                var errors = indei.GetErrors(e.PropertyName)?.Cast<String>();
                this.ReportValidationError(errors?.FirstOrDefault());
            }
        }

        private void TraversePath(int start, Action<object, PathComponent> action)
        {
            if (this.PathComponents == null || this.PathComponents.Length == 0)
                return;

            object propertySource = start == 0
                ? this.ResolvedSource
                : this.PathComponents[start].LastPropertySource;

            for (int i = start; i < this.PathComponents.Length; i++)
            {
                var pathComponent = this.PathComponents[i];
                if (pathComponent.PropertyKey == null ||
                    pathComponent.PropertyKey.DeclaringType != propertySource?.GetType())
                {
                    Type t = propertySource?.GetType();
                    pathComponent.PropertyKey = PropertyKey.Create(t, pathComponent);
                    if (pathComponent.PropertyKey == null && propertySource != null)
                    {
                        //throw new InvalidOperationException(
                        Debug.WriteLine(
                            $"Property {pathComponent.ComponentName} not found on " +
                            $"object {propertySource}. Only public properties " +
                            $"may be part of a binding path.");
                        break;
                    }
                }
                action(propertySource, pathComponent);
                pathComponent.LastPropertySource = propertySource;
                if (propertySource != null)
                    propertySource = pathComponent.PropertyKey?.GetValue(propertySource);
            }
        }
    }
}
