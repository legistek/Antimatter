using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

namespace AntimatterJS.Sample.AppModel
{
    public class Employee : ObservableObject
    {
        #region string FirstName property
        private string _FirstName;
        public string FirstName
        {
            get
            {
                return _FirstName;
            }
            set
            {
                if (_FirstName != value)
                {
                    _FirstName = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region string LastName property
        private string _LastName;
        public string LastName
        {
            get
            {
                return _LastName;
            }
            set
            {
                if (_LastName != value)
                {
                    _LastName = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

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

        #region IUICommand IncreaseAge Command

        private Command _IncreaseAgeCommand;
        public ICommand IncreaseAgeCommand
        {
            get
            {
                return _IncreaseAgeCommand ?? (_IncreaseAgeCommand = new Command(
                    (obj) =>
                    {
                        this.Age++;
                    }));
            }
        }

        #endregion
    }
}
