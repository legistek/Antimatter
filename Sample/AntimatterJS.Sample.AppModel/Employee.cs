using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

namespace AntimatterJS.Sample.AppModel
{
    public class Employee : ObservableObject
    {
        public Employee()
        {
        }

        public Employee(string firstName, string lastName, int age)
        {
            this.FirstName = firstName;
            this.LastName = lastName;
            this.Age = age;
        }

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
                    OnPropertyChanged(nameof(FullName));
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
                    OnPropertyChanged(nameof(FullName));
                }
            }
        }
        #endregion

        #region string FullName property
        public string FullName
        {
            get
            {
                return $"{FirstName} {LastName} (age {Age})";
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
                    OnPropertyChanged(nameof(FullName));
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

        public override string ToString()
        {
            return this.FullName;
        }
    }
}
