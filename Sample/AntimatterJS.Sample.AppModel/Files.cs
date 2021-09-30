using System;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using System.Text;
using System.Windows.Input;

using Antimatter.Net;
using Antimatter.Net.Model;

namespace AntimatterJS.Sample.AppModel
{
    public class Files : ObservableObject
    {
        #region IUICommand SelectFile Command

        private Command _SelectFileCommand;
        public ICommand SelectFileCommand
        {
            get
            {
                return _SelectFileCommand ?? (_SelectFileCommand = new Command(
                    async (arg) =>
                    {
                        var reactor = Reactor.GetFor(this);
                        if (reactor == null)
                            return;

                        this.SelectedFile = (await reactor.SelectFileAsync(".txt")).FirstOrDefault();
                    })
                {
                    Name = "Select File",
                });
            }
        }

        #endregion

        #region IUICommand LoadFile Command

        private Command _LoadFileCommand;
        public ICommand LoadFileCommand
        {
            get
            {
                return _LoadFileCommand ?? (_LoadFileCommand = new Command(
                    async (arg) =>
                    {
                        if (this.SelectedFile == null)
                            return;
                        this.IsLoading = true;
                        try
                        {
                            this._LoadFileCommand.IsEnabled = false;
                            var bytes = await this.SelectedFile.ReadContentsAsync();
                            this.FileContents = Encoding.UTF8.GetString(bytes);
                        }
                        finally
                        {
                            this.IsLoading = false;
                            this._LoadFileCommand.IsEnabled = true;
                        }
                    })
                {
                    Name = "Load Contents",
                    IsEnabled = false
                });
            }
        }

        #endregion

        #region IUICommand DropFiles Command

        private Command _DropFilesCommand;
        public ICommand DropFilesCommand
        {
            get
            {
                return _DropFilesCommand ?? (_DropFilesCommand = new Command<ClientFile[]>(
                    async (arg) =>
                    {
                        if (arg == null || arg.Length == 0)
                            return;
                        this.SelectedFile = arg[0];
                    })
                {
                });
            }
        }

        #endregion

        #region ClientFile SelectedFile property
        private ClientFile _SelectedFile;
        public ClientFile SelectedFile
        {
            get
            {
                return _SelectedFile;
            }
            set
            {
                if (_SelectedFile != value)
                {
                    _SelectedFile = value;
                    OnPropertyChanged();
                    this._LoadFileCommand.IsEnabled = value != null;
                }
            }
        }
        #endregion

        #region string FileContents property
        private string _FileContents;
        public string FileContents
        {
            get
            {
                return _FileContents;
            }
            set
            {
                if (_FileContents != value)
                {
                    _FileContents = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region bool IsLoading property
        private bool _IsLoading;
        public bool IsLoading
        {
            get
            {
                return _IsLoading;
            }
            set
            {
                if (_IsLoading != value)
                {
                    _IsLoading = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

    }
}
