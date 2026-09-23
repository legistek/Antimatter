export class DataErrorsChangedEventArgs
{
    constructor(propertyName: string)
    {
        this.PropertyName = propertyName;
    }

    public readonly PropertyName: string;
}