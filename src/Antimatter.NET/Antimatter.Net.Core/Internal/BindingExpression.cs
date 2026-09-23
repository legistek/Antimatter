using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;

namespace Antimatter.Net.Internal
{
    internal class BindingExpression
    {   
        //static BindingExpression()
        //{
        //    s_Stopwatch.Start();
        //}

        private static readonly object s_unsetValue = new object();

        object _lastValue = s_unsetValue;
        HashSet<int> _currentObjectCollection;

        Reactor _reactor;
        bool _suspendPropertyChangeReport;

        internal BindingExpression(Reactor manager, string path)
        {
            _reactor = manager;
            this.Path = path;
            this.ParsePath();
        }

        public int BXIndex { get; set; }

        public bool MarshalValue { get; set; }

        public BindingMode Mode { get; set; }

        public IModelValueConverter Converter { get; set; }

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
        }

        private void AddRef(ModelValue valueFromClient, ObjectReference existingRef = null)
        {
            if (valueFromClient.IsReferenceCounted)
            {
                var reference = existingRef ?? _reactor.GetReference(valueFromClient.ObjectHandle);
                reference?.AddRef();    
            }
            if (valueFromClient.Type == ModelValueType.Collection)
            {
                if (valueFromClient.ObjectHandle != 0)
                {
                    // Existing model-side collection, where UI might not have
                    // actually given us the members (in fact probably didn't and shouldn't).
                    // But we still have to AddRef them.
                    var coll = _reactor.GetReference(valueFromClient.ObjectHandle)?.Object;
                    if (coll is IEnumerable ienum)
                    {
                        foreach (var item in ienum)
                        {
                            var itemRef = _reactor.TryGetObjectReference(item);
                            itemRef?.AddRef();
                        }
                    }
                }                
                else
                {
                    foreach (var item in valueFromClient.Collection)
                    {
                        var reference = _reactor.GetReference(item.ObjectHandle);
                        reference?.AddRef();
                    }
                }
            }
        }

        public void UpdateBoundCollection(CollectionUpdate update)
        {
            this._suspendPropertyChangeReport = true;
            try
            {
                object collection = null;
                if (!(this.PathComponents.Length > 0))
                    collection = this.ResolvedSource;
                else
                    collection = this.PathComponents.Last().GetValue();
                
                if (collection is IList list)
                {
                    var olist = list as IObservableList;

                    switch (update.Action)
                    {
                        case NotifyCollectionChangedAction.Reset:                            
                            // Add refs on the new items first if any
                            if (update.Items?.Length > 0)
                            {
                                foreach (var item in update.Items)
                                    AddRef(item);
                            }

                            // Release old items
                            if (this._currentObjectCollection != null)
                            {
                                foreach (var item in this._currentObjectCollection)
                                    _reactor.Release(item);
                                this._currentObjectCollection.Clear();
                            }
                            
                            if (update.Items?.Length > 0)
                            {
                                // Cache new items if objs
                                this._currentObjectCollection = new HashSet<int>(
                                    update.Items
                                        .Where(item => item.IsReferenceCounted)
                                        .Select(item => item.ObjectHandle));

                                // Now actually add them to the list
                                if (olist != null)
                                    olist.Reset(update.Items.Select(item => item.Value(this._reactor, out _)));
                                else
                                {
                                    list.Clear();
                                    foreach (var item in update.Items)
                                        list.Add(item.Value(this._reactor, out _));
                                }
                            }                    
                            else
                            {
                                list.Clear();
                            }

                            break;
                        case NotifyCollectionChangedAction.Add:
                            if (olist != null)
                            {
                                olist.AddRange(update.Items.Select(item => item.Value(this._reactor, out _)).ToArray());
                            }
                            else
                            {
                                foreach (var item in update.Items)
                                    list.Add(item.Value(this._reactor, out _));
                            }

                            foreach (var item in update.Items)
                            {
                                AddRef(item);
                                if (item.IsReferenceCounted)
                                    this._currentObjectCollection?.Add(item.ObjectHandle);
                            }
                            break;

                        case NotifyCollectionChangedAction.Remove:
                            if (olist != null)
                            {
                                olist.RemoveRange(update.Items.Select(item => item.Value(this._reactor, out _)).ToArray());
                            }
                            else
                            {
                                foreach (var item in update.Items)
                                    list.Remove(item.Value(this._reactor, out _));
                            }

                            foreach (var item in update.Items)
                            {
                                this._reactor.Release(item);                                
                                if (item.IsReferenceCounted)
                                    this._currentObjectCollection?.Remove(item.ObjectHandle);
                            }
                            break;
                    }
                }
            }
            finally
            {
                _suspendPropertyChangeReport = false;
            }
        }

        public void UpdateSource(ModelValue newValue)
        {
            this._suspendPropertyChangeReport = true;
            try
            {
                if (!(this.PathComponents.Length > 0))
                    // No two-way binding if no path
                    return;

                ObjectReference newValueObjRef = null;
                var pathComponent = this.PathComponents.Last();                
                var targetPropType = pathComponent.PropertyKey?.PropertyType;

                IModelValueConverter conv = this.Converter;
                object unconvertedPocoValue = newValue.Value(
                    _reactor,
                    out newValueObjRef,
                    conv != null ? conv.TargetType : targetPropType);

                if (unconvertedPocoValue is BindingException bex)
                {
                    pathComponent.HasIDEIValidationError = true;
                    this.ReportValidationError(bex.Message);
                    return;
                }
                
                var unchanged = newValue.IsReferenceCounted
                    ? object.ReferenceEquals(unconvertedPocoValue, _lastValue)
                    : object.Equals(unconvertedPocoValue, _lastValue);

                if (!unchanged)
                {
                    // Add ref to unconverted POCO value, then release old.
                    // The _lastValue we need to prevent GC on is always the
                    // pre-converted-back value because that's what the model
                    // is relying on. There's no guarantee the converter is
                    // holding onto it.
                    AddRef(newValue, newValueObjRef);
                    ReleaseLastValue();
                    _lastValue = unconvertedPocoValue;
                    if (newValue.Type == ModelValueType.Collection)
                    {
                        // Hold onto collection members for efficient de-ref if prop
                        // value changes
                        if (newValue.ObjectHandle != 0 && unconvertedPocoValue is IEnumerable ienum)
                        {
                            this._currentObjectCollection = new HashSet<int>(
                                ienum.Cast<object>()
                                    .Select(obj => _reactor.TryGetObjectReference(obj)?.Handle ?? 0)
                                    .Where(h => h != 0));
                        }
                        else if (newValue.Collection != null)
                        {
                            this._currentObjectCollection = new HashSet<int>(
                                newValue.Collection.Where(mv => mv.IsReferenceCounted).Select(mv => mv.ObjectHandle));
                        }
                    }
                }
                
                pathComponent.OnTargetPropertyChanged(
                    conv != null 
                    ? conv.ConvertFrom(unconvertedPocoValue)
                    : unconvertedPocoValue, 
                    _reactor);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
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

            if (this.Mode != BindingMode.OneTime && this.Mode != BindingMode.OneWayToSource)
                SubscribePropertyChange(0);
            // Notify the binding target of the new value just as
            // if it had changed.
            UpdateTargetValue(0);

            return true;
        }

        internal PathComponent[] PathComponents
        {
            get;
            set;
        }

        private static bool AreSame(object a, object b)
        {
            if (a is null && b is null)
                return true;
            if (a is null || b is null)
                return false;
            return a.GetType().IsValueType && object.Equals(a, b) ||
                !a.GetType().IsValueType && object.ReferenceEquals(a, b);
        }

        internal void OnSourcePropertyChanged(int pathStart)
        {
            bool isPathTerminator = pathStart == this.PathComponents.Length - 1;
            if (isPathTerminator)
            {
                // Simple case of the final component value changing,
                // so just update target
                this.UpdateTargetValue(pathStart);
                return;
            }

            // Someone higher in the chain has possibly changed, so we
            // potentially have to resubscribe, etc, if they have in 
            // fact changed.

            var oldSource = this.PathComponents[pathStart + 1].LastPropertySource;
            var newSource = this.PathComponents[pathStart].GetValue();
            if (AreSame(oldSource, newSource))
            {
                // This guy hasn't actually changed, so we 
                // jump to the next component in case it has
                // changed. The view model might have only raised
                // a PC notice for a higher-level item intending
                // for us to re-evaluate the lower-level items too.
                OnSourcePropertyChanged(pathStart + 1);
                return;
            }

            // With a non-terminating component that has actually changed,
            // treat this like a re-apply, but only starting with the
            // changed component.
            UnsubscribePropertyChange(pathStart);
            this.UpdateTargetValue(pathStart);
            SubscribePropertyChange(pathStart);
        }

        private object UpdateTargetValue(int pathStart)
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

            var lpc = this.PathComponents.Last();
            return lpc.PropertyKey?.GetValue(effectiveValueSource, lpc);
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

        private void ReportSourcePropertyUpdate(object value)
        {
            if (_suspendPropertyChangeReport)                                
                return;

            if (this.Converter != null)
                value = this.Converter.ConvertTo(value);

            if (AreSame(value, _lastValue) && !this.MarshalValue)
            {
                // PNM - Why are we excluding non-string
                // IEnumerables? Maybe we want a way to force
                // re-eval of a mutable collection that doesn't
                // implement INCC? The scenario doesn't seem
                // to arise ever so it must not be causing 
                // slowness, so leave it for now in case it's
                // obscure.
                if (value is string || !(value is IEnumerable))
                    return;                
            }
            
            ModelValue mv = _reactor.GetModelValue(value, this.MarshalValue);
                
            if (value is INotifyCollectionChanged incc)
                incc.CollectionChanged += OnSourceCollectionChanged;

            ReleaseLastValue(); // now release old to avoid unnecessary final release if overlap
            _lastValue = value;
            if (mv.Type == ModelValueType.Collection)
            {
                _currentObjectCollection = new HashSet<int>(
                    mv.Collection.Where(mv1 => mv1.IsReferenceCounted).Select(mv1 => mv1.ObjectHandle));
            }

            Reactor.Client.UpdateBinding(this._reactor.ClientID, this.BXIndex, mv);

            CheckReportIDEIValidationError();
        }

        //internal static Stopwatch s_Stopwatch = new Stopwatch();        
        //internal static int s_ViewUpdates = 0;
        //internal static int s_PropertyGets = 0;
        //internal static double s_avgViewUpdatesPerSecond = 0;
        //internal static double s_avgPropGetsPerSecond = 0;

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
            else if (lastPropertySource is INotifyDataErrorInfo inde)
            {
                string error = inde.HasErrors ? inde.GetErrors(pc.ComponentName)?.Cast<string>()?.FirstOrDefault() : null;
                if (!string.IsNullOrEmpty(error))
                {
                    pc.HasIDEIValidationError = true;
                    this.ReportValidationError(error);
                }
                else if (pc.HasIDEIValidationError)
                {
                    pc.HasIDEIValidationError = false;
                    this.ReportValidationError(null);
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
            if (_lastValue is null || _lastValue.GetType().IsValueType)
                return;

            var reference = _reactor.TryGetObjectReference(_lastValue);
            if (reference != null)
            {
                if (reference.Object is INotifyCollectionChanged oldIncc)
                    oldIncc.CollectionChanged -= OnSourceCollectionChanged;
                reference.Release(_reactor);
            }
             
            if (!(_currentObjectCollection is null) && _lastValue is IEnumerable)
            {
                foreach (var val in _currentObjectCollection)
                    _reactor.Release(val);
                _currentObjectCollection.Clear();
            }

            _lastValue = null;
        }

        private void OnSourceCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            if (_suspendPropertyChangeReport)
                return;

            // ReportSourcePropertyUpdate(sender);
            CollectionUpdate update = new CollectionUpdate
            {
                Action = e.Action,
            };

            IList items = null;
            IEnumerable<int> removedKeys = null;
                        
            switch (e.Action)
            {
                case NotifyCollectionChangedAction.Replace:
                    update.Count = e.NewItems.Count;
                    update.Index = e.NewStartingIndex;
                    items = e.NewItems;
                    break;
                case NotifyCollectionChangedAction.Reset:
                    items = (sender as IEnumerable)?.Cast<object>()?.ToList();
                    removedKeys = _currentObjectCollection?.ToArray();                                        
                    break;
                case NotifyCollectionChangedAction.Add:
                    update.Count = e.NewItems.Count;
                    update.Index = e.NewStartingIndex;
                    items = e.NewItems;                    
                    break;
                case NotifyCollectionChangedAction.Remove:
                    update.Count = e.OldItems.Count;
                    update.Index = e.OldStartingIndex;
                    if (update.Index == -1)
                        // Without the removal indexes then
                        // we have to provide the view the items 
                        // themselves
                        items = e.OldItems;
                    removedKeys = e.OldItems
                        ?.Cast<object>()
                        ?.Select(item =>
                            _reactor.TryGetObjectReference(item)?.Handle)
                        ?.Where(h => h != null)
                        ?.Select(h => h.Value)
                        ?.ToArray();    
                    break;
            }
            
            var itemArray = items?.Cast<object>()?.ToArray();

            update.Items = items
                ?.Cast<object>()
                ?.Select(item => this._reactor
                ?.GetModelValue(item))
                ?.ToArray();
            if (e.Action != NotifyCollectionChangedAction.Remove &&
                !(update.Items is null))
            {
                foreach (var item in update.Items)
                {
                    if (item.IsReferenceCounted)
                        _currentObjectCollection?.Add(item.ObjectHandle);
                }
            }

            Reactor.Client.UpdateBoundCollection(
                this._reactor.ClientID, 
                this.BXIndex, 
                update);

            if (removedKeys != null)
            {
                foreach (var key in removedKeys)
                {
                    _reactor.Release(key, includeCollection: true);
                    _currentObjectCollection?.Remove(key);
                }
            }
            if (e.Action == NotifyCollectionChangedAction.Remove && 
                !(update.Items is null))
            {
                // Release the temp objects we made for the client
                // It really shouldn't have done anything with them
                // during this time, but we can't give an object ref
                // without increasing the ref count.
                foreach (var item in update.Items)
                {
                    if (item.IsReferenceCounted)
                        _reactor.GetReference(item.ObjectHandle).Release(_reactor);
                }
            }
        }

        private void OnSourceValidationError(object sender, DataErrorsChangedEventArgs e)
        {
            if (sender is INotifyDataErrorInfo indei && 
                this.PathComponents?.LastOrDefault()?.ComponentName == e.PropertyName)
            {
                var errors = indei.GetErrors(e.PropertyName)?.Cast<string>();
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
                        Reactor.DebugWriteLine(
                            $"Property {pathComponent.ComponentName} not found on " +
                            $"object {propertySource} ({this.Path}). Only public properties " +
                            $"may be part of a binding path.");
                        break;
                    }
                    if (pathComponent.PropertyKey != null &&
                        this.Converter == null &&
                        Reactor._customConverters.TryGetValue(
                            pathComponent.PropertyKey.PropertyType,
                            out IModelValueConverter conv))
                    {
                        this.Converter = conv;
                    }
                }
                action(propertySource, pathComponent);
                if (pathComponent._lastPropertySource == null ||
                    i > start && !AreSame(pathComponent.LastPropertySource, propertySource))
                {
                    pathComponent.LastPropertySource = propertySource;
                }
                if (propertySource != null &&
                    // Don't fetch it if we ain't gonna use it
                    i != this.PathComponents.Length - 1)
                {
                    propertySource = pathComponent.PropertyKey?.GetValue(propertySource, pathComponent);
                }
            }
        }
    }
}
