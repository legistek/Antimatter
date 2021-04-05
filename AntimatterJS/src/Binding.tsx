import { BindingExpression } from "./BindingExpression";
import { ModelObjectReference } from "./ModelObjectReference";

export abstract class BindingBase
{
    public readonly IsAntimatterBindingBase: boolean = true;

    public abstract CreateBindingExpression(target: any, targetProperty: string): BindingExpression;

    public abstract get IsDataContextDependent(): boolean;
}

export class BindingParameters
{
    Target?: any;
    Path?: string;
    Source?: ModelObjectReference;
    Mode?: BindingMode;
    AffectsRender?: boolean;
}

export class Binding extends BindingBase
{
    constructor(args?: BindingParameters)
    {
        super();
        this.Parameters = args;
    }

    public readonly Parameters?: BindingParameters;
    
    public get IsDataContextDependent(): boolean
    {
        return this.Parameters?.Source == undefined; // null
    }

    public CreateBindingExpression(
        target: any,
        targetProperty: string): BindingExpression
    {
        return new BindingExpression(target, targetProperty, this.Parameters);
    }
}

export enum BindingMode
{
    TwoWay = 0,
    OneWay = 1,
    OneTime = 2,
    OneWayToSource = 3,
    Default = 4
}