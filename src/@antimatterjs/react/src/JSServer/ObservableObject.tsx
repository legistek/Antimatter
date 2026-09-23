import { Event } from "../Event";
import { INotifyPropertyChanged } from "../INotifyPropertyChanged";
import { PropertyChangedEventArgs } from "../PropertyChangedEventArgs";
import { DataErrorsChangedEventArgs } from "./DataErrorsChangedEventArgs";
import { PropertyValidatorBase } from "./PropertyValidator";

export class ObservableObject implements INotifyPropertyChanged {
    public PropertyChanged: Event<PropertyChangedEventArgs> =
        new Event<PropertyChangedEventArgs>();

    constructor()
    {
        this._key = ObservableObject._nextKey++;
    }

    public get Key(): string
    {
        return this.GetKeyOverride();
    }

    public readonly ErrorsChanged: Event<DataErrorsChangedEventArgs> =
        new Event<DataErrorsChangedEventArgs>();

    public get DisplayErrors(): boolean
    {
        return this.GetValue(nameof(this.DisplayErrors), false);
    }
    public set DisplayErrors(value: boolean)
    {
        this.SetValue(nameof(this.DisplayErrors), value);
        this.PropagateErrorsChanged();
    }

    public get HasErrors(): boolean
    {
        return this.PropertyValidators?.HasErrors(this) === true;
    }

    public GetError(property: string): string | undefined
    {
        if (!this.DisplayErrors)
            return undefined;
        return this.PropertyValidators?.Validate(this, property);
    }

    protected /* virtual */ get PropertyValidators(): PropertyValidatorBase|undefined
    {
        return undefined;
    }

    protected /* virtual */ GetKeyOverride(): string
    {
        return `amxob-${this._key}`;
    }

    protected GetValue(prop: string, defaultValue?: any)
    {
        var storedVal = this._values[prop];
        if (storedVal === undefined)
            return defaultValue;
        return storedVal;
    }

    protected SetValue(prop: string, value: any)
    {
        if (this._values[prop] === value)
            return;        
        this._values[prop] = value;
        this.OnPropertyChanged(prop);
    }

    protected OnPropertyChanged(property: string): void 
    {
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(property));
    }

    private PropagateErrorsChanged()
    {
        var props = this.PropertyValidators?.Properties;
        if (!props)
            return;
        for (var prop of props)
        {
            this.ErrorsChanged.invoke(this, new DataErrorsChangedEventArgs(prop));
        }
    }

    private _values: any = {};
    private _key: number;
    private static _nextKey: number = 0;
}