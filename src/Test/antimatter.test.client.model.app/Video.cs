using Antimatter.Net;
using Antimatter.Net.Model;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Windows.Input;

namespace AntimatterJS.Sample.AppModel
{
    public class Video : ObservableObject
    {
        private int _handle;

        #region IUICommand Loaded Command

        private Command<int> _LoadedCommand;
        public ICommand LoadedCommand
        {
            get
            {
                return _LoadedCommand ?? (_LoadedCommand = new Command<int>(
                    async (int handle) =>
                    {
                        this._handle = handle;
                    }));
            }
        }

        #endregion


        #region IUICommand MediaStatus Command

        private Command<MultimediaEvent> _MediaStatusCommand;
        public ICommand MediaStatusCommand
        {
            get
            {
                return _MediaStatusCommand ?? (_MediaStatusCommand = new Command<MultimediaEvent>(
                    async (e) =>
                    {
                        this.Status = $"{TimeSpan.FromTicks(e.Timestamp)}:{e.Type}";
                    }));
            }
        }

        #endregion


        #region string Status property
        private string _Status;
        public string Status
        {
            get
            {
                return _Status;
            }
            set
            {
                if (_Status == value)
                    return;
                _Status = value;
                OnPropertyChanged();
            }
        }
        #endregion

        #region double StopPoint property
        private double _StopPoint = 5;
        public double StopPoint
        {
            get
            {
                return _StopPoint;
            }
            set
            {
                if (_StopPoint == value)
                    return;
                _StopPoint = value;
                OnPropertyChanged();
            }
        }
        #endregion



    }
}
