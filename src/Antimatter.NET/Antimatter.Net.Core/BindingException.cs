using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net
{
    public class BindingException : Exception
    {
        public BindingException()
        {
        }

        public BindingException(string message): base(message)
        {
        }
    }
}
