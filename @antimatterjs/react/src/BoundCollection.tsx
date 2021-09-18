import { Antimatter } from "./Antimatter";
import { BindingExpression } from "./BindingExpression";
import { NotifyCollectionChangedAction } from "./ICollectionUpdate";
import { ModelValue } from "./ModelValue";

export class BoundCollection<T> implements Iterable<T>
{
    private _bx?: BindingExpression;

    private _array: T[] = [];
    public get Array(): T[]
    {
        return this._array;
    }

    public Set(index: number, item: T)
    {
        this._array[index] = item;
        if (this._bx)
        {
            Antimatter.BoundCollectionChanged(
                this._bx,
                NotifyCollectionChangedAction.Replace,
                index,
                1,
                [ModelValue.Get(item)]);
        }
    }

    public Add(item: T): void
    {
        this._array.push(item);
        if (this._bx)
        {
            Antimatter.BoundCollectionChanged(
                this._bx,
                NotifyCollectionChangedAction.Add,
                this._array.length - 1,
                1,
                [ModelValue.Get(item)]);
        }
    }

    public Remove(item: T): boolean
    {
        var index = this._array.indexOf(item);
        if (index === -1)
            return false;

        this._array.splice(index, 1);

        if (this._bx)
        {
            Antimatter.BoundCollectionChanged(
                this._bx,
                NotifyCollectionChangedAction.Remove,
                index,
                1,
                undefined);
        }

        return true;
    }

    public Clear()
    {
        this._array = [];
        if (this._bx)
        {
            Antimatter.BoundCollectionChanged(
                this._bx,
                NotifyCollectionChangedAction.Reset,
                0,
                0,
                undefined);
        }
    }

    public get Count(): number
    {
        return this._array.length;
    }

    public ElementAt(index: number): T
    {
        return this._array[index];
    }


    [Symbol.iterator](): Iterator<T> {
        let counter = 0;
        return {
            next: (() =>
            {
                return {
                    done: counter >= this._array.length,
                    value: this._array[counter]
                };
            }).bind(this)
        };
    }


    
}

export function Hobo()
{
    let c = new BoundCollection<string>();

    for (var i of c)
    {

    }


}