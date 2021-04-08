using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

using Antimatter.Net;

namespace AntimatterJS.Sample.AppModel
{
    [AntimatterModel]
    public class App : ObservableObject
    {
        public Company Company { get; } = new Company()
        {
            Name = "Edison Electric"
        };

        public async Task StartAsync()
        {
            this.Company.CEO = new Employee
            {
                FirstName = "Thomas",
                LastName = "Edison",
                Age = 50                
            };
            this.Company.Employees.Add(this.Company.CEO);
            for (int i = 0; i < 1; i++)
            {
                this.Company.Employees.Add(new Employee("Mickey", "Mouse", 100));
                this.Company.Employees.Add(new Employee("Santa", "Clause", 500));
                this.Company.Employees.Add(new Employee("Yoda", "Parseghian", 900));
            }
        }
    }
}
