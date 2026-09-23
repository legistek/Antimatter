/**********************************************************************
* Legistek Common Framework Source Code
* © Copyright 2013-2019 Legistek Corporation. All Rights Reserved.
* Unauthorized copying, modification, or distribution prohibited.
* CONFIDENTIAL AND PROPRIETARY
*
* This code is licensed to Epiq Global and its subsidiaries as a 
* "Licensor Provided Improvement" pursuant to the March 14, 2017 
* License Agreement between Legistek Corporation and Document Technologies, 
* LLC, and subject to the restrictions therein. All other users are 
* prohibited. Contact pmoore@legistek.com for more information.
**********************************************************************/

using System;
using System.Linq;
using System.ComponentModel;

using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Collections.ObjectModel;

using Antimatter.Net.Model;

namespace Antimatter.Net.Collections
{
    public interface IObservableTreeNode<T> : INotifyPropertyChanged
            where T : IObservableTreeNode<T>
    {
        /// <summary>
        /// Returns the child items. This must not be null even if there
        /// are no children, but rather must return a non-null instance
        /// of <see cref="INotifyCollectionChanged"/>.
        /// </summary>
        INotifyCollectionChanged Children { get; }

        /// <summary>
        /// Indicates whether an expander should be displayed. Typically
        /// this is true if the item has logical children.
        /// </summary>
        bool CanExpand { get; }

        bool IsExpanded { get; set; }

        /// <summary>
        /// This member must exist in the implementor, but is used by 
        /// <see cref="ObservableCollection{T}"/> and should not be altered otherwise.
        /// </summary>
        T Parent { get; set; }

        /// <summary>
        /// This member must exist in the implementor, but is used by 
        /// <see cref="ObservableCollection{T}"/> and should not be altered otherwise.
        /// </summary>
        int Size { get; set; }
    }

    /// <summary>
    /// Transforms a list organized in a an expandable and collapsable 
    /// tree hierarchy into a flat observable collection suitable for
    /// data binding to UI elements not well suited to a tree structure.
    /// </summary>
    public class ObservableTreeCollection<T> :
            IEnumerable<T>,
            ICollection<T>,
            INotifyPropertyChanged,
            INotifyCollectionChanged
        where T : class, IObservableTreeNode<T>
    {
        private Dictionary<T, IEnumerable<T>> _currentChildren = new Dictionary<T, IEnumerable<T>>();
        private Dictionary<INotifyCollectionChanged, T> _nodesByChildINCC = new Dictionary<INotifyCollectionChanged, T>();
        private Dictionary<T, INotifyCollectionChanged> _childCollectionByNodes = new Dictionary<T, INotifyCollectionChanged>();
        private List<T> _topLevels = new List<T>();

        public ObservableTreeCollection()
        {
        }

        public ObservableTreeCollection(IEnumerable<T> items)
        {
            this.AddRange(items);
        }

        public event NotifyCollectionChangedEventHandler CollectionChanged;
        public event PropertyChangedEventHandler PropertyChanged;

        public int Count => _currentChildren.Count;

        public bool IsReadOnly => false;

        public IEnumerator<T> GetEnumerator()
        {
            if (_topLevels.Count == 0)
                yield break;

            foreach (var item in _topLevels)
            {
                foreach (var childNode in GetEnumeratorForNode(item))
                    yield return childNode;
            }
        }

        public IReadOnlyList<T> TopLevels => _topLevels;

        public T this[int index]
        {
            get => this.ElementAt(index);
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return this.GetEnumerator();
        }

        public void AddRange(IEnumerable<T> items)
        {
            int index = _topLevels.Count == 0 ? 0 : this.IndexOf(_topLevels.Last());
            _topLevels.AddRange(items);
            List<T> newNodes = new List<T>();
            foreach (var item in items)
                RegisterNode(item, newNodes);
            NotifyNodeAdditionOrRemoval(newNodes, null, index);
        }

        public void Add(T item)
        {
            _topLevels.Add(item);
            List<T> newNodes = new List<T>();
            RegisterNode(item, newNodes);
            NotifyNodeAdditionOrRemoval(newNodes, null, this.IndexOf(item));
        }

        public void Insert(int index, T item)
        {
            _topLevels.Insert(index, item);
            List<T> newNodes = new List<T>();
            RegisterNode(item, newNodes);
            NotifyNodeAdditionOrRemoval(newNodes, null, index);
        }

        public bool RemoveAt(int index)
        {
            if (index >= _topLevels.Count)
                return false;
            var item = _topLevels[index];
            _topLevels.RemoveAt(index);
            
            List<T> removedNodes = new List<T>();
            UnregisterNode(item, removedNodes);
            NotifyNodeAdditionOrRemoval(null, removedNodes, index);
            return true;
        }

        public bool Remove(T item)
        {
            if (item == null)
                return false;

            int index = this.IndexOf(item);

            bool removed = _topLevels.Remove(item);
            if (!removed)
                return false;

            List<T> removedNodes = new List<T>();
            UnregisterNode(item, removedNodes);
            NotifyNodeAdditionOrRemoval(null, removedNodes, index);
            return true;
        }

        public int IndexOf(T node)
        {
            if (node == null)
                return -1;
            
            int index = 0;
            T theChild = node;
            T parent = node;
            while ((parent = parent.Parent) != null)
            {
                index++;
                if (!_currentChildren.TryGetValue(parent, out var children) || children == null)                
                    break;
                foreach (var child in children)
                {
                    if (object.ReferenceEquals(theChild, child))
                        break;
                    index += NodeSize(child);
                }
                theChild = parent;
            }

            // Now for the top level            
            int tlIndex = this._topLevels.IndexOf(theChild);
            if (tlIndex == -1)
                return -1;            
            for (int i = 0; i < tlIndex; i++)
                index += NodeSize(this._topLevels[i]);

            return index;
        }

        public T ElementAt(int index)
        {
            if (index < 0 || index >= this.Count)
                throw new ArgumentOutOfRangeException(nameof(index));

            IEnumerable<T> children = this._topLevels;

            int itemIndex = 0;
            while (true)
            {
                foreach (var child in children)
                {
                    if (itemIndex >= index)
                        return child;                                                    
                    else if (itemIndex + NodeSize(child) > index)
                    {
                        itemIndex++;
                        children = child.Children as IEnumerable<T>;
                        break;
                    }
                    else
                    {
                        itemIndex += NodeSize(child);
                    }
                }
            }
        }

        public void CopyTo(T[] array, int arrayIndex)
        {
            int i = 0;
            foreach (var item in this)
                array[i++] = item;
        }

        public void Clear()
        {
            this._topLevels.Clear();
            OnPropertyChanged(nameof(Count));
            this.CollectionChanged?.Invoke(
                this,
                new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Reset));
        }

        public bool Contains(T item)
        {
            return _currentChildren.ContainsKey(item);
        }

        private IEnumerable<T> GetEnumeratorForNode(T node)
        {
            yield return node;
            var children = VisibleChildrenOf(node);
            if (!children.Any())
                yield break;

            foreach (var child in children)
            {
                foreach (var childNode in GetEnumeratorForNode(child))
                    yield return childNode;
            }
        }

        private IEnumerable<T> VisibleChildrenOf(T node)
        {
            if (!node.IsExpanded)
                return Enumerable.Empty<T>();
            else
                return (node.Children as IEnumerable<T>) ?? Enumerable.Empty<T>();
        }

        //private IEnumerable<T> AllDescendantsOf(T node)
        //{
        //    var children = node.Children as IEnumerable<T>;
        //    if (children.IsNullOrEmpty())
        //        return Enumerable.Empty<T>();
        //    return children.Concat(
        //        children.SelectMany(c => AllDescendantsOf(c)));
        //}

        private void NotifyNodeAdditionOrRemoval(List<T> added, List<T> removed, int atIndex)
        {
            if (added?.Any() != true && removed?.Any() != true)
                return;

            OnPropertyChanged(nameof(Count));
            if (ObservableList.UseRangedNotifications)
            {
                if (removed?.Any() == true)
                {
                    this.CollectionChanged?.Invoke(
                        this,
                        new NotifyCollectionChangedEventArgs(
                            NotifyCollectionChangedAction.Remove,
                            removed,
                            atIndex));
                }
                if (added?.Any() == true)
                {
                    this.CollectionChanged?.Invoke(
                        this,
                        new NotifyCollectionChangedEventArgs(
                            NotifyCollectionChangedAction.Add,
                            added,
                            atIndex));
                }
            }
            else
            {
                this.CollectionChanged?.Invoke(this, new NotifyCollectionChangedEventArgs(
                    NotifyCollectionChangedAction.Reset));
            }
        }

        private void InvalidateSize(T node)
        {
            var parent = node;
            while (parent != null)
            {
                parent.Size = -1;
                parent = parent.Parent;
            }
        }

        private int NodeSize(T node)
        {
            if (node.Size == -1) // invalid size; recompute
            {
                _currentChildren.TryGetValue(node, out var children);
                if (!node.IsExpanded || children?.Any() != true)
                    node.Size = 1;
                else
                    node.Size = 1 + children.Sum(child => NodeSize(child));
            }
            return node.Size;
        }

        private void RegisterNodeChildren(T node, List<T> newRegistrations)
        {
            if (node.Children != null && 
                node.Children is IEnumerable<T> children &&
                node.Children is INotifyCollectionChanged childCollection)
            {
                _currentChildren[node] = VisibleChildrenOf(node).ToArray();
                _childCollectionByNodes[node] = childCollection;
                _nodesByChildINCC[childCollection] = node;
                node.Children.CollectionChanged += OnNodeChildCollectionChanged;
                if (!node.IsExpanded)
                    return;
                foreach (var child in children)
                {
                    child.Parent = node;
                    RegisterNode(child, newRegistrations);
                }
            }
            else
            {
                _currentChildren.Remove(node);
                _childCollectionByNodes.Remove(node);
            }
        }

        private void UnregisterNodeChildren(T node, List<T> unregistrations)
        {
            node.Size = -1;

            _currentChildren.TryGetValue(node, out var removedChildren);
            _currentChildren[node] = Enumerable.Empty<T>();
            if (_childCollectionByNodes.TryGetValue(node, out var incc))
            {
                _childCollectionByNodes.Remove(node);
                _nodesByChildINCC.Remove(incc);                
                incc.CollectionChanged -= OnNodeChildCollectionChanged;
            }
            if (removedChildren?.Any() != true)
                return;
            foreach (var child in removedChildren)
                UnregisterNode(child, unregistrations);
        }

        private void RegisterNode(T node, List<T> newRegistrations)
        {
            if (_currentChildren.ContainsKey(node))
                return;                                   
            node.PropertyChanged += OnNodePropertyChanged;
            InvalidateSize(node);
            newRegistrations.Add(node);
            RegisterNodeChildren(node, newRegistrations);
        }

        private void UnregisterNode(T node, List<T> unregistrations)
        {
            if (!_currentChildren.ContainsKey(node))
                return;
            node.PropertyChanged -= OnNodePropertyChanged;
            InvalidateSize(node);
            unregistrations.Add(node);
            UnregisterNodeChildren(node, unregistrations);
            _currentChildren.Remove(node);
        }

        private void OnNodeChildCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            if (!(sender is IEnumerable<T> nodeChildren) ||
                !(sender is INotifyCollectionChanged childINCC))
                return;
            if (!_nodesByChildINCC.TryGetValue(childINCC, out var parentNode))
                return;            
            List<T> affectedNodes = new List<T>();
            switch (e.Action)
            {
                case NotifyCollectionChangedAction.Add:
                    {
                        T firstNewNode = null;
                        if (!(e.NewItems?.Count > 0))
                            break;
                        if (!parentNode.IsExpanded)
                            break;
                        foreach (var newItem in e.NewItems)
                        {
                            if (newItem is T newNode)
                            {
                                newNode.Parent = parentNode;
                                RegisterNode(newNode, affectedNodes);
                                firstNewNode = firstNewNode ?? newNode;
                            }
                        }
                        _currentChildren[parentNode] = nodeChildren.ToArray();
                        NotifyNodeAdditionOrRemoval(affectedNodes, null, this.IndexOf(firstNewNode));
                    }
                    break;
                case NotifyCollectionChangedAction.Remove:
                    {
                        int removalIndex = -1;
                        if (!(e.OldItems?.Count > 0))
                            break;

                        foreach (var oldItem in e.OldItems)
                        {
                            if (oldItem is T oldNode)
                            {
                                if (removalIndex == -1)
                                    removalIndex = this.IndexOf(oldNode);
                                UnregisterNode(oldNode, affectedNodes);
                            }
                        }
                        _currentChildren[parentNode] = nodeChildren.ToArray();
                        if (removalIndex == -1)
                            break;                        
                        NotifyNodeAdditionOrRemoval(null, affectedNodes, removalIndex);
                    }
                    break;
                case NotifyCollectionChangedAction.Reset:
                    if (!_nodesByChildINCC.TryGetValue(childINCC, out var resetNode))
                        break;
                    ResetNode(resetNode);
                    break;
            }
        }

        private void ResetNode(T node)
        {
            int index = this.IndexOf(node);

            List<T> removals = new List<T>();
            List<T> additions = new List<T>();
            this.UnregisterNode(node, removals);
            this.RegisterNode(node, additions);

            NotifyNodeAdditionOrRemoval(additions, removals, index);
        }

        private void OnNodePropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (!(sender is T node))
                return;
            if (e.PropertyName == nameof(IObservableTreeNode<T>.Children))
            {
                ResetNode(node);
            }
            else if (e.PropertyName == nameof(IObservableTreeNode<T>.IsExpanded))
            {
                var startingIndex = this.IndexOf(node) + 1;
                if (node.IsExpanded)
                {
                    List<T> added = new List<T>();
                    RegisterNodeChildren(node, added);
                    if (added.Count > 0)
                        NotifyNodeAdditionOrRemoval(added, null, startingIndex);
                }
                else
                {
                    List<T> removed = new List<T>();                    
                    UnregisterNodeChildren(node, removed);
                    if (removed.Count == 0)
                        return;                    
                    NotifyNodeAdditionOrRemoval(null, removed, startingIndex);
                }
            }
        }

        private void OnPropertyChanged(string name)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        }

        public static void UnitTest()
        {
            var tops = new UnitTestNode[]
            {
                new UnitTestNode
                {
                    Name = "Larry",
                    Level = 0,
                    Children = new ObservableCollection<UnitTestNode>
                    {
                        new UnitTestNode
                        {
                            Name = "First Son of Larry",
                            Level = 1,
                            Children = new ObservableCollection<UnitTestNode>
                            {
                                new UnitTestNode 
                                { 
                                    Name = "Grandson of Larry" ,
                                    Level = 2,
                                }
                            }
                        },
                        new UnitTestNode
                        {
                            Name = "Second Son of Larry",
                            Level = 1,
                        },
                        new UnitTestNode
                        {
                            Name = "Third Son of Larry",
                            Level = 1,
                        },
                    }
                },
                new UnitTestNode
                {
                    Name = "Curly",
                    Level = 0,
                    Children = new ObservableCollection<UnitTestNode>
                    {
                        new UnitTestNode
                        {
                            Name = "First Son of Curly",
                            Level = 1,
                            Children = new ObservableCollection<UnitTestNode>
                            {
                                new UnitTestNode 
                                { 
                                    Name = "Grandson of Curly" ,
                                    Level = 2,
                                }
                            }
                        },
                        new UnitTestNode
                        {
                            Name = "Second Son of Curly",
                            Level = 1,
                        },
                        new UnitTestNode
                        {
                            Name = "Third Son of Curly",
                            Level = 1,
                        },
                    }
                },
                new UnitTestNode
                {
                    Name = "Moe",
                    Level = 0,
                }
            };

                        
            var tree = new ObservableTreeCollection<UnitTestNode>(tops);

            Console.WriteLine($"All expanded: {tree.Count} items");

            for (int i = 0; i < tree.Count; i++)
                Console.WriteLine($"{i}\t{tree[i].ToString()}");

            Console.WriteLine();            
            tree[0].IsExpanded = false;
            Console.WriteLine($"Larry collapsed: {tree.Count} items");

            for (int i = 0; i < tree.Count; i++)
                Console.WriteLine($"{i}\t{tree[i].ToString()}");

            Console.WriteLine();

            tree[1].IsExpanded = false;
            tree[0].IsExpanded = true;
            Console.WriteLine($"Curly collapsed, Larry expanded: {tree.Count} items");

            for (int i = 0; i < tree.Count; i++)
                Console.WriteLine($"{i}\t{tree[i].ToString()}");
        }
    }

    public class UnitTestNode : ObservableObject, IObservableTreeNode<UnitTestNode>
    {
        public override string ToString()
        {
            string level = new string(' ', this.Level * 4);

            string prefix = null;
            if (this.IsExpanded && this.Children?.Count > 0)
                prefix = "[-] ";
            else if (this.Children?.Count > 0)
                prefix = "[+] ";
            else
                prefix = "    ";
            return level + prefix + this.Name;
        }

        #region string Name property
        private string _Name;
        public string Name
        {
            get
            {
                return _Name;
            }
            set
            {
                if (_Name != value)
                {
                    _Name = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        public bool CanExpand => this.Children?.Count > 0;

        #region ObservableCollection<UnitTestNode> Children property
        private ObservableCollection<UnitTestNode> _Children;
        public ObservableCollection<UnitTestNode> Children
        {
            get
            {
                return _Children;
            }
            set
            {
                if (_Children != value)
                {
                    _Children = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        #region bool IsExpanded property
        private bool _IsExpanded = true;
        public bool IsExpanded
        {
            get
            {
                return _IsExpanded;
            }
            set
            {
                if (_IsExpanded != value)
                {
                    _IsExpanded = value;
                    OnPropertyChanged();
                }
            }
        }
        #endregion

        public int Level { get; set; }

        INotifyCollectionChanged IObservableTreeNode<UnitTestNode>.Children => this.Children;

        public UnitTestNode Parent 
        { 
            get; 
            set; 
        }

        public int Size
        {
            get; 
            set;
        }
    }
}