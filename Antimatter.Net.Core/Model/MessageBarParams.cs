using System.Windows.Input;
using System.Collections.ObjectModel;

namespace Antimatter.Net.Model
{
    public class MessageBarParams : ObservableObject
    {
        public string Content { get; set; }

        public MessageBarType MessageBarType { get; set; }

        public ICommand PrimaryCommand { get; set; }

        public ICommand SecondaryCommand { get; set; }

        public bool ShowCloseButton { get; set; } = true;

        public double Duration { get; set; }

        private bool _IsVisible = true;
        public bool IsVisible {
            get => _IsVisible;
            set
            {
                if (_IsVisible == value)
                    return;
                _IsVisible = value;
                if (Collection != null && !_IsVisible)
                    Collection.Remove(this);
            }
        }

        public ObservableCollection<MessageBarParams> Collection;
    }

    public enum MessageBarType
    {
        info = 0,
        error = 1,
        blocked = 2,
        severeWarning = 3,
        success = 4,
        warning = 5
    }
}
