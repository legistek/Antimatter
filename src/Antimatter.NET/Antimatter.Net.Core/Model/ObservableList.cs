using System;
using System.Linq;
using System.Reflection;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Text;
using System.Collections;
using System.Security.Cryptography;
using System.Runtime.CompilerServices;
using Antimatter.Net.Internal;
using System.Windows.Input;

namespace Antimatter.Net.Collections
{
    public static class ObservableList
    {
        public static bool UseRangedNotifications { get; set; } = true;

        public static string SortDescendingPrefix
        {
            get => _sortDescendingPrefix;
            set
            {
                if (_sortDescendingPrefix == value)
                    return;
                _sortDescendingPrefix = value;
                if (string.IsNullOrEmpty(value))
                    _sortDescendingPrefix = c_defaultDescPrefix;
            }
        }

        private static string _sortDescendingPrefix = c_defaultDescPrefix;

        private const string c_defaultDescPrefix = "!";
    }

    /// <summary>
    /// An extension of <see cref="ObservableCollection{T}"/> that implements
    /// <see cref="IObservableList"/>
    /// </summary>
    /// <typeparam name="T">The collection item type.</typeparam>
    public class ObservableList<T> : ICollection<T>,
        INotifyCollectionChanged,
        INotifyPropertyChanged,
        ISortableObservableList,
        IReadOnlyList<T>,
        ICanAddRemoveRanges,
        IList
    {
        public ObservableList()
        {
        }

        public ObservableList(IEnumerable<T> items)
        {
            if (items?.Any() != true)
                return;
            this.AddInitialItems(items);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        public event NotifyCollectionChangedEventHandler CollectionChanged;

        public int IndexOf(T item)
        {
            return this.EffectiveList?.IndexOf(item) ?? -1;
        }

        public T this[int index]
        {
            get => this.EffectiveList[index];
        }

        Func<T, IComparable> _sortFunction;
        public Func<T, IComparable> SortFunction
        {
            get => _sortFunction;
            set
            {
                if (_sortFunction == value)
                    return;
                bool observes = this.ObservesMembers;
                _sortFunction = value;
                if (observes != this.ObservesMembers)
                    this.OnMemberObservabilityChange();
                OnPropertyChanged(nameof(SortFunction));
                this.OnCollectionChanged(
                    new NotifyCollectionChangedEventArgs(
                        NotifyCollectionChangedAction.Reset),
                    reSort: true,
                    reFilter: false);
            }
        }

        #region T ScrollAnchor property
        private T _ScrollAnchor;
        public T ScrollAnchor
        {
            get
            {
                return _ScrollAnchor;
            }
            set
            {
                if (object.Equals(_ScrollAnchor, value))
                    return;
                _ScrollAnchor = value;
                OnPropertyChanged();
            }
        }
        #endregion

        /// <summary>
        /// Forces a scroll anchor update, even if the value
        /// is unchanged. (The UI may have scrolled away from
        /// the item without a model update).
        /// </summary>
        public void ForceScrollAnchor(T anchor)
        {
            this.ScrollAnchor = default;
            this.ScrollAnchor = anchor;
        }

        #region string SortField property
        private string _SortField;
        public string SortField
        {
            get
            {
                return _SortField;
            }
            set
            {
                if (_SortField == value)
                    return;
                bool observes = this.ObservesMembers;
                _SortField = value;
                if (observes != this.ObservesMembers)
                    this.OnMemberObservabilityChange();
                OnPropertyChanged();
                this.Refresh();
            }
        }
        #endregion

        /// <summary>
        /// Mutes all notifications coming from this <see cref="ObservableList"/>.
        /// Use prior to making a significant number of updates.
        /// Call <see cref="Unmute"/> when changes are complete to
        /// refresh the list for the UI.
        /// </summary>
        public void Mute()
        {
            _muted = true;
        }

        /// <summary>
        /// Call after completing muted changes initiated with <see cref="Mute"/>.
        /// </summary>
        public void Unmute()
        {
            _muted = false;
            this.Refresh();
        }

        public void Refresh()
        {
            this.OnCollectionChanged(
                new NotifyCollectionChangedEventArgs(
                    NotifyCollectionChangedAction.Reset),
                reSort: true,
                reFilter: true);
        }

        HashSet<string> _filterTriggerProperties;
        public IReadOnlyCollection<string> FilterTriggerProperties
        {
            get => _filterTriggerProperties ?? (_filterTriggerProperties = new HashSet<string>());
        }

        public void AddFilterTriggerProperty(string property)
        {
            bool observes = this.ObservesMembers;
            this._filterTriggerProperties = _filterTriggerProperties ?? new HashSet<string>();
            this._filterTriggerProperties.Add(property);
            if (observes != this.ObservesMembers)
                this.OnMemberObservabilityChange();
        }

        public void RemoveFilterTriggerProperty(string property)
        {
            if (this._filterTriggerProperties == null)
                return;
            bool observes = this.ObservesMembers;
            this._filterTriggerProperties.Remove(property);
            if (observes != this.ObservesMembers)
                this.OnMemberObservabilityChange();
        }

        HashSet<string> _sortTriggerProperties;
        public IReadOnlyCollection<string> SortTriggerProperties
        {
            get => _sortTriggerProperties ?? (_sortTriggerProperties = new HashSet<string>());
        }

        public void AddSortTriggerProperty(string property)
        {
            bool observes = this.ObservesMembers;
            this._sortTriggerProperties = this._sortTriggerProperties ?? new HashSet<string>();
            this._sortTriggerProperties.Add(property);
            if (observes != this.ObservesMembers)
                this.OnMemberObservabilityChange();
        }

        public void RemoveSortTriggerProperty(string property)
        {
            if (this._sortTriggerProperties == null)
                return;
            bool observes = this.ObservesMembers;
            this._sortTriggerProperties.Remove(property);
            if (observes != this.ObservesMembers)
                this.OnMemberObservabilityChange();
        }

        public Func<T, bool> Filter
        {
            get => _Filter;
            set
            {
                if (object.ReferenceEquals(_Filter, value))
                    return;
                bool observes = this.ObservesMembers;
                _Filter = value;
                if (observes != this.ObservesMembers)
                    this.OnMemberObservabilityChange();
                OnCollectionChanged(
                    new NotifyCollectionChangedEventArgs(
                        NotifyCollectionChangedAction.Reset),
                    reSort: false,
                    reFilter: true);
            }
        }

        public void Replace(T oldItem, T newItem)
        {
            int index = this.UnfilteredItems.IndexOf(oldItem);
            if (index == -1)
                return;
            this.ReplaceInternalItem(index, newItem);
            this.OnCollectionChanged(
                new NotifyCollectionChangedEventArgs(
                     NotifyCollectionChangedAction.Replace,
                     newItem,
                     oldItem,
                     index));
        }

        public int TrueCount
        {
            get => this.UnfilteredItems.Count;
        }

        public int Count
        {
            get => this.EffectiveList.Count;
        }

        public bool IsEmpty => this.Count == 0;

        public bool IsReadOnly => false;

        public void Add(T item)
        {
            if (!this.ShouldAdd(item))
                return;
            bool sorted = this.Sorts;
            bool filtered = this.Filters;

            if (!sorted && !filtered)
            {
                // Handle simplest case first
                this.AddInternalItem(item);
                this.OnCollectionChanged(
                    new NotifyCollectionChangedEventArgs(
                        NotifyCollectionChangedAction.Add,
                        item,
                        this.UnfilteredItems.Count - 1));
            }
            else if (!filtered)
            {
                // sorted but not filtered
                var insertionIndex = this.GetInsertionIndex(item, this.UnfilteredItems);
                this.AddInternalItem(item, index: insertionIndex);
                this.OnCollectionChanged(
                    new NotifyCollectionChangedEventArgs(
                        NotifyCollectionChangedAction.Add,
                        item,
                        insertionIndex),
                    reSort: false,
                    reFilter: false);
                return;
            }
            else if (!sorted)
            {
                // filtered but not sorted
                this.AddInternalItem(item, actualList: this.UnfilteredItems);
                if (this.Filter(item))
                    this.AddInternalItem(item, actualList: this._filteredItems);
                this.OnCollectionChanged(
                    new NotifyCollectionChangedEventArgs(
                        NotifyCollectionChangedAction.Add,
                        item,
                        this._filteredItems.Count - 1),
                    reSort: false,
                    reFilter: false);
                return;
            }
            else
            {
                // Filtered AND sorted
                var filteredInsertionIndex = this.GetInsertionIndex(item, this._filteredItems);
                this.AddInternalItem(item, index: filteredInsertionIndex, actualList: this._filteredItems);
                var completeInsertionIndex = this.GetInsertionIndex(item, this.UnfilteredItems);
                this.AddInternalItem(item, index: completeInsertionIndex, actualList: this.UnfilteredItems);
                this.OnCollectionChanged(
                    new NotifyCollectionChangedEventArgs(
                        NotifyCollectionChangedAction.Add,
                        item,
                        filteredInsertionIndex),
                    reSort: false,
                    reFilter: false);
            }
        }

        protected virtual bool ShouldAdd(T item)
        {
            return true;
        }

        private int GetInsertionIndex(T item, ICollection<T> actualCollection)
        {
            var sorter = this.GetSorter(out var desc);
            if (sorter == null)
                return this.Count;

            int i = 0;
            if (!desc)
            {
                i = 0;
                while (actualCollection.Count > i &&
                       sorter(actualCollection.ElementAt(i))?.CompareTo(sorter(item)) <= 0)
                    i++;
            }
            else
            {
                i = actualCollection.Count;
                while (i > 0 &&
                       sorter(actualCollection.ElementAt(i - 1))?.CompareTo(sorter(item)) <= 0)
                    i--;
            }

            return i;
        }

        public void Clear()
        {
            this.ClearInternalItems();
            this.OnCollectionChanged(
                new NotifyCollectionChangedEventArgs(
                    NotifyCollectionChangedAction.Reset));
        }

        public bool Contains(T item)
        {
            return this.UnfilteredItems.Contains(item) &&
                this.Filter?.Invoke(item) != false;
        }

        public void CopyTo(T[] array, int arrayIndex)
        {
            this.EffectiveList.CopyTo(array, arrayIndex);
        }

        private void ResetUnfilteredSortPosition(T item)
        {
            if (!this.Sorts || !this.Filters)
                return;
            var newFullIndex = this.GetInsertionIndex(item, this.UnfilteredItems);
            if (newFullIndex > 0 && object.ReferenceEquals(item, this.UnfilteredItems[newFullIndex - 1]))
                return;
            var oldFullIndex = this.UnfilteredItems.IndexOf(item);
            this.UnfilteredItems.RemoveAt(oldFullIndex);
            if (oldFullIndex < newFullIndex)
                newFullIndex--;
            this.UnfilteredItems.Insert(newFullIndex, item);
        }

        /// <summary>
        /// Informs the <see cref="ObservableList"/> that the sort position
        /// and/or filter status of the item may have changed, which
        /// triggers the appropriate <see cref="CollectionChanged"/>
        /// notifications if so. This is done automatically if <see cref="SortField"/>,
        /// <see cref="FilterTriggerProperties"/>, or
        /// <see cref="SortTriggerProperties"/> have changed
        /// for the item (assuming the item implements
        /// <see cref="INotifyPropertyChanged"/>). Use this method
        /// to force this reevaluation where automatic tracking is
        /// infeasible.
        /// </summary>
        /// <param name="item"></param>
        public void ReapplyVisual(T item)
        {
            if (!this.Filters && !this.Sorts)
                return;
            bool isNowVisible = this.Filter == null || this.Filter(item);
            var visibleCollection = this._filteredItems ?? this.UnfilteredItems;
            int oldVisibleIndex, newVisibleIndex;

            if (!isNowVisible)
            {
                // Must be filtering
                oldVisibleIndex = visibleCollection.IndexOf(item);
                if (oldVisibleIndex != -1)
                {
                    this.OnCollectionChanged(
                        new NotifyCollectionChangedEventArgs(
                            NotifyCollectionChangedAction.Remove,
                            item,
                            oldVisibleIndex),
                        reSort: false,
                        reFilter: false);
                }
                ResetUnfilteredSortPosition(item);
                return;
            }

            oldVisibleIndex = visibleCollection.IndexOf(item);
            if (oldVisibleIndex == -1)
            {
                // Newly visible (must be filtering)
                newVisibleIndex = this.GetInsertionIndex(item, visibleCollection);
                visibleCollection.Insert(newVisibleIndex, item);
                this.OnCollectionChanged(
                    new NotifyCollectionChangedEventArgs(
                        NotifyCollectionChangedAction.Add,
                        item,
                        newVisibleIndex),
                        reSort: false,
                        reFilter: false);
                ResetUnfilteredSortPosition(item);
                return;
            }

            // Visibility hasn't changed. Has Sort?

            if (!this.Sorts)
                // Doesn't sort
                return;

            newVisibleIndex = this.GetInsertionIndex(item, visibleCollection);
            if (newVisibleIndex == oldVisibleIndex + 1)
            {
                // Already in right position
                // Presume full collection is right also if filtered
                return;
            }

            // Remove from old position
            visibleCollection.RemoveAt(oldVisibleIndex);
            this.OnCollectionChanged(
                new NotifyCollectionChangedEventArgs(
                    NotifyCollectionChangedAction.Remove,
                    item,
                    oldVisibleIndex),
                reSort: false,
                reFilter: false);

            // Add at new position
            if (oldVisibleIndex < newVisibleIndex)
                newVisibleIndex--;
            visibleCollection.Insert(newVisibleIndex, item);
            this.OnCollectionChanged(
                new NotifyCollectionChangedEventArgs(
                    NotifyCollectionChangedAction.Add,
                    item,
                    newVisibleIndex),
                reSort: false,
                reFilter: false);

            this.ResetUnfilteredSortPosition(item);
        }

        /// <summary>
        /// Removes an item from the collection, irrespective of
        /// whether it is currently filtered.
        /// However, <see cref="CollectionChanged"/> is only
        /// raised if the item was in the filtered list, if
        /// applicable.
        /// </summary>
        /// <param name="item">The item.</param>
        /// <returns>
        /// <c>true</c> if the item was removed, irrespective of
        /// filtering.
        /// </returns>
        public bool Remove(T item)
        {
            int fullListIndex = this.UnfilteredItems.IndexOf(item);
            if (fullListIndex == -1)
                // isn't here at all
                return false;

            int filteredListIndex = -1;
            if (this.Filters && this.Filter(item))
                filteredListIndex = this._filteredItems.IndexOf(item);

            // Must always be true
            this.RemoveInternalItem(fullListIndex, actualList: this.UnfilteredItems);

            if (this.Filters)
            {
                if (!this.Filter(item))
                    return true;   // removed from main but not filtered so return true but don't raise notification
                this.RemoveInternalItem(filteredListIndex, actualList: this._filteredItems);
            }

            this.OnCollectionChanged(
                new NotifyCollectionChangedEventArgs(
                    NotifyCollectionChangedAction.Remove,
                    item,
                    filteredListIndex > -1 ? filteredListIndex : fullListIndex),
                reSort: false,
                reFilter: false);

            return true;
        }

        public void Reset(IEnumerable collection)
        {
            this.ClearInternalItems();
            foreach (var item in collection)
                this.AddInternalItem((T)item);
            this.OnCollectionChanged(
                new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Reset));
        }

        public void RemoveRange(IEnumerable collection)
        {
            if (!collection.AtLeast(1))
                return;
            if (!collection.AtLeast(2))
            {
                if (collection.Cast<object>().FirstOrDefault() is T tobj)
                    this.Remove(tobj);
                return;
            }

            var removals = new List<T>();
            foreach (var item in collection)
            {
                if (!(item is T titem))
                    continue;

                if (this.Filters)
                {
                    if (this.RemoveInternalItem(titem, this._filteredItems))
                        removals.Add(titem);
                    this.RemoveInternalItem(titem, this.UnfilteredItems);
                }
                else
                {
                    if (this.RemoveInternalItem(titem, this.UnfilteredItems))
                        removals.Add(titem);
                }
            }
            this.OnCollectionChanged(
                new NotifyCollectionChangedEventArgs(
                    NotifyCollectionChangedAction.Remove,
                    removals));
        }

        public void AddRange(IEnumerable collection)
        {
            if (!collection.AtLeast(1))
                return;
            if (!collection.AtLeast(2))
            {
                if (collection.Cast<object>().FirstOrDefault() is T tobj)
                    this.Add(tobj);
                return;
            }

            int startIndex = this.UnfilteredItems.Count;
            var additions = new List<T>();
            foreach (var item in collection)
            {
                if (item is T titem)
                {
                    this.AddInternalItem(titem);
                    additions.Add(titem);
                }
            }

            this.OnCollectionChanged(
                new NotifyCollectionChangedEventArgs(
                    NotifyCollectionChangedAction.Add,
                    additions,
                    startIndex));
        }

        public IReadOnlyList<T> Unfiltered => this.UnfilteredItems;

        IEnumerator<T> IEnumerable<T>.GetEnumerator()
        {
            return this.EffectiveList.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return (this as IEnumerable<T>).GetEnumerator();
        }

        protected List<T> EffectiveList => this._filteredItems ?? this.UnfilteredItems;

        protected List<T> UnfilteredItems { get; } = new List<T>();

        private void OnMemberObservabilityChange()
        {
            if (!typeof(INotifyPropertyChanged).IsAssignableFrom(typeof(T)))
                return;

            if (this.ObservesMembers)
            {
                foreach (var item in this.UnfilteredItems)
                {
                    if (!(item is INotifyPropertyChanged inpc))
                        continue;
                    inpc.PropertyChanged += OnItemPropertyChanged;
                }
            }
            else
            {
                foreach (var item in this.UnfilteredItems)
                {
                    if (!(item is INotifyPropertyChanged inpc))
                        continue;
                    inpc.PropertyChanged -= OnItemPropertyChanged;
                }
            }
        }

        private void ReapplyFilter()
        {
            if (this.Filter != null)
                this._filteredItems = this.UnfilteredItems.Where(this.Filter).ToList();
            else
                this._filteredItems = null;
        }

        protected virtual void OnCollectionChangeOverride(NotifyCollectionChangedEventArgs e)
        {
        }

        protected virtual void OnInternalCollectionChanged(IEnumerable<T> items, bool removed)
        {
        }

        private void OnCollectionChanged(
            NotifyCollectionChangedEventArgs e,
            bool reSort = true,
            bool reFilter = true)
        {
            if (_muted)
                return;

            if (Sorts && reSort)
                this.SortItemsAndReapplyFilter();
            else if (reFilter)
                this.ReapplyFilter();

            NotifyCollectionChangedEventArgs finalArgs = null;

            if ((reSort || reFilter) &&
                (this.Filter != null || !string.IsNullOrEmpty(SortField) || this.SortFunction != null))
            {
                finalArgs = new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Reset);
                this.CollectionChanged?.Invoke(
                    this,
                    finalArgs);
            }
            else
            {
                finalArgs = e;
                if (ObservableList.UseRangedNotifications)
                    this.CollectionChanged?.Invoke(this, e);
                else if (e.Action == NotifyCollectionChangedAction.Add && e.NewItems?.Count > 0)
                {
                    int start = e.NewStartingIndex;
                    foreach (var item in e.NewItems)
                    {
                        this.CollectionChanged?.Invoke(
                            this,
                            new NotifyCollectionChangedEventArgs(
                                NotifyCollectionChangedAction.Add,
                                item,
                                start++));
                    }
                }
                else if (e.Action == NotifyCollectionChangedAction.Remove && e.OldItems?.Count > 0)
                {
                    foreach (var item in e.OldItems)
                    {
                        this.CollectionChanged?.Invoke(
                            this,
                            new NotifyCollectionChangedEventArgs(
                                NotifyCollectionChangedAction.Remove,
                                item,
                                e.OldStartingIndex));
                    }
                }
                else
                {
                    this.CollectionChanged?.Invoke(this, e);
                }
            }

            this.OnPropertyChanged(nameof(Count));
            this.OnPropertyChanged(nameof(IsEmpty));

            OnCollectionChangeOverride(finalArgs);
        }

        private Func<T, IComparable> GetSorter(out bool descending)
        {
            descending = false;
            Func<T, IComparable> sorter = null;
            if (SortFunction == null && !string.IsNullOrEmpty(this.SortField))
            {
                string sortProp = this.SortField;
                if (sortProp.StartsWith(ObservableList.SortDescendingPrefix))
                {
                    descending = true;
                    sortProp = sortProp.Substring(ObservableList.SortDescendingPrefix.Length);
                }

                PropertyInfo pi = this.UnfilteredItems?.FirstOrDefault()?.GetType()?.GetProperty(sortProp);

                if (pi == null)
                    return null;
                sorter = (item) => pi.GetValue(item) as IComparable;
            }
            else
            {
                sorter = this.SortFunction;
            }
            return sorter;
        }

        private bool Sorts => _muted ? false : this.WouldSort;

        private bool WouldSort => !string.IsNullOrEmpty(SortField) || SortFunction != null;

        private bool Filters => _muted ? false : this.WouldFilter;

        private bool WouldFilter => this.Filter != null;

        private bool ObservesMembers =>
            this.WouldFilter && this.FilterTriggerProperties.Any()
            || this.WouldSort && (this.SortTriggerProperties.Any() || this.SortField != null);

        private void SortItemsAndReapplyFilter()
        {
            if (!Sorts)
                return;

            var sorter = this.GetSorter(out bool desc);

            // All items
            IEnumerable<T> sortedItems = UnfilteredItems;
            if (sorter != null)
            {
                sortedItems = desc
                    ? this.UnfilteredItems.OrderByDescending(sorter)
                    : this.UnfilteredItems.OrderBy(sorter);
            }
            sortedItems = sortedItems.ToArray();

            this.ClearInternalItems(skipInpcUnsub: true, actualList: this.UnfilteredItems);

            foreach (var sorted in sortedItems)
                this.AddInternalItem(sorted, skipIpncSub: true, actualList: this.UnfilteredItems);

            // Always reapply filter as this is much cheaper
            // than re-sorting the already-filtered list
            this.ReapplyFilter();
        }

        private void ReplaceInternalItem(int index, T replacement)
        {
            var existing = this.UnfilteredItems[index];

            if (this.ObservesMembers)
            {
                if (existing is INotifyPropertyChanged oldinpc)
                    oldinpc.PropertyChanged -= this.OnItemPropertyChanged;

                if (replacement is INotifyPropertyChanged inpc)
                    inpc.PropertyChanged += this.OnItemPropertyChanged;
            }

            this.UnfilteredItems[index] = replacement;

            this.OnInternalCollectionChanged(Enumerable.Repeat(existing, 1), true);
            this.OnInternalCollectionChanged(Enumerable.Repeat(replacement, 1), false);
        }

        private void AddInternalItem(T item, int? index = null, List<T> actualList = null, bool skipIpncSub = false)
        {
            if (item is INotifyPropertyChanged inpc && this.ObservesMembers && !skipIpncSub)
                inpc.PropertyChanged += this.OnItemPropertyChanged;

            actualList = actualList ?? this.UnfilteredItems;
            if (index is null)
                actualList.Add(item);
            else
                actualList.Insert(index.Value, item);

            this.OnInternalCollectionChanged(Enumerable.Repeat(item, 1), false);
        }

        private void AddInitialItems(IEnumerable<T> items)
        {
            this.UnfilteredItems.AddRange(items);
            this.OnInternalCollectionChanged(items, false);
        }

        private bool RemoveInternalItem(
            int index,
            IList<T> actualList = null)
        {
            actualList = actualList ?? this.UnfilteredItems;
            if (index >= actualList.Count)
                return false;

            var item = actualList[index];
            if (this.ObservesMembers && item is INotifyPropertyChanged inpc)
                inpc.PropertyChanged -= this.OnItemPropertyChanged;

            actualList.RemoveAt(index);
            this.OnInternalCollectionChanged(Enumerable.Repeat(item, 1), true);
            return true;
        }

        private bool RemoveInternalItem(
            T item,
            IList<T> actualList = null)
        {
            actualList = actualList ?? this.UnfilteredItems;
            if (this.ObservesMembers && item is INotifyPropertyChanged inpc)
                inpc.PropertyChanged -= this.OnItemPropertyChanged;
            bool removed = actualList.Remove(item);
            if (removed)
                this.OnInternalCollectionChanged(Enumerable.Repeat(item, 1), true);
            return removed;
        }

        private void ClearInternalItems(ICollection<T> actualList = null, bool skipInpcUnsub = false)
        {
            actualList = actualList ?? this.UnfilteredItems;
            if (this.ObservesMembers && !skipInpcUnsub)
            {
                foreach (var item in actualList)
                {
                    if (item is INotifyPropertyChanged inpc)
                        inpc.PropertyChanged -= this.OnItemPropertyChanged;
                }
            }
            this.OnInternalCollectionChanged(actualList, true);
            actualList.Clear();
        }

        private void OnItemPropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (!(sender is T item))
                return;
            bool sortChange = (e.PropertyName == this.SortField ||
                this.SortTriggerProperties.Contains(e.PropertyName));
            bool filterChange =
                this.FilterTriggerProperties.Contains(e.PropertyName);

            if (sortChange || filterChange)
                this.ReapplyVisual(item);

            this.OnItemPropertyChangeOverride(item, e.PropertyName);
        }

        protected virtual void OnItemPropertyChangeOverride(T sender, string property)
        {
        }

        bool IList.IsFixedSize => false;

        bool ICollection.IsSynchronized => false;

        object ICollection.SyncRoot => null;

        object IList.this[int index]
        {
            get => this[index];
            set => this.ReplaceInternalItem(index, (T)value);
        }

        int IList.Add(object value)
        {
            this.Add((T)value);
            return this.Count;
        }

        bool IList.Contains(object value)
        {
            return this.Contains((T)value);
        }

        int IList.IndexOf(object value)
        {
            if (!(value is T tvalue))
                return -1;
            return this.IndexOf(tvalue);
        }

        void IList.Insert(int index, object value)
        {
            throw new NotImplementedException();
        }

        void IList.Remove(object value)
        {
            this.Remove((T)value);
        }

        void IList.RemoveAt(int index)
        {
            throw new NotImplementedException();
        }

        void ICollection.CopyTo(Array array, int index)
        {
            throw new NotImplementedException();
        }

        protected void OnPropertyChanged([CallerMemberName] string member = null)
        {
            this.PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(member));
        }

        private List<T> _filteredItems;
        private Func<T, bool> _Filter;
        private bool _muted;
    }
}
