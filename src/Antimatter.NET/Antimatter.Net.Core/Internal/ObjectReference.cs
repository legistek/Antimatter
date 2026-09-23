using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net.Internal
{
    public class ObjectReference
    {
        int _refCount = 0;
        string _objectWas = null;

        public int Handle { get; set; }

        internal object Object
        {
            get;
            set;
        }

        public void AddRef()
        {
            _refCount++;
        }

        public void Release(Reactor reactor)
        {
            _refCount--;
            if (_refCount == 0)
            {                
                reactor.FinalDispose(this);
#if DEBUG
                this._objectWas = this.Object?.ToString();
#endif
                this.Object = null; // free for GC
            }
            if (_refCount < 0)
            {
#if DEBUG
                throw new InvalidOperationException($"Object {this.Handle} ({this._objectWas}) already disposed.");
#endif
            }
        }
    }
}
