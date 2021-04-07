import { ModelObjectReference } from "./ModelObjectReference";

export class BindingParameters
{
    Target?: any;
    Path?: string;
    Source?: ModelObjectReference;
    Mode?: BindingMode;
    AffectsRender?: boolean;
    NotifyCollectionChanged?: boolean;
}

export enum BindingMode
{
    TwoWay = 0,
    OneWay = 1,
    OneTime = 2,
    OneWayToSource = 3,
    Default = 4
}