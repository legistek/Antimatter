using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net.Model
{
    public class DataGridColumn
    {
        public string Key { get; set; }

        public string BindingPath { get; set; }

        public ModelValueType Type { get; set; } = ModelValueType.String;

        public string Header { get; set; }
        
        public int Width { get; set; }

        public bool CanResize { get; set; }

        public bool IsFrozen { get; set; }

        public bool IsSelector { get; set; }

        public bool IsColorIndicator { get; set; }

        public bool CanSort { get; set; }
    }
}
