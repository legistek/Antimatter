interface LinkListNode<T>
{
    Item?: T;
    Next?: LinkListNode<T>;
    Prior?: LinkListNode<T>;
}

class LinkedList<T>
{
    private _head: LinkListNode<T>;
    private _tail: LinkListNode<T>;
    private _count: number = 0;

    constructor()
    {
        this._head = this._tail = {
        };
    }

    public get Count(): number
    {
        return this._count;
    }

    public Inert(item: T)
    {
        if (this._count === 0)
            this._head.Item = item;
        else
        {
            var oldHead = this._head;
            this._head = {
                Item: item,
                Next: oldHead
            };
            oldHead.Prior = this._head;
        }
        this._count++;
    }

    public Add(item: T)
    {
        if (this._count === 0)
            this._tail.Item = item;
        else
        {
            var oldTail = this._tail;
            this._tail = {
                Item: item,
                Prior: oldTail
            };
            oldTail.Next = this._tail;
        }
        this._count++;
    }

    public PeekTail(): T | undefined
    {
        if (this._count === 0)
            return undefined;
        return this._tail.Item;
    }

    public PeekHead(): T | undefined
    {
        if (this._count === 0)
            return undefined;
        return this._head.Item;
    }

    public RemoveTail(): T | undefined
    {
        if (this._count === 0)
            return undefined;
        var item = this._tail.Item;
        this._tail.Item = undefined;
        this._tail.Next = undefined;
        let prior = this._tail.Prior;
        if (prior)
        {
            this._tail.Prior = undefined;
            prior.Next = undefined;
            this._tail = prior;                        
        }        
        this._count--;
        return item;
    }

    public RemoveHead(): T | undefined
    {
        if (this._count === 0)
            return undefined;
        var item = this._head.Item;
        this._head.Item = undefined;
        this._head.Prior = undefined;
        let next = this._head.Next;
        if (next)
        {
            this._head.Next = undefined;
            next.Prior = undefined;
            this._head = next;           
        }
        this._count--;
        return item;
    }   
}

export class RecyclingList<T>
{
    private _freedKeys: LinkedList<number> = new LinkedList<number>();
    private _lastAssignedKey: number = 0;   // so we actually start with 1
    private _items: (T|undefined)[] = [];
    
    public Add(item: T)
    {
        var key = this.GetNextKey();
        this._items[key] = item;
        return key;
    }

    public Get(key: number): T | undefined
    {
        if (key > this._items.length - 1)
            return undefined;
        return this._items[key];
    }

    public FreeKey(key: number)
    {
        this._freedKeys.Add(key);
    }

    public Remove(key: number)
    {
        this._items[key] = undefined;
    }

    private GetNextKey(): number
    {
        if (this._freedKeys.Count > 0)
        {
            var key = this._freedKeys.RemoveHead();
            if (key !== undefined)
                return key;
        }

        this._lastAssignedKey++;
        if (this._items.length < this._lastAssignedKey + 1)
        {
            this._items.length =
                Math.max(
                    this._items.length * 2,
                    this._lastAssignedKey + 1);            
        }

        return this._lastAssignedKey;        
    }
}