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

        public override string Template => "EmployeeDialog";

        public override string Title => "Edit Employee";

        public override ushort Icon => 0xE913;

        public Employee Employee { get; }
    }
}
