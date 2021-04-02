using System;
using System.Windows.Input;

namespace AntimatterJS.Sample.AppModel
{
    public class Command : ICommand
    {
        private Action<object> _action;

        public event EventHandler CanExecuteChanged;

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
