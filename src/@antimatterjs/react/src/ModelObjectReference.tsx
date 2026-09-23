import { Antimatter } from "..";

export class ModelObjectReference
{
    constructor(handle: any, key: string)
    {
        this.Handle = handle;
        this.Key = key;
    }

    public IsModelObjectReference: boolean = true;

    public readonly Handle: any;

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

    /**
     * Informs the model server that a model reference must be 
     * kept alive even if the original binding target releases it.
     * Use this sparingly. Always call ReleaseRef when the reference
     * is no longer needed.
     */
    public AddRef()
    {
        Antimatter.Server.AddRef(this.Handle as number);
    }

    public ReleaseRef()
    {
        Antimatter.Server.ReleaseRef(this.Handle as number);
    }
}