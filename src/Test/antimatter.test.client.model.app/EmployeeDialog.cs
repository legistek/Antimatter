using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

using Antimatter.Net.Model;

namespace AntimatterJS.Sample.AppModel
{
    public class EmployeeDialog : DialogViewModel
    {
        public EmployeeDialog(Employee employee)
        {
            this.Employee = employee;
        }

        public override string DialogTemplate => "EmployeeDialog";

        public override string Title => "Edit Employee";

        public override ushort Icon => 0xF080;

        public Employee Employee { get; }

        #region Command Back Command

        private Command _BackCommand;
        public Command BackCommand
        {
            get
            {
                return _BackCommand ?? (_BackCommand = new Command(
                    (args) =>
                    {
                    })
                {
                    Name = "Back",
                    Icon = 0
                });
            }
        }

        #endregion
    }
}
