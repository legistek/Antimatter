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
    ConverterBack?: (any) => any;
    ValidatesOnDataErrors?: boolean;
    RelativeSource?: string | any;
    RelativeSourceMode?: RelativeSourceMode;
    MarshalValue?: boolean;

    public static Equals(p1?: BindingParameters, p2?: BindingParameters)
    {
        if (p1 == p2)
            return true;
        if (p1 == undefined || p2 == undefined)
            return false;
        return p1.Target == p2.Target &&
            p1.Path == p2.Path &&
            p1.RelativeSourceMode == p2.RelativeSourceMode &&
            ModelObjectReference.Equals(p1.Source, p2.Source) &&
            p1.AffectsRender == p2.AffectsRender &&
            p1.NotifyCollectionChanged == p2.NotifyCollectionChanged &&
            p1.MarshalValue == p2.MarshalValue;
    }
}

export enum BindingMode
{   
    OneWay = 1,
    OneTime = 2,
    OneWayToSource = 3,
    TwoWay = 4,
}

export enum RelativeSourceMode
{
    None = 0,
    Self = 1,
}