using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.ObjectModel;

using Antimatter.Net.Model;

namespace AntimatterJS.Sample.AppModel
{
    [AntimatterModel]
    public class App : ObservableObject, IDialogContainer
    {
        public App()
        {
        }

        #region ObservableCollection<DialogViewModel> Dialogs property
        public ObservableCollection<DialogViewModel> Dialogs
        {
            get;
        } = new ObservableCollection<DialogViewModel>();
        #endregion

        #region DocViewer Viewer property
        private DocViewer _Viewer = new DocViewer();
        public DocViewer Viewer
        {
            get
            {
                return _Viewer;
            }
            set
            {
                if (_Viewer != value)
                {
                    _Viewer = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        public Company Company { get; } = new Company()
        {
            Name = "Edison Electric"
        };

        public async Task StartAsync()
        {
            this.Company.CEO = new Employee(this.Company)
            {
                FirstName = "Thomas",
                LastName = "Edison",
                Age = 50
            };
            this.Company.Employees.Add(this.Company.CEO);
            AddUnderlings(this.Company.CEO, 8);
            this.Company.SelectedEmployee = this.Company.Employees.First();
        }

        private void AddUnderlings(Employee e, int levels)
        {
            if (levels == 0)
                return;

            e.Underlings.Add(new Employee(this.Company, "Mickey", $"Mouse {e.FirstName[0]}{e.LastName[0]}{levels}", 100));
            e.Underlings.Add(new Employee(this.Company, "Santa", $"Clause {e.FirstName[0]}{e.LastName[0]}{levels}", 500));
            e.Underlings.Add(new Employee(this.Company, "Yoda", $"Parseghian {e.FirstName[0]}{e.LastName[0]}{levels}", 900));
            foreach (var underling in e.Underlings)
            {
                this.Company.Employees.Add(underling);
                AddUnderlings(underling, levels - 1);
            }
        }
    }
}
