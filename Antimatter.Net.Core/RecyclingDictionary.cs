using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;

namespace Antimatter.Net
{
    public class RecyclingDictionary<T> : Dictionary<int, T>
    {
        HashSet<int> _freedKeys = new HashSet<int>();
        int _lastAssignedKey = -1;

        public int Add(T item)
        {
            var key = GetNextKey();
            base[key] = item;
            return key;
        }

        public new void Remove(int key)
        {
            base.Remove(key);
            _freedKeys.Add(key);
        }

        private int GetNextKey()
        {
            if (_freedKeys.Count > 0)
            {
                int key = _freedKeys.First();
                _freedKeys.Remove(key);
                return key;
            }
            return ++_lastAssignedKey;
        }
    }
}