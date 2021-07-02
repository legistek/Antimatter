using Antimatter.Net.Model;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

namespace AntimatterJS.Sample.AppModel
{
    public class DocViewer : ObservableObject
    {
        #region int Page property
        private int _Page = 0;
        public int Page
        {
            get
            {
                return _Page;
            }
            set
            {
                if (_Page != value)
                {
                    _Page = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region float Scale property
        private float _Scale = 1;
        public float Scale
        {
            get
            {
                return _Scale;
            }
            set
            {
                if (_Scale != value)
                {
                    _Scale = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region IUICommand ZoomIn Command

        private Command _ZoomInCommand;
        public ICommand ZoomInCommand
        {
            get
            {
                return _ZoomInCommand ?? (_ZoomInCommand = new Command(
                    (arg) =>
                    {
                        this.Scale *= 2;
                    })
                {
                    Name = "Zoom In",
                    Icon = 0xF028,
                });
            }
        }

        #endregion

        #region IUICommand ZoomOut Command

        private Command _ZoomOutCommand;
        public ICommand ZoomOutCommand
        {
            get
            {
                return _ZoomOutCommand ?? (_ZoomOutCommand = new Command(
                    (arg) =>
                    {
                        this.Scale /= 2;
                    })
                {
                    Name = "Zoom Out",
                    Icon = 0xF029,
                });
            }
        }

        #endregion

        #region IUICommand NextPage Command

        private Command _NextPageCommand;
        public ICommand NextPageCommand
        {
            get
            {
                return _NextPageCommand ?? (_NextPageCommand = new Command(
                    (arg) =>
                    {
                        this.Page++;
                    })
                {
                    Name = "Next Page",
                    Icon = 0xF047,
                });
            }
        }

        #endregion

        #region IUICommand PrevPage Command

        private Command _PrevPageCommand;
        public ICommand PrevPageCommand
        {
            get
            {
                return _PrevPageCommand ?? (_PrevPageCommand = new Command(
                    (arg) =>
                    {
                        this.Page = Math.Max(0, this.Page - 1);
                    })
                {
                    Name = "Previous Page",
                    Icon = 0xF046,
                });
            }
        }

        #endregion
    }
}
