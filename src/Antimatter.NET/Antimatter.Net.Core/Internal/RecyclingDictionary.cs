using System;
using System.Collections.Generic;
using System.Linq;

namespace Antimatter.Net.Internal
{
    // React seems to not like us re-using keys, so we either have to do
    // some fuckery like in RecyclingDictionary below, or just use a plain dictionary
    // with an ever-incrementing key. 
    internal class KeyDictionary<T>
    {
        Dictionary<int, T> _items = new Dictionary<int, T>();
        int _lastAssignedKeyIndex = 1;   // so we actually start with 1

        public int Add(T item)
        {
            var idx = _lastAssignedKeyIndex++;
            _items[idx] = item;
            return idx;
        }

        public bool TryGetValue(int key, out T item)
        {
            return _items.TryGetValue(key, out item);
        }

        public void Remove(int key)
        {
            _items.Remove(key);
        }
    }

    internal class RecyclingDictionary<T> 
    {
        GrowableArray<T> _items = new GrowableArray<T>();
        Queue<int> _freedKeys = new Queue<int>();
        int _lastAssignedKeyIndex = 0;   // so we actually start with 1

        public int Add(T item)
        {
            var key = GetNextKey();
            var idx = GetKeyArrayIndex(key);
            _items[idx] = item;
            return key;
        }

        public bool TryGetValue(int key, out T item)
        {
            item = default(T);
            if (_freedKeys.Contains(key))
            {
                // should never happen!
            }

            var idx = GetKeyArrayIndex(key);

            if (_items.Count < idx + 1)
                return false;
            item = _items[idx];
            return true;
        }

        public void Remove(int key)
        {
            var idx = GetKeyArrayIndex(key);
            _items[idx] = default;
            //Reactor.DebugWriteLine($"Freeing key {key}");
            _freedKeys.Enqueue(key);
        }

        private int GetNextKey()
        {
            if (_freedKeys.Count > 0)
            {
                int key = _freedKeys.Dequeue();
                //Reactor.DebugWriteLine($"Reusing key {key}");
                return GetKeyNextGeneration(key);
            }
            _lastAssignedKeyIndex++;
            //Reactor.DebugWriteLine($"Issuing key {_lastAssignedKey}");
            return _lastAssignedKeyIndex;
        }

        private int GetKeyNextGeneration(int oldKey)
        {
            return oldKey + 0x00010000;
        }

        private int GetKeyArrayIndex(int key)
        {
            return key & 0xFFFF;
        }
    }
}