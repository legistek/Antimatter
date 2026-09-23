using System.Collections.ObjectModel;

namespace Antimatter.Net.Model
{
    public interface IDialogContainer
    {
        ObservableCollection<DialogViewModel> Dialogs 
        { 
            get; 
        }
    }
}