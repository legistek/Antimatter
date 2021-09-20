using System;
using System.Linq;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using System.Runtime.CompilerServices;

namespace Antimatter.Net.Model
{
    public class CommandCollection : ObservableCollection<Command>
    {
        private string _name;

        public CommandCollection([CallerMemberName] string name = null)
        {
            _name = name;
        }

        public override string ToString()
        {
            var strs =
                string.Concat(this.Items.Select(c => c.ToString() + " "));
            return this._name + $" {{{strs}}}";
        }
    }
}
