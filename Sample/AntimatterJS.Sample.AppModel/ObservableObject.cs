using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace AntimatterJS.Sample.AppModel
{
    public class ObservableObject : INotifyPropertyChanged, INotifyDataErrorInfo
    {
        public virtual bool HasErrors => false;

        public event PropertyChangedEventHandler PropertyChanged;

        public event EventHandler<DataErrorsChangedEventArgs> ErrorsChanged;

        Dictionary<string, string> _ValidationErrors;
        private Dictionary<string,string> ValidationErrors
        {
            get => _ValidationErrors ?? (_ValidationErrors = new Dictionary<string, string>());
        }

        public virtual IEnumerable GetErrors(string propertyName)
        {
            string error;
            if (this.ValidationErrors.TryGetValue(propertyName, out error))
            {
                if (!string.IsNullOrEmpty(error))
                    return new string[] { error };
            }
            return null;
        }

        protected void ReportValidationError(
            string error,
            [CallerMemberName]
            string property = null)
        {
            if (string.IsNullOrEmpty(error))
                this.ValidationErrors.Remove(property);
            else
                this.ValidationErrors[property] = error;
            OnErrorsChanged(property);
        }

        protected void OnPropertyChanged(
            [CallerMemberName] string property = null,
            params string[] otherDependencies)
        {
            this.PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(property));
        }

        private void OnErrorsChanged(string property)
        {
            this.ErrorsChanged?.Invoke(this, new DataErrorsChangedEventArgs(property));
        }
    }
}
