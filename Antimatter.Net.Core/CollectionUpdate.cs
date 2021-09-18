using System;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Runtime.InteropServices;

namespace Antimatter.Net
{
    [StructLayout(LayoutKind.Explicit)]
    public class CollectionUpdate
    {
        [FieldOffset(0)]
        private NotifyCollectionChangedAction _action;

        public NotifyCollectionChangedAction Action
        {
            get => _action;
            set => _action = value;
        }

        [FieldOffset(4)]
        private int _startIndex;
        public int Index
        {
            get => _startIndex;
            set => _startIndex = value;
        }

        [FieldOffset(8)]
        public int _count;
        public int Count
        {
            get => _count;
            set => _count = value;
        }

        [FieldOffset(12)]
        private ModelValue[] _items;
        public ModelValue[] Items
        {
            get => _items;
            set => _items = value;
        }
    }
}