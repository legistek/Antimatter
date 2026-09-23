import { Antimatter } from "./Antimatter";
import { BindingExpression } from "./BindingExpression";
import { BoundCollection } from './BoundCollection';

export class BoundCollectionReference<T> extends BoundCollection<T>
{
    /** Iterator */
    [Symbol.iterator]()
    {
        if (this.AMXModelObjectHandle)
        {
            var ct = this.length;
            var allItems = this.GetRange(0, ct) || [];
            let i = 0;
            return {
                next: (): IteratorResult<T, T> =>
                {
                    return {
                        value: allItems[i++],
                        done: i == ct
                    }
                },
            };
        }
        else
        {
            return super[Symbol.iterator]() as any;
        }
    }

    constructor(bx: BindingExpression, ...elements: T[])
    {
        super(bx, ...elements);        
        return new Proxy(this, {
            get: (obj, key) =>
            {
                if (!obj.AMXModelObjectHandle)
                    return obj[key];

                if (typeof (key) !== "string" || !obj.AMXModelObjectHandle)
                    return obj[key];
                var idx = Number(key);
                if (Number.isInteger(idx))
                {
                    var item = Antimatter.Server.GetCollectionMembers(obj.AMXModelObjectHandle, idx, 1);
                    return item[0];
                }
                else if (key === "length")
                {
                    return Antimatter.Server.GetCollectionSize(obj.AMXModelObjectHandle);
                }
                else
                {
                    return obj[key];
                }
            }
        })
    }
    
    public GetRange(offset: number, count: number): T[] | undefined 
    {
        if (!this.AMXModelObjectHandle)
            return undefined;
        return Antimatter.Server.GetCollectionMembers(this.AMXModelObjectHandle, offset, count);
    }

    override map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[]
    {
        var ct = this.length;
        var allItems = this.GetRange(0, ct);
        if (!allItems)
            return [];
        var newItems = Array<U>(ct);
        for (let i = 0; i < ct; i++)
            newItems[i] = callbackfn(allItems[i], i, allItems);
        return newItems;
    }    
}