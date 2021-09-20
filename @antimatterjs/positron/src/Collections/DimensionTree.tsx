import { Event } from "@antimatterjs/react";

export interface ICanHasLength
{
    Length: number;
    LengthChanged: Event<any>;
}

export class DimensionTree
{
    constructor(items: ICanHasLength[])
    {
        if (!items || items.length === 0)
            this.Root = new ValueNode(this);
        else
            this.Root = this.CreateFromItems(items, 0, items.length);
    }

    public readonly Root: Node;

    public static NodeCount(node?: Node): number
    {
        if (!node)
            return 0;
        return node.Count;
    }

    public SetNode(value: ICanHasLength, node: Node)
    {
        this._nodeMap.set(value, node);
    }

    /**
     * Returns the node (and its 0-based index) that exists
     * at the given position.
     */
    public NodeAt(position: number): { Node: Node, Index: number, Offset: number}
    {
        let currentOffset = 0, i = 0;
        let node = this.Root;
        do
        {
            if (node.IsValue)
                // Found it!
                return { Node: node, Index: i, Offset: currentOffset };

            var branch = node as BranchNode;
            if (branch.Top && currentOffset + branch.Top.Length >= position)
            {
                // go with the top half
                node = branch.Top;
            }
            else if (branch.Bottom)
            {
                // go with the bottom half
                currentOffset += (branch.Top?.Length || 0);
                i += (branch.Top?.Count || 0);
                node = branch.Bottom;
            }
            else
            {
                // something's wrong
                throw "Imbalanced dimension tree"
            }
        } while (true);        
    }

    public OffsetOf(item: ICanHasLength): number
    {
        var node = this.NodeOf(item);
        return node?.GetOffset() ?? 0;
    }

    public NodeOf(item: ICanHasLength): Node | undefined
    {
        return this._nodeMap.get(item);
    }

    private CreateFromItems(items: ICanHasLength[], offset: number, ct: number): Node
    {
        if (!items || items.length === 0)
            throw "items cannot be empty";

        let node: Node | undefined = undefined;

        if (ct === 1)
            node = new ValueNode(this, items[offset]);
        else if (ct === 2)
        {
            node = new BranchNode(this,
                new ValueNode(this, items[offset]),
                new ValueNode(this, items[offset + 1]));
        }
        else
        {
            let firstHalf: number = ct >> 1;
            node = new BranchNode(this,
                this.CreateFromItems(items, offset, firstHalf),
                this.CreateFromItems(items, offset + firstHalf, ct - firstHalf));
        }

        // Force evaluation of cached length and count during tree construction
        var l = node.Length;
        var c = node.Count;

        return node;
    }

    private _nodeMap: Map<ICanHasLength, Node> = new Map<ICanHasLength, Node>();
}

export abstract class Node
{
    protected constructor(tree: DimensionTree)
    {
        this.Tree = tree;
    }

    public readonly Tree: DimensionTree;

    public Parent?: BranchNode;

    public IsBottom: boolean = false;

    public FindPrior(): ValueNode | undefined
    {
        if (this.IsBottom)
            return this.Parent?.Top?.FindLastDescendant();
        else
        {
            let parent: BranchNode | undefined = this.Parent;
            while (parent && !parent.IsBottom)
                parent = parent.Parent;
            return parent?.Top?.FindLastDescendant();
        }
    }

    public FindNext(): ValueNode | undefined
    {
        let node: Node | undefined = this;
        while (node && node.IsBottom)
            node = node.Parent;
        return node?.Parent?.Bottom?.FindFirstDescendant();
    }

    public GetOffset(): number
    {
        // Crawl up till we find a bottom, then take
        // parent's offset + size of parent's top
        let bottom: Node | undefined = this;
        while (bottom && !bottom.IsBottom)
            bottom = bottom.Parent;

        var parent = bottom?.Parent;
        return (parent?.GetOffset() ?? 0) + (parent?.Top?.Length ?? 0);
    }

    public abstract get Length(): number;

    public abstract get Count(): number;

    public abstract get IsValue(): boolean;

    public abstract InvalidateCount(): void;

    public abstract InvalidateLength(): void;

    public abstract FindLastDescendant(): ValueNode | undefined;

    public abstract FindFirstDescendant(): ValueNode | undefined;
}

class BranchNode extends Node
{
    private _count?: number;
    private _size?: number;
    private _top?: Node;
    private _bottom?: Node;

    constructor(tree: DimensionTree, top?: Node, bottom?: Node)
    {
        super(tree);
        this.Top = top;
        this.Bottom = bottom;
    }

    public /* override */ get IsValue(): boolean
    {
        return false;
    }

    public /* override */ get Count(): number
    {
        if (!this._count)
            this._count = DimensionTree.NodeCount(this.Top) + DimensionTree.NodeCount(this.Bottom);
        return this._count;
    }

    public /* override */ get Length(): number
    {
        if (!this._size)
            this._size = (this.Top?.Length || 0) + (this.Bottom?.Length || 0);
        return this._size;
    }

    public get Top(): Node | undefined
    {
        return this._top;
    }
    public set Top(value: Node | undefined)
    {
        if (this._top)
            this._top.Parent = undefined;
        if (value)
        {
            value.Parent = this;
            value.IsBottom = false;
        }
        this._top = value;
    }

    public get Bottom(): Node | undefined
    {
        return this._bottom;
    }
    public set Bottom(value: Node | undefined)
    {
        if (this._bottom)
            this._bottom.Parent = undefined;

        if (value)
        {
            value.Parent = this;
            value.IsBottom = true;
        }
        this._bottom = value;
    }

    public override InvalidateCount(): void
    {
        if (!this._count)
            return;
        this._count = undefined;
        this.Parent?.InvalidateCount();
    }

    public override InvalidateLength(): void
    {
        if (!this._size)
            return;
        this._size = undefined;
        this.Parent?.InvalidateLength();
    }

    public override FindLastDescendant(): ValueNode | undefined
    {
        return this.Bottom?.FindLastDescendant();
    }

    public override FindFirstDescendant(): ValueNode | undefined
    {
        return this.Top?.FindFirstDescendant();
    }

    public InsertAt(index: number, item: Node): void
    {
        if (index == 0)     // before top 
            this.Top = new BranchNode(this.Tree, item, this.Top);
        else if (this.Bottom == null)
            this.Bottom = item;
        else if (index == 1) // between top and bottom - could go in either branch though
        {
            // put it in smaller branch to balance out
            if (DimensionTree.NodeCount(this.Top) < DimensionTree.NodeCount(this.Bottom))
                this.Top = new BranchNode(this.Tree, this.Top, item);
            else
                this.Bottom = new BranchNode(this.Tree, item, this.Bottom);
        }
        else if (index >= 2) // after bottom
        {
            this.Bottom = new BranchNode(this.Tree, this.Bottom, item);
        }
        this.InvalidateCount();
    }
}

class ValueNode extends Node
{
    private _value?: ICanHasLength;

    constructor(tree: DimensionTree, value?: ICanHasLength)
    {
        super(tree);
        this.ChildSizeChanged = this.ChildSizeChanged.bind(this);
        this.Value = value;
    }

    public override get IsValue(): boolean
    {
        return true;
    }

    public override get Count()
    {
        return 1;
    }

    public override get Length()
    {
        return this.Value?.Length || 0;
    }

    public get Value(): ICanHasLength | undefined
    {
        return this._value;
    }

    public set Value(value: ICanHasLength | undefined)
    {
        if (this._value)
            this._value.LengthChanged.unsubscribe(this.ChildSizeChanged);
        this._value = value;
        if (this._value)
        {
            this._value.LengthChanged.subscribe(this.ChildSizeChanged);
            this.Tree.SetNode(this._value, this);
        }
    }

    public override InvalidateLength(): void
    {
        this.Parent?.InvalidateLength();
    }

    public override InvalidateCount(): void
    {
        // no op
    }

    public override FindLastDescendant(): ValueNode
    {
        return this;
    }

    public override FindFirstDescendant(): ValueNode
    {
        return this;
    }

    public override toString()
    {
        return this.Value?.toString();
    }

    private ChildSizeChanged(): void
    {
        this.InvalidateLength();
    }

}



//namespace Legistek.Framework.Collections
//{
//    public class DimensionTree : IEnumerable<DimensionTree.ICanHasLength>
//    {







//        internal static void UnitTest()
//        {
//            int c = 1000000;
//            var items = new TestItem[c];
//            double offset = 0;
//            for (int i = 0; i < c; i++)
//            {
//                items[i] = new TestItem
//                {
//                    Order = i,
//                    CalcedOffset = offset
//                };
//                offset += items[i].Length;
//            }

//            DateTime start, end;
//            start = DateTime.Now;
//            var tree = new DimensionTree(items);
//            end = DateTime.Now;

//            Console.WriteLine($"DimensionTree took {(end - start).TotalSeconds}s to build");

//            int rounds = 1000;

//            Random r = new Random();

//            // Tree

//            start = DateTime.Now;
//            for (int i = 0; i < rounds; i++)
//            {
//                // change a random item's size
//                items[r.Next(c - 1)].Length = r.NextDouble() * 1000;

//                // Get another random item's offset
//                var theOffset = tree.OffsetOf(items[r.Next(c - 1)]);
//            }
//            end = DateTime.Now;
//            var treeTime = end - start;
//            Console.WriteLine($"Tree Time Test {(treeTime).TotalSeconds}s");

//            // Straight
//            start = DateTime.Now;
//            for (int i = 0; i < rounds; i++)
//            {
//                // change a random item's size
//                int k = r.Next(c - 1);
//                items[k].Length = r.NextDouble() * 1000;

//                // Get another random item's offset if necessary
//                var n = r.Next(c - 1);
//                if (k < n)
//                {
//                    // Have to recalculate everything from k + 1 through n
//                    offset = items[k].CalcedOffset;
//                    for (int j = k + 1; j <= n; j++)
//                    {
//                        items[j].CalcedOffset = offset;
//                        offset += items[j].Length;
//                    }
//                }
//                var theOffset = items[n].CalcedOffset;
//            }
//            end = DateTime.Now;
//            var straightTime = end - start;
//            Console.WriteLine($"Straight Time Test {(straightTime).TotalSeconds}s");
//            double factor = straightTime.TotalMilliseconds / treeTime.TotalMilliseconds;
//            Console.WriteLine($"Factor: {factor}");

//            //for (int i = 0; i < c; i++)
//            //{
//            //    int n = r.Next(c- 2);
//            //    int j = n + 1 + r.Next(c - 1 - n);
//            //    int k = r.Next(n);

//            //    double oldOffsetPushed = tree.OffsetOf(items[j]);
//            //    double oldOffsetUnchanged = tree.OffsetOf(items[k]);

//            //    items[n].Length += 100.0;

//            //    double newOffsetPushed = tree.OffsetOf(items[j]);
//            //    double newOffsetUnchanged = tree.OffsetOf(items[k]);

//            //    if (!(newOffsetPushed - oldOffsetPushed).AlmostEquals(100.0, 0.001))
//            //        ;

//            //    if (!oldOffsetUnchanged.AlmostEquals(newOffsetUnchanged, 0.001))
//            //        ;
//            //}




//            //foreach (var item in items)
//            //{
//            //    var treeOffset = tree.OffsetOf(item);
//            //    var rightOffset = item.CalcedOffset;
//            //}
//        }

//        private class TestItem : ICanHasLength
//        {
//            static Random _rand = new Random();

//            public TestItem()
//            {
//                this._length = _rand.NextDouble() * 1000;
//            }

//            double _length = 0;
//            public double Length
//            {
//                get => _length;
//                set
//                {
//                    if (_length.AlmostEquals(value, .001))
//                        return;
//                    _length = value;
//                    LengthChanged?.Invoke(this, null);
//                }
//            }

//            public event EventHandler LengthChanged;

//            public int Order { get; set; }

//            public double CalcedOffset { get; set; }

//            public override string ToString()
//            {
//                return $"{Order}: {Length}";
//            }
//        }
//    }
//}

