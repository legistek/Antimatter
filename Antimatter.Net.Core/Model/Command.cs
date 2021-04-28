using System;
using System.Windows.Input;

namespace Antimatter.Net.Model
{
    public class Command : ObservableObject, ICommand
    {
        private Action<object> _action;

        public event EventHandler CanExecuteChanged;

        public string Name { get; set; }

        public Func<bool> GetIsEnabled { get; set; }

        public void IsEnabledChanged()
        {
            this.IsEnabled = GetIsEnabled?.Invoke() ?? true;
        }

        private bool _isEnabled = true;
        public bool IsEnabled 
        {
            get => _isEnabled;
            private set
            {
                if (_isEnabled != value)
                {
                    this._isEnabled = value;
                    OnPropertyChanged();
                    this.CanExecuteChanged?.Invoke(this, new EventArgs());
                }
            }
        }

        public bool IsDefault { get; set; }

        public string ToolTip { get; set; }

        public ushort Icon { get; set; }        

        public Command(Action<object> action)
        {
            this._action = action;
        }

        public virtual bool CanExecute(object parameter)
        {
            return true;
        }

        public void Execute(object parameter)
        {
            if (!CanExecute(parameter))
                return;
            this._action?.Invoke(parameter);
        }
    }
}
