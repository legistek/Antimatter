using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net.Internal
{
    internal class ObjectReference
    {
        int _refCount = 0;

        internal int Handle { get; set; }

        internal object Object
        {
            get;
            set;
        }

        public void AddRef()
        {
            _refCount++;
        }

        public void Release(Reactor mgr)
        {
            _refCount--;
            if (_refCount == 0)
            {
                mgr.FinalDispose(this);
                Console.WriteLine($"Fully releasing {this.Object?.ToString()}");
                this.Object = null; // free for GC                
            }
        }
    }
}
