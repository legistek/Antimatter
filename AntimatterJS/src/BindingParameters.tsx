import { ModelObjectReference } from "./ModelObjectReference";

export class BindingParameters
{
    Target?: any;
    Path?: string;
    Source?: ModelObjectReference;
    Mode?: BindingMode;
    AffectsRender?: boolean;
    NotifyCollectionChanged?: boolean;
    FallbackValue?: any;
    Converter?: (any) => any;

    public static Equals(p1?: BindingParameters, p2?: BindingParameters)
    {
        if (p1 == p2)
            return true;
        if (p1 == undefined || p2 == undefined)
            return false;
        return p1.Target == p2.Target &&
            p1.Path == p2.Path &&
            ModelObjectReference.Equals(p1.Source, p2.Source) &&
            p1.AffectsRender == p2.AffectsRender &&
            p1.NotifyCollectionChanged == p2.NotifyCollectionChanged;
    }
}

export enum BindingMode
{   
    OneWay = 1,
    OneTime = 2,
    OneWayToSource = 3,
    TwoWay = 4,
}