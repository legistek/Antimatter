using System.Windows.Input;

namespace Antimatter.Net.Model
{
    public class TeachingBubbleParams : ObservableObject
    {
        #region string HeaderText property
        private string _HeaderText;
        public string HeaderText
        {
            get
            {
                return _HeaderText;
            }
            set
            {
                if (_HeaderText == value)
                    return;
                _HeaderText = value;
                OnPropertyChanged();
            }
        }
        #endregion

        #region string MessageText property
        private string _MessageText;
        public string MessageText
        {
            get
            {
                return _MessageText;
            }
            set
            {
                if (_MessageText == value)
                    return;
                _MessageText = value;
                OnPropertyChanged();
            }
        }
        #endregion

        #region bool ShowCloseButton property
        private bool _ShowCloseButton;
        public bool ShowCloseButton
        {
            get
            {
                return _ShowCloseButton;
            }
            set
            {
                if (_ShowCloseButton == value)
                    return;
                _ShowCloseButton = value;
                OnPropertyChanged();
            }
        }
        #endregion

        #region bool IsOpen property
        private bool _IsOpen;
        public bool IsOpen
        {
            get
            {
                return _IsOpen;
            }
            protected set
            {
                if (_IsOpen == value)
                    return;
                _IsOpen = value;
                OnPropertyChanged();
            }
        }
        #endregion

        public virtual void Cancel()
        {
        }

        public virtual ICommand PrimaryCommand { get; set; }

        public virtual bool ShowSecondaryButton { get; set; }

        public virtual ICommand CustomSecondaryCommand { get; set; }

        public string SecondaryButtonText { get; set; } = "Maybe Later";

        public int Delay { get; set; }

        public virtual void Activate(bool noDelay = false)
        {
            this.IsOpen = true;
        }

        public virtual void Close()
        {
            this.IsOpen = false;
        }
    }
}
