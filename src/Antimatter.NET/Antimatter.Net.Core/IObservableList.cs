using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Text;

namespace Antimatter.Net
{
    /// <summary>
    /// Provides an interface for collections that permit bulk operations
    /// resulting in a single collection change notification. When bound Model
    /// objects implement this interface, the Antimatter Reactor will use
    /// these methods when updating collections from View-side actions rather
    /// than the less efficient <see cref="Collection{T}.Add(T)"/> and
    /// <see cref="Collection{T}.Remove(T)"/> which result in multiple 
    /// <see cref="INotifyCollectionChanged.CollectionChanged"/> events.
    /// </summary>
    public interface IObservableList : INotifyCollectionChanged
    {
        /// <summary>
        /// Adds a group of items to the end of the collection,
        /// resulting in a single <see cref="NotifyCollectionChangedAction.Add"/>
        /// notification.
        /// </summary>
        /// <param name="collection">The items to add.</param>
        void AddRange(IEnumerable collection);

        /// <summary>
        /// Removes a group of items from the collection,
        /// resulting in a single <see cref="NotifyCollectionChangedAction.Remove"/>
        /// notification.
        /// </summary>
        /// <param name="collection">The items to remove.</param>
        void RemoveRange(IEnumerable collection);

        /// <summary>
        /// Replaces the entire contents of the collection with new items,
        /// resulting in a single <see cref="NotifyCollectionChangedAction.Reset"/>
        /// notification.
        /// </summary>
        /// <param name="collection">The new items in the collection.</param>
        void Reset(IEnumerable collection);
    }

    public interface ISortableObservableList : IObservableList
    {
        string SortField { get; set; }
    }
}
