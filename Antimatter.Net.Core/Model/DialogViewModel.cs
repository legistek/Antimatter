using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;

namespace Antimatter.Net.Model
{
    [AntimatterModel]
    public abstract class DialogViewModel : ObservableObject
    {
        public abstract string DialogTemplate { get; }

        public virtual string Title { get; }

        public virtual ushort Icon { get; }

        #region Command OK Command

        private Command _OKCommand;
        public Command OKCommand
        {
            get
            {
                return _OKCommand ?? (_OKCommand = new Command(
                    async (arg) =>
                    {
                        var ctx = (Reactor.SessionContext as IDialogContainer);
                        if (ctx == null)
                            return;
                        if (await this.OnSubmitAsync())
                            ctx.Dialogs.Remove(this);
                    })
                {
                    Name = "OK",
                    Icon = 0,
                    IsDefault = true,
                    GetIsEnabled = CanSubmit
                });
            }
        }

        #endregion

        #region Command Cancel Command

        private Command _CancelCommand;
        public Command CancelCommand
        {
            get
            {
                return _CancelCommand ?? (_CancelCommand = new Command(
                    async (args) =>
                    {
                        var ctx = (Reactor.SessionContext as IDialogContainer);
                        if (ctx == null)
                            return;
                        if (await this.OnCancelAsync())
                            ctx.Dialogs.Remove(this);
                    })
                {
                    Name = "Cancel",
                    ToolTip = "Cancel the operation and close this window.",
                    Icon = 0xF00C,
                    GetIsEnabled = CanCancel
                });
            }
        }

        #endregion

        #region CommandCollection PrimaryCommands
        CommandCollection _PrimaryCommands;
        public virtual CommandCollection PrimaryCommands
        {
            get
            {
                return _PrimaryCommands ?? (_PrimaryCommands = new CommandCollection
                {
                    OKCommand,
                    CancelCommand,
                });
            }
        }
        #endregion

        #region CommandCollection SecondaryCommands property
        public virtual CommandCollection SecondaryCommands
        {
            get
            {
                return null;
            }
        }
        #endregion

        public virtual bool CanSubmit()
        {
            return true;
        }

        public virtual bool CanCancel()
        {
            return true;
        }

        public virtual async Task<bool> OnSubmitAsync()
        {
            return true;
        }

        public virtual async Task<bool> OnCancelAsync()
        {
            return true;
        }

        public async Task ShowDialogAsync()
        {
            var ctx = (Reactor.SessionContext as IDialogContainer);
            if (ctx == null)
                return;
            ctx.Dialogs.Add(this);
        }
    }
}
