using System;
using System.Collections;
using System.Collections.Generic;

namespace Antimatter.Net.Collections
{
    public interface ICanAddRemoveRanges
    {
        void AddRange(IEnumerable items);
        void RemoveRange(IEnumerable items);
    }
}
