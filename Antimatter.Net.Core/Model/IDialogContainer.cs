using System.Collections.ObjectModel;

namespace Antimatter.Net.Model
{
    public interface IDialogContainer
    {
        public ObservableCollection<DialogViewModel> Dialogs 
        { 
            get; 
        }
    }
}