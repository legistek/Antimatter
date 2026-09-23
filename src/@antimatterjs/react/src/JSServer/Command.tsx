import { ObservableObject } from "./ObservableObject";

export class Command extends ObservableObject
{
    constructor(action: (param: any) => Promise<void>)
    {
        super();
        this._action = action;
    }

    public get IsEnabled(): boolean
    {
        return this.GetValue(nameof(this.IsEnabled), true);
    }
    public set IsEnabled(value: boolean)
    {
        this.SetValue(nameof(this.IsEnabled), value);
    }

    public get Visibility(): boolean
    {
        return this.GetValue(nameof(this.Visibility), true);
    }
    public set Visibility(value: boolean)
    {
        this.SetValue(nameof(this.Visibility), value);
    }

    public get Name(): string | undefined
    {
        return this.GetValue(nameof(this.Name));
    }
    public set Name(value: string | undefined)
    {
        this.SetValue(nameof(this.Name), value);
    }
        
    public Execute(parameter: any): Promise<void> 
    {
        if (!this.IsEnabled)
            return Promise.resolve();
        return this._action(parameter);
    }

    private _action: (param: any) => Promise<void>;
}