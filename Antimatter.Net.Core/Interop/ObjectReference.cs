using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net.Interop
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

        public void Release(ObjectManager mgr)
        {
            _refCount--;
            if (_refCount == 0)
            {
                mgr.FinalDispose(this);
                this.Object = null; // free for GC
            }
        }
    }
}
