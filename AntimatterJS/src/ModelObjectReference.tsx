export class ModelObjectReference
{
    constructor(handle: number)
    {
        this.Handle = handle;
    }

    public IsModelObjectReference: boolean = true;

    public readonly Handle: number;
}