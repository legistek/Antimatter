import { Event } from '@antimatterjs/react';

import { Antimatter } from "./Antimatter";
import { BindingExpression } from "./BindingExpression";
import { ICollectionUpdate, NotifyCollectionChangedAction } from "./ICollectionUpdate";
import { ModelValue, ModelValueType } from "./ModelValue";

export class BoundCollection<T> extends Array<T>
{
    public readonly BindingExpression: BindingExpression;

    constructor(bx: BindingExpression, ...elements: T[])
    {
        super(...elements);
        this.BindingExpression = bx;
    }

    CollectionChanged: Event<void> = new Event<void>();
    
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
                [ModelValue.Get(item)]);
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
                [ModelValue.Get(item)]);
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
                undefined);
        }

        return true;
    };

    push = (...items: T[]): number =>
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
                items
                    ? items.map(item => ModelValue.Get(item))
                    : undefined);
        }
        //this.CollectionChanged.invoke(this);
        return ct;
    };
    
    splice = (start: number, deleteCount: number, ...items: T[]): T[] =>
    {
        if (items && items.length > 0)
            super.splice(start, deleteCount, ...items);
        else
            super.splice(start, deleteCount);

        if (this.BindingExpression)
        {
            Antimatter.UpdateModelBoundCollection(
                this.BindingExpression,
                NotifyCollectionChangedAction.Remove,
                start,
                deleteCount,
                undefined);
            if (items && items.length > 0)
            {
                Antimatter.UpdateModelBoundCollection(
                    this.BindingExpression,
                    NotifyCollectionChangedAction.Add,
                    start,
                    items.length,
                    items.map(item => ModelValue.Get(item)));
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
                super.splice(update.Index, 0, ...update.Items);
                break;
            case NotifyCollectionChangedAction.Reset:
                super.splice(0, this.length);
                break;
            case NotifyCollectionChangedAction.Remove:
                super.splice(update.Index, update.Count);
                break;
        }
        this.CollectionChanged.invoke(this);
    };

    public readonly IsBoundCollection: boolean = true;
}

