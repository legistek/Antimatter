export class PropertyKey
{
    constructor(propertyName: string)
    {
        this.IsIndexed =
            propertyName.startsWith('[') &&
            propertyName.endsWith(']');

        if (this.IsIndexed)
            this._key = propertyName.substring(1, propertyName.length - 2);
        else
            this._key = propertyName;
    }

    public readonly IsIndexed: boolean;

    public SetValue(object: any, value: any)
    {
        if (!object)
            return;
        object[this._key] = value;
    }

    public GetValue(object: any): any
    {
        if (!object)
            return object;
        return object[this._key];
    }

    private _key: string;
}