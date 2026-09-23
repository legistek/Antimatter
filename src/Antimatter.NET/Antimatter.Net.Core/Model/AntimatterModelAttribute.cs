using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net.Model
{
    [AttributeUsage(AttributeTargets.Class|AttributeTargets.Property, Inherited = true)]
    public class AntimatterModelAttribute : Attribute
    {
        public bool Ignore { get; set; }

        public string TypescriptType { get; set; }

        public bool UseJSONNames { get; set; }
    }
}
