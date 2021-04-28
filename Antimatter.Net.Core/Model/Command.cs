using System;
using System.Windows.Input;

namespace Antimatter.Net.Model
{
    public class Command : ICommand
    {
        private Action<object> _action;

        public event EventHandler CanExecuteChanged;

        public string Name { get; set; }

        private bool _isEnabled = true;
        public bool IsEnabled 
        {
            get => _isEnabled;
            set
            {
                if (_isEnabled != value)
                {
                    this._isEnabled = value;
                    this.CanExecuteChanged?.Invoke(this, new EventArgs());
                }
            }
        }

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
