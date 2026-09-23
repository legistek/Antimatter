using System;
using System.Linq;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using System.Runtime.CompilerServices;
using System.Collections.Specialized;

using Antimatter.Net.Collections;

namespace Antimatter.Net.Model
{
    public class CommandCollection : ObservableList<Command>
    {
        private string _name;

        public CommandCollection([CallerMemberName] string name = null)
        {
            _name = name;
        }

        public override string ToString()
        {
            var strs =
                string.Concat(this.Select(c => c.ToString() + " "));
            return this._name + $" {{{strs}}}";
        }
    }
}
