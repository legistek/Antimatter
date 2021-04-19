using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Text;

namespace Antimatter.Net.Model
{
    public class ObservableObject : INotifyPropertyChanged, INotifyDataErrorInfo, IDataErrorInfo
    {
        #region INotifyPropertyChanged Implementation
        public event PropertyChangedEventHandler PropertyChanged;

        protected void OnPropertyChanged(
            [CallerMemberName] string property = null,
            params string[] otherDependencies)
        {
            this.PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(property));
            if (otherDependencies == null || otherDependencies.Length == 0)
                return;
            foreach (var prop in otherDependencies)
                this.PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(prop));
        }
        #endregion

        #region INotifyDataErrorInfo and IDataErrorInfo Implementation

        public event EventHandler<DataErrorsChangedEventArgs> ErrorsChanged;

        bool INotifyDataErrorInfo.HasErrors => this.ValidationErrors.Count > 0;

        Dictionary<string, string> _ValidationErrors;
        private Dictionary<string,string> ValidationErrors
        {
            get => _ValidationErrors ?? (_ValidationErrors = new Dictionary<string, string>());
        }

        string IDataErrorInfo.Error => this.GetError();

        string IDataErrorInfo.this[string columnName]
        {
            get
            {
                string err = null;
                this.ValidationErrors.TryGetValue(columnName, out err);
                return err;
            }
        }
        
        IEnumerable INotifyDataErrorInfo.GetErrors(string propertyName)
        {
            string error;
            if (this.ValidationErrors.TryGetValue(propertyName, out error))
            {
                if (!string.IsNullOrEmpty(error))
                    return new string[] { error };
            }
            return null;
        }

        private void OnErrorsChanged(string property)
        {
            this.ErrorsChanged?.Invoke(this, new DataErrorsChangedEventArgs(property));
        }

        private string GetError()
        {
            if (this.ValidationErrors.Count == 0)
                return null;
            StringBuilder sb = new StringBuilder();
            foreach (var err in this.ValidationErrors.Values)
            {
                sb.Append(err);
            }
            return sb.ToString();
        }

        #endregion

        public virtual string GetKey()
        {
            return null;
        }

        protected void Validate(
            bool isValid,
            string errorMessage, 
            [CallerMemberName]string property = null)
        {
            if (isValid)
            {
                // value is valid; remove error state if any
                if (this._ValidationErrors?.Count > 0 && this._ValidationErrors.Remove(property))
                    OnErrorsChanged(property);
            }
            else
            {
                this.ValidationErrors[property] = errorMessage;
                OnErrorsChanged(property);
            }
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
    }
}
