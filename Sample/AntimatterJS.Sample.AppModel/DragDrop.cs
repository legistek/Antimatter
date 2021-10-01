using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

using Antimatter.Net.Model;

namespace AntimatterJS.Sample.AppModel
{
    public class DragDrop : ObservableObject
    {
        public Company Company { get; }

        public DragDrop(Company company)
        {
            this.Company = company;
        }

        #region object DragContent property
        private object _DragContent;
        public object DragContent
        {
            get
            {
                return _DragContent;
            }
            set
            {
                if (_DragContent != value)
                {
                    _DragContent = value;
                    OnPropertyChanged();
                    if (value != null)
                    {
                        DropCommands = new CommandCollection
                        {
                            EmployeeDroppedCommand
                        };
                    }
                    else
                    {
                        DropCommands = null;
                    }
                }
            }
        }
        #endregion

        #region CommandCollection DropCommands property
        private CommandCollection _DropCommands;
        public CommandCollection DropCommands
        {
            get
            {
                return _DropCommands;
            }
            set
            {
                if (_DropCommands != value)
                {
                    _DropCommands = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region IUICommand EmployeeDropped Command

        private Command _EmployeeDroppedCommand;
        public Command EmployeeDroppedCommand
        {
            get
            {
                return _EmployeeDroppedCommand ?? (_EmployeeDroppedCommand = new Command(
                    async (arg) =>
                    {
                        int a = 1;
                    })
                {
                    Name = "Drop Employee!",
                });
            }
        }

        #endregion


    }
}
