using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using System.Windows.Input;

namespace Antimatter.Net.Model
{
    public abstract class DialogViewModel : ObservableObject
    {
        public abstract string Template { get; }

        public virtual string Title { get; }

        public virtual ushort Icon { get; }

        public async Task ShowDialogAsync()
        {
            var ctx = (Reactor.SessionContext as IDialogContainer);
            if (ctx == null)
                return;
            ctx.Dialogs.Add(this);
        }

        #region IUICommand Cancel Command

        private Command _CancelCommand;
        public ICommand CancelCommand
        {
            get
            {
                return _CancelCommand ?? (_CancelCommand = new Command(
                    async (args) =>
                    {
                        var ctx = (Reactor.SessionContext as IDialogContainer);
                        if (ctx == null)
                            return;
                        ctx.Dialogs.Remove(this);
                    })
                {
                    Name = "Cancel",
                    ToolTip = "",
                    Icon = 0xE921
                });
            }
        }

        #endregion

    }
}
