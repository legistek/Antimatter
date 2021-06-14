using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using System.Windows.Input;

using Antimatter.Net.Model;

namespace AntimatterJS.Sample.AppModel
{
    public class Employee : ObservableObject
    {
        public Employee(Company company)
        {
            this.Company = company;
        }

        #region Company Company property
        private Company _Company;
        public Company Company
        {
            get
            {
                return _Company;
            }
            set
            {
                if (_Company != value)
                {
                    _Company = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        public Employee(Company company, string firstName, string lastName, int age) : this(company)
        {
            this.FirstName = firstName;
            this.LastName = lastName;
            this.Age = age;
        }

        #region ObservableCollection Underlings property
        private ObservableCollection<Employee> _Underlings;
        public ObservableCollection<Employee> Underlings
        {
            get
            {
                return _Underlings ?? (_Underlings = new ObservableCollection<Employee>());
            }
        }
        #endregion

        #region bool IsSelected property
        private bool _IsSelected;
        public bool IsSelected
        {
            get
            {
                return _IsSelected;
            }
            set
            {
                if (_IsSelected != value)
                {
                    _IsSelected = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

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

        #region string Color property
        private string _Color = "#000000";
        public string Color
        {
            get
            {
                return _Color;
            }
            set
            {
                if (_Color != value)
                {
                    _Color = value;
                    OnPropertyChanged();
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

        #region IUICommand Edit Command

        private Command _EditCommand;
        public Command EditCommand
        {
            get
            {
                return _EditCommand ?? (_EditCommand = new Command(
                    async (arg) =>
                    {
                        await new EmployeeDialog(this).ShowDialogAsync();
                    })
                {
                    Name = "Edit",
                    ToolTip = "",
                    Icon = 0xE9B1,
                });
            }
        }

        #endregion

        #region CommandCollection Commands property
        private CommandCollection _Commands;
        public CommandCollection Commands
        {
            get
            {
                return _Commands ?? (_Commands = new CommandCollection
                {
                    MakeBonusEligibleCommand,
                    DoSomethingElseCommand,
                    EditCommand,
                    IncreaseAgeCommand,
                    DecreaseAgeCommand,
                    FireCommand,
                });
            }
        }
        #endregion

        #region IUICommand IncreaseAge Command

        private Command _IncreaseAgeCommand;
        public Command IncreaseAgeCommand
        {
            get
            {
                return _IncreaseAgeCommand ?? (_IncreaseAgeCommand = new Command(
                    (arg) =>
                    {
                        this.Age++;
                    })
                {
                    Name = "Increase Age",
                    Icon = 0xE983,
                    ToolTip = "Increase this person's age"
                });
            }
        }

        #endregion

        #region Command DecreaseAge Command

        private Command _DecreaseAgeCommand;
        public Command DecreaseAgeCommand
        {
            get
            {
                return _DecreaseAgeCommand ?? (_DecreaseAgeCommand = new Command(
                    (arg) =>
                    {
                        this.Age--;
                    })
                {
                    Name = "Decrease Age",
                    ToolTip = "Decrease this person's age",
                    Icon = 0xE982,
                });
            }
        }

        #endregion

        #region IUICommand Fire Command

        private Command _FireCommand;
        public Command FireCommand
        {
            get
            {
                return _FireCommand ?? (_FireCommand = new Command(
                    (arg) =>
                    {
                        this.Company.DeleteEmployeeCommand.Execute(this);
                    })
                {
                    Name = "Fire",
                    ToolTip = "Throw the bum out",
                    Icon = 0xE959
                });
            }
        }

        #endregion

        #region Command MakeBonusEligible Command

        private Command _MakeBonusEligibleCommand;
        public Command MakeBonusEligibleCommand
        {
            get
            {
                return _MakeBonusEligibleCommand ?? (_MakeBonusEligibleCommand = new Command(
                    (arg) =>
                    {
                        this.IsBonusEligible = true;
                    })
                {
                    Name = "Make Bonus Eligible",
                    Icon = 0,
                });
            }
        }

        #endregion

        #region IUICommand DoSomethingElse Command

        private Command _DoSomethingElseCommand;
        public Command DoSomethingElseCommand
        {
            get
            {
                return _DoSomethingElseCommand ?? (_DoSomethingElseCommand = new Command(
                    (arg) =>
                    {

                    })
                {
                    Name = "Do Something Else",
                    ToolTip = "",
                    Icon = 0xE900
                });
            }
        }

        #endregion

        #region bool IsExpanded property
        private bool _IsExpanded;
        public bool IsExpanded
        {
            get
            {
                return _IsExpanded;
            }
            set
            {
                if (_IsExpanded != value)
                {
                    _IsExpanded = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        public override string ToString()
        {
            return this.FullName;
        }
    }
}
