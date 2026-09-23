import { ObservableObject } from "./ObservableObject";

export abstract class PropertyValidatorBase
{
    public abstract Validate(instance: ObservableObject, property?: string): string | undefined;    

    public abstract get Properties(): string[];

    public abstract HasErrors(instance: ObservableObject): boolean;
}

export class PropertyValidator<T extends ObservableObject> extends PropertyValidatorBase
{
    constructor(validators: { [property: string]: (instance: T) => string | undefined })
    {
        super();
        this._validators = validators;
    }

    public Validate(instance: ObservableObject, property?: string): string|undefined
    {
        if (!property)
        {
            var entries = Object.entries(this._validators);
            for (let pair of entries)
            {
                var error = pair[1](instance as any);
                if (error)
                    return error;
            }
            return undefined;
        }
        else
        {
            var validator = this._validators[property];
            if (!validator)
                return undefined;
            return validator(instance as T);
        }
    }    

    public get Properties(): string[]
    {
        return Object.keys(this._validators);
    }

    public HasErrors(instance: ObservableObject): boolean 
    {
        return !!this.Validate(instance);
    }

    private _validators: { [property: string]: (instance: T) => string | undefined };
}