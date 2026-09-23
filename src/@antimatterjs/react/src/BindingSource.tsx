import { ModelObjectReference } from "./ModelObjectReference";

export class BindingSource
{
    constructor(source: any)
    {
        if (source instanceof ModelObjectReference)
        {
            this.NetRef = source as ModelObjectReference;
            this.Type = BindingSourceType.NetRef;
        }
        else
        {
            this.POJO = source;
            this.Type = BindingSourceType.POJO;
            if (source.IsDependencyObject)
                this.Type |= BindingSourceType.DependencyObject;
            if (source.PropertyChanged)
                this.Type |= BindingSourceType.INPC;
        }
    }

    public readonly NetRef?: ModelObjectReference;

    // Plain Old Javascript Object (not to be confused with the POCO)
    public readonly POJO: any;    

    public readonly Type: BindingSourceType;
}

export enum BindingSourceType
{
    POJO = 1,    
    NetRef = 2,
    INPC = 4,
    INCC = 8,
    DependencyObject = 16,
}