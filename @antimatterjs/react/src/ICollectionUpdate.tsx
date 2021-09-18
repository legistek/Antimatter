export enum NotifyCollectionChangedAction
{
    Add = 0,
    Remove = 1,
    Replace = 2,
    Move = 3,
    Reset = 4
}

export interface ICollectionUpdate
{
    Action: NotifyCollectionChangedAction,
    Index: number,
    Count: number,
    Items: any[]
}