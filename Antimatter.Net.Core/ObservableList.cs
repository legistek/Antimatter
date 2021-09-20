using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Text;

namespace Antimatter.Net
{
    public interface IObservableList
    {
        //void RemoveRange(IEnumerable collection);
        void RemoveRange(int index, int count);
        void AddRange(IList collection);
        void InsertRange(int index, IEnumerable collection);
        void Reset(IEnumerable collection);
    }

    public class ObservableList<T> : ObservableCollection<T>, IList<T>, IObservableList
    {
        bool _suspendNotification = false;

        public void Reset(IEnumerable collection)
        {
            this._suspendNotification = true;
            try
            {
                this.Clear();
                foreach (var item in collection)
                    this.Add((T)item);
            }
            finally
            {
                this._suspendNotification = false;
            }
            this.OnCollectionChanged(
                new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Reset));
        }       

        //public void RemoveRange(IEnumerable collection)
        //{
        //    this._suspendNotification = true;
        //    try
        //    {
        //        foreach (var item in collection)
        //            this.Remove((T)item);
        //    }
        //    finally
        //    {
        //        this._suspendNotification = false;
        //    }
        //    this.OnCollectionChanged(
        //        new NotifyCollectionChangedEventArgs(
        //            NotifyCollectionChangedAction.Remove, 
        //            collection));
        //}

        public void RemoveRange(int index, int count)
        {
            this._suspendNotification = true;
            List<T> removals = new List<T>();
            try
            {             
                while (count-- > 0)
                {
                    var removal = this[index];
                    removals.Add(removal);
                    this.RemoveItem(index);
                }
            }
            finally
            {
                this._suspendNotification = false;
            }
            this.OnCollectionChanged(
                new NotifyCollectionChangedEventArgs(
                    NotifyCollectionChangedAction.Remove, 
                    removals, 
                    index));
        }

        public void InsertRange(int index, IEnumerable collection)
        {
        }

        public void AddRange(IList collection)
        {
            this._suspendNotification = true;
            try
            {
                foreach (var item in collection)
                    this.Add((T)item);
            }
            finally
            {
                this._suspendNotification = false;
            }
            this.OnCollectionChanged(
                new NotifyCollectionChangedEventArgs(
                    NotifyCollectionChangedAction.Add, 
                    collection));
        }

        protected override void OnCollectionChanged(NotifyCollectionChangedEventArgs e)        
        {
            if (_suspendNotification)
                return;
            base.OnCollectionChanged(e);
        }
    }
}
