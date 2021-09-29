using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net.Internal
{
    public interface IReactorObject
    {
        Reactor Reactor { get; set; }

        IClient ReactorClient { get; set; }
    }
}
