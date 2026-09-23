using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net.Internal
{
    internal static class EnumerableExtensions
    {
        public static bool AtLeast(this IEnumerable source, int n)
        {
            if (source is IList list)
                return list.Count >= n;
            if (source is null)
                return false;
            int i = 0;
            foreach (var item in source)
            {
                if (++i >= n)
                    return true;
            }
            return false;
        }
    }
}
