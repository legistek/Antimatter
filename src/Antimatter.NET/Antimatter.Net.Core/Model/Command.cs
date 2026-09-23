using System;
using System.Runtime.CompilerServices;
using System.Windows.Input;

namespace Antimatter.Net.Model
{
    public class Command<T> : Command
    {
        public Command(Action<T> action, [CallerMemberName] string name = null) 
            : base(
                  (arg) => action(arg is T ? (T)arg : default(T)), 
                  name)
        {            
        }
    }

    public class Command : ObservableObject, ICommand
    {
        private Action<object> _action;
        private string _name;

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
            set
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

        public bool Visibility { get; set; } = true;

        public string ToolTip { get; set; }

        public ushort Icon { get; set; }        

        public Command(Action<object> action, [CallerMemberName] string name = null)
        {
            this._action = action;
            this._name = name;
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

        public override string ToString()
        {
            return this._name;
        }
    }
}
