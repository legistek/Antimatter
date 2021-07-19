using System.Windows.Input;

namespace Antimatter.Net.Model
{
    public class TeachingBubbleParams : ObservableObject
    {
        public string HeaderText { get; set; }

        public string MessageText { get; set; }

        public bool ShowCloseButton { get; set; } = true;

        public ICommand PrimaryCommand { get; set; }

        public bool ShowSecondaryButton { get; set; }

        public ICommand CustomSecondaryCommand { get; set; }

        public string SecondaryButtonText { get; set; } = "Maybe Later";
    }
}
