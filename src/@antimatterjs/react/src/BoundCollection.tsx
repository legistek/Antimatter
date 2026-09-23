import { Event as AMEvent, ModelObjectReference } from '@antimatterjs/react';

import { Antimatter } from "./Antimatter";
import { BindingExpression } from "./BindingExpression";
import { ICollectionUpdate, NotifyCollectionChangedAction } from "./ICollectionUpdate";
import { ModelValue, ModelValueType } from "./ModelValue";

export class BoundCollection<T> extends Array<T>
{
    public readonly BindingExpression: BindingExpression|undefined;
    public AMXModelObjectHandle?: number;

    constructor(bx?: BindingExpression|undefined, ...elements: T[])
    {
        super(...elements);
        try
        {            
            if (elements && elements.length === 1)
                this[0] = elements[0];
            this.BindingExpression = bx;
        }
        catch (e)
        {
            let a = 5;
        }
    }

    CollectionChanged: AMEvent<ICollectionUpdate> = new AMEvent<ICollectionUpdate>();
    
    public Set = (index: number, item: T) =>
    {
        this.values[index] = item;
        if (this.BindingExpression)
        {
            Antimatter.UpdateModelBoundCollection(
                this.BindingExpression,
                NotifyCollectionChangedAction.Replace,
                index,
                1,
                [item]);
        }
    };

    public Add = (item: T): void =>
    {
        this.push(item);
        if (this.BindingExpression)
        {
            Antimatter.UpdateModelBoundCollection(
                this.BindingExpression,
                NotifyCollectionChangedAction.Add,
                this.length - 1,
                1,
                [item]);
        }
    };

    public Remove = (item: T): boolean =>
    {
        var index = this.indexOf(item);
        if (index === -1)
            return false;

        this.splice(index, 1);

        if (this.BindingExpression)
        {
            Antimatter.UpdateModelBoundCollection(
                this.BindingExpression,
                NotifyCollectionChangedAction.Remove,
                index,
                1,
                [item]);
        }

        return true;
    };

    override push (...items: T[])
    {
        var oldct = this.length;
        var ct = super.push(...items);
        if (this.BindingExpression)
        {
            Antimatter.UpdateModelBoundCollection(
                this.BindingExpression,
                NotifyCollectionChangedAction.Add,
                oldct,
                items?.length || 0,
                items);
        }
        else
            this.CollectionChanged.invoke(this, {
                Action: NotifyCollectionChangedAction.Add,
                Count: ct,
                Index: oldct,
                Items: items});
        return ct;
    };
    
    splice = (start: number, deleteCount: number, ...items: T[]): T[] =>
    {
        var originalCount = this.length;

        var deletedItems = deleteCount === 0 ? [] :
            this.slice(start, start + deleteCount);

        if (items && items.length > 0)
            super.splice(start, deleteCount, ...items);
        else
            super.splice(start, deleteCount);        

        if (this.BindingExpression)
        {
            if (start === 0 && deleteCount === originalCount)
            {
                Antimatter.UpdateModelBoundCollection(
                    this.BindingExpression,
                    NotifyCollectionChangedAction.Reset,
                    0,
                    deleteCount,
                    items);
                return this;
            }
            if (deleteCount > 0)
            {
                Antimatter.UpdateModelBoundCollection(
                    this.BindingExpression,
                    NotifyCollectionChangedAction.Remove,
                    start,
                    deleteCount,
                    deletedItems);
            }
            if (items && items.length > 0)
            {
                Antimatter.UpdateModelBoundCollection(
                    this.BindingExpression,
                    NotifyCollectionChangedAction.Add,
                    start,
                    items.length,
                    items);
            }
        }
        //this.CollectionChanged.invoke(this);

        return this;
    };
    
    public ProcessModelUpdate = (update: ICollectionUpdate) =>
    {
        switch (update.Action)
        {
            case NotifyCollectionChangedAction.Add:
                if (update.Index === undefined || update.Items === undefined || update.Items.length === 0)
                    return;
                super.splice(update.Index, 0, ...update.Items);
                break;
            case NotifyCollectionChangedAction.Reset:
                super.splice(0, this.length, ...update.Items || []);
                break;
            case NotifyCollectionChangedAction.Remove:
                if (update.Index !== undefined && update.Index !== -1)
                {
                    super.splice(update.Index, update.Count);
                }
                else if (update.Items)
                {
                    var deleteSet = new Set<any>(update.Items.map(item =>
                        (item instanceof ModelObjectReference) ? item.Handle : item));
                    var filtered = super.filter((item) => !deleteSet.has(
                        (item instanceof ModelObjectReference) ? item.Handle : item));
                    super.splice(0, this.length, ...filtered);
                }
                break;
            case NotifyCollectionChangedAction.Replace:
                if (update.Index === undefined ||
                    update.Count === undefined ||
                    update.Items === undefined ||
                    update.Items.length === 0)
                    return;
                for (var i = 0, j = update.Index; i < update.Count; i++, j++)
                    this[j] = update.Items[i];
                break;
        }
        this.CollectionChanged.invoke(this, update);
    };

    public readonly IsBoundCollection: boolean = true;
}

