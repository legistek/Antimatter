export class Event<T> {    
    private _handlers: ((sender: any, e: T) => void)[] = [];

    public subscribe(handler: (sender: any, e: T) => void) {
        this._handlers.push(handler);
    }

    public unsubscribe(handler: (sender: any, e: T) => void) {
        var index = this._handlers.findIndex(h => h === handler);
        if (index === -1)
            return;
        this._handlers.splice(index, 1);
    }

    public invoke(sender: any, e: T): void {
        for (const handler of this._handlers) {
            handler(sender, e);
        }
    }
}