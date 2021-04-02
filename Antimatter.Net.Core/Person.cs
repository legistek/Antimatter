using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows.Input;

namespace Antimatter.Net
{
    public class Person : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler PropertyChanged;

        #region int Age property
        private int _Age;
        public int Age
        {
            get
            {
                return _Age;
            }
            set
            {
                if (_Age != value)
                {
                    _Age = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region string Name property
        private string _Name;
        public string Name
        {
            get
            {
                return _Name;
            }
            set
            {
                if (_Name != value)
                {
                    _Name = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region ICommand IncreaseAge Command

        private Command _IncreaseAgeCommand;
        public ICommand IncreaseAgeCommand
        {
            get
            {
                return _IncreaseAgeCommand ?? (_IncreaseAgeCommand = new Command(
                    (arg) =>
                    {
                        this.Age++;
                        this.Name = "And also I changed the name just now :p";
                    }));
            }
        }

        #endregion

        #region ICommand DecreaseAge Command

        private Command _DecreaseAgeCommand;
        public ICommand DecreaseAgeCommand
        {
            get
            {
                return _DecreaseAgeCommand ?? (_DecreaseAgeCommand = new Command(
                    (arg) =>
                    {
                        this.Age--;
                    }));
            }
        }

        #endregion

        #region Person Child property
        private Person _Child;
        public Person Child
        {
            get
            {
                return _Child;
            }
            set
            {
                if (_Child != value)
                {
                    _Child = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        protected void OnPropertyChanged([CallerMemberName] string property = null)
        {
            this.PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(property));
        }
    }

    public class Command : ICommand
    {
        Action<object> _action = null;

        public Command(Action<object> action)
        {
            _action = action;
        }

        public event EventHandler CanExecuteChanged;

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
