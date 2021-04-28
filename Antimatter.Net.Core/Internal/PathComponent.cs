using System;
using System.Linq;
using System.ComponentModel;
using System.Diagnostics;

namespace Antimatter.Net.Internal
{
    internal class PathComponent
    {
        static int s_creates = 0;
        static int s_deletes = 0;

        public PathComponent()
        {
            s_creates++;
        }

        ~PathComponent()
        {
            s_deletes++;
        }

        internal BindingExpression Binding
        {
            get;
            set;
        }

        internal string ComponentName { get; set; }

        internal PropertyKey PropertyKey { get; set; }

        internal int Index { get; set; }

        WeakReference<object> _lastPropertySource;
        internal object LastPropertySource
        {
            get
            {
                object npc = null;
                _lastPropertySource?.TryGetTarget(out npc);
                return npc;
            }
            set
            {
                if (value != null)
                    _lastPropertySource = new WeakReference<object>(value);
                else
                    _lastPropertySource = null;
            }
        }

        internal void Unsubscribe()
        {
            if (this.LastPropertySource is INotifyPropertyChanged npc)
            {
                npc.PropertyChanged -= OnPropertyChanged;
            }
        }

        internal void SubscribePropertyChange(object source, bool isBindingTarget)
        {
            if (source is INotifyPropertyChanged npc)
            {
                npc.PropertyChanged += this.OnPropertyChanged;
            }
        }

        internal void OnPropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (e.PropertyName != this.ComponentName &&
                !(e.PropertyName == "Item[]" && this.PropertyKey.IsIndexedProperty))
                return;

            this.Binding?.SetEffectiveValue(this.Index);
        }

        internal void OnTargetPropertyChanged(ModelValue modelValue, Reactor reactor)
        {
            object lastPropertySource = this.LastPropertySource;
            if (lastPropertySource != null)
            {
                object value;
                var targetPropType = this.PropertyKey.PropertyInfo.PropertyType;
                if (Reactor._customConverters.TryGetValue(targetPropType, out IModelValueConverter converter))
                    value = converter.ConvertFrom(modelValue);
                else
                    value = modelValue.ToCSValue(reactor);
                
                Debug.WriteLine(
                    $"Property change triggering update for source {this.LastPropertySource}");
                try
                {
                    this.PropertyKey.SetValue(this.LastPropertySource, value);
                }
                catch (Exception ex)
                {
                    this._hasSetterException = true;
                    this.Binding.ReportValidationError(ex.Message);
                    return;
                }

                if (this._hasSetterException || this.HasIDEIValidationError)
                {
                    this._hasSetterException = false;
                    string selfValidationError = BindingExpression.GetErrorsForProperty(lastPropertySource, this.ComponentName);
                    if (string.IsNullOrEmpty(selfValidationError))
                        this.HasIDEIValidationError = false;
                    this.Binding.ReportValidationError(selfValidationError);
                }
                else
                {
                    this.Binding.CheckReportIDEIValidationError();
                }
            }
        }           

        private bool _hasSetterException = false;
        internal bool HasIDEIValidationError { get; set; }
    }
}