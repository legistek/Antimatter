using System;
using System.Threading.Tasks;
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

        #region DocumentPosition DocPosition property
        private DocumentPosition _DocPosition = DocumentPosition.Default;
        public DocumentPosition DocPosition
        {
            get
            {
                return _DocPosition;
            }
            set
            {
                _DocPosition = value;
                OnPropertyChanged();
            }
        }
        #endregion

        #region int DocPage property
        public int DocPage
        {
            get
            {
                return this.DocPosition.page;
            }
            set
            {
                if (this.DocPosition.page != value)
                {
                    this.DocPosition = new DocumentPosition
                    {
                        x = 0,
                        y = 0,
                        page = value,
                        scale = DocPosition.scale
                    };
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region float DocScale property
        public float DocScale
        {
            get
            {
                return this.DocPosition.scale;
            }
            set
            {
                if (this.DocPosition.scale != value)
                {
                    this.DocPosition = new DocumentPosition
                    {
                        x = 0,
                        y = 0,
                        page = DocPosition.page,
                        scale = value
                    };
                    OnPropertyChanged();
                }
            }
        }
        #endregion


        #region Employee[] SelectedEmployees property
        private Employee[] _SelectedEmployees;
        public Employee[] SelectedEmployees
        {
            get
            {
                return _SelectedEmployees;
            }
            set
            {
                if (_SelectedEmployees != value)
                {
                    _SelectedEmployees = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region bool IsAllSelected property
        private bool _IsAllSelected;
        public bool IsAllSelected
        {
            get
            {
                return _IsAllSelected;
            }
            set
            {
                if (_IsAllSelected != value)
                {
                    _IsAllSelected = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

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

        #region double UnderlingPanelWidth property
        private double _UnderlingPanelWidth = 200;
        public double UnderlingPanelWidth
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
                    Icon = 0xF081
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
                    Icon = 0xF082
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

        string[] _availableColors;
        public string[] AvailableColors
        {
            get
            {
                if (_availableColors == null)
                {
                    _availableColors = new uint[]
                    {
                        0xFF000000, 0xFFFF0000, 0xFFFF8000, 0xFFFFFF00, 0xFF00FF00,
                        0xFF00FFFF, 0xFF0000FF, 0xFF8000FF, 0xFFFF00FF,
                        0xFF950500, 0xFFD32A24, 0xFFFD4640, 0xFFA90068, 0xFFD324A0,
                        0xFFFF36C1, 0xFF8100A9, 0xFF9A24D3, 0xFFBC4DFF, 0xFF1F00A7,
                        0xFF4537E6, 0xFF5159FF, 0xFF00538E, 0xFF0088DB, 0xFF17A4FF,
                        0xFF00746D, 0xFF099D7A, 0xFF00BBAA, 0xFF00740F, 0xFF0B9F08,
                        0xFF00BB03, 0xFF615800, 0xFF8D8105, 0xFFD4B000, 0xFF9A6100,
                        0xFFC66000, 0xFFF16D00
                    }.Select(val => "#" + (val & 0xFFFFFF).ToString("X6")).ToArray();
                }
                return _availableColors;
            }
        }

        public override string ToString()
        {
            return $"Company: {this.Name}";
        }

        private Command _OpenTeachingBubbleCommand;
        public ICommand OpenTeachingBubbleCommand
        {
            get
            {
                return _OpenTeachingBubbleCommand ?? (_OpenTeachingBubbleCommand = new Command(
                    (arg) =>
                    {
                        TeachingBubbleOpen = true;
                    })
                {
                    Name = "Blow Bubbles",
                    ToolTip = "Actually just the one bubble, and it's more of an 'open' than a 'blow'"
                });
            }
        }

        #region boolean TeachingBubbleOpen property
        private bool _TeachingBubbleOpen = false;
        public bool TeachingBubbleOpen
        {
            get
            {
                return _TeachingBubbleOpen;
            }
            set
            {
                if (_TeachingBubbleOpen == value)
                    return;
                _TeachingBubbleOpen = value;
                OnPropertyChanged();
            }
        }
        #endregion

        private Command _TeachingBubblePrimaryCommand;
        public ICommand TeachingBubblePrimaryCommand
        {
            get
            {
                return _TeachingBubblePrimaryCommand ?? (_TeachingBubblePrimaryCommand = new Command(
                    (arg) =>
                    {
                        TeachingBubbleOpen = false;
                    })
                {
                    Name = "Bubble CMD"
                });
            }
        }

        public TeachingBubbleParams TeachingBubbleInfo => new TeachingBubbleParams()
        {
            HeaderText = "I AM HEADER",
            MessageText = "Message text here",
            ShowCloseButton = true,
            PrimaryCommand = TeachingBubblePrimaryCommand,
            ShowSecondaryButton = true,
            SecondaryButtonText = "DISMISS PLZ"
        };
    }
}
