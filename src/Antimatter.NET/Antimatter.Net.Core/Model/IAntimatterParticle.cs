using Antimatter.Net.Internal;
using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net.Model
{
    public interface IAntimatterParticle
    {
        string GetKey();
        ObjectReference Reference { get; set; }
        Reactor Reactor { get; set; }
    }
}
