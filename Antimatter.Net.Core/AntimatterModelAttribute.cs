using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net
{
    [AttributeUsage(AttributeTargets.Class|AttributeTargets.Property, Inherited = true)]
    public class AntimatterModelAttribute : Attribute
    {
        public bool Ignore { get; set; }

        public string TypescriptType { get; set; }
    }
}
