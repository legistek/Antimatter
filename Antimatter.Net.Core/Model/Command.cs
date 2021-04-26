using System;
using System.Windows.Input;

namespace Antimatter.Net.Model
{
    public class Command : ICommand
    {
        private Action<object> _action;

        public event EventHandler CanExecuteChanged;

        public string Name { get; set; }

        public bool IsEnabled { get; set; } = true;

        public ushort Icon { get; set; }

        public Command(Action<object> action)
        {
            this._action = action;
        }

        public bool CanExecute(object parameter)
        {
            return true;
        }

        public void Execute(object parameter)
        {
            this._action?.Invoke(parameter);
        }
    }
}
