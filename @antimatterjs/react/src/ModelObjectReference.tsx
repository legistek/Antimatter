export class ModelObjectReference
{
    constructor(handle: number, key: string)
    {
        this.Handle = handle;
        this.Key = key;
    }

    public IsModelObjectReference: boolean = true;

    public readonly Handle: number;

    public readonly Key: string;

    public get key(): string
    {
        return this.Key;
    }

    public static Equals(ref1: ModelObjectReference | undefined, ref2?: ModelObjectReference | undefined): boolean
    {
        return (ref1 || false) && (ref2 || false) && ref1.Handle === ref2.Handle ||
            ref1 == ref2;
    }
}