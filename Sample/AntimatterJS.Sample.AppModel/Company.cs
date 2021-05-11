using System;
using System.Linq;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Windows.Input;
using Antimatter.Net.Model;

namespace AntimatterJS.Sample.AppModel
{
    public class Company : ObservableObject
    {
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

        public ObservableCollection<Employee> Employees { get; } =
            new ObservableCollection<Employee>();

        #region Employee SelectedEmployee property
        private Employee _SelectedEmployee;
        public Employee SelectedEmployee
        {
            get
            {
                return _SelectedEmployee;
            }
            set
            {
                if (_SelectedEmployee != value)
                {
                    _SelectedEmployee = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region Employee CEO property
        private Employee _CEO;
        public Employee CEO
        {
            get
            {
                return _CEO;
            }
            set
            {
                if (_CEO != value)
                {
                    _CEO = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region int UnderlingPanelWidth property
        private int _UnderlingPanelWidth = 400;
        public int UnderlingPanelWidth
        {
            get
            {
                return _UnderlingPanelWidth;
            }
            set
            {
                if (_UnderlingPanelWidth != value)
                {
                    _UnderlingPanelWidth = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region IUICommand NewEmployee Command

        private Command _NewEmployeeCommand;
        public ICommand NewEmployeeCommand
        {
            get
            {
                return _NewEmployeeCommand ?? (_NewEmployeeCommand = new Command(
                    (arg) =>
                    {
                        this.Employees.Insert(0, new Employee(this, "New", "Employee", 20));
                    })
                {
                    Name = "New Employee",
                    Icon = 0xE911
                });
            }
        }

        #endregion

        #region IUICommand DeleteEmployee Command

        private Command _DeleteEmployeeCommand;
        public ICommand DeleteEmployeeCommand
        {
            get
            {
                return _DeleteEmployeeCommand ?? (_DeleteEmployeeCommand = new Command(
                    (arg) =>
                    {
                        if (arg is Employee e)
                        {
                            this.Employees.Remove(e);
                            if (this.SelectedEmployee == e)
                                this.SelectedEmployee = this.Employees.FirstOrDefault();
                        }
                    })
                {
                    Name = "Fire",
                    ToolTip = "Fire this bum",
                    Icon = 0xE959
                });
            }
        }

        #endregion

        #region IUICommand SelectedEmployeeChanged Command

        private Command _SelectedEmployeeChangedCommand;
        public Command SelectedEmployeeChangedCommand
        {
            get
            {
                return _SelectedEmployeeChangedCommand ?? (_SelectedEmployeeChangedCommand = new Command(
                    (arg) =>
                    {
                        ;
                    })
                {
                });
            }
        }

        #endregion


        public override string ToString()
        {
            return $"Company: {this.Name}";
        }
    }
}
