using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

using Antimatter.Net.Model;

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

        #region double BonusAmount property
        private double _BonusAmount = 10000.0;
        public double BonusAmount
        {
            get
            {
                return _BonusAmount;
            }
            set
            {
                if (_BonusAmount != value)
                {
                    _BonusAmount = value;
                    Validate(value <= 100000, "Bonus must be no more than 100000");
                    OnPropertyChanged();
                    OnPropertyChanged(nameof(FullName));
                }
            }
        }
        #endregion

        #region bool IsBonusEligible property
        private bool _IsBonusEligible;
        public bool IsBonusEligible
        {
            get
            {
                return _IsBonusEligible;
            }
            set
            {
                if (_IsBonusEligible != value)
                {
                    _IsBonusEligible = value;
                    OnPropertyChanged();
                    OnPropertyChanged(nameof(FullName));
                }
            }
        }
        #endregion

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
                return $"{FirstName} {LastName} (age {Age}) ({(!this.IsBonusEligible ? "not" : this.BonusAmount.ToString())} bonus eligible)";
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
                    })
                {
                    Name = "Increase Age",                    
                });
            }
        }

        #endregion

        public override string ToString()
        {
            return this.FullName;
        }
    }
}
