import { BindingExpression } from "./BindingExpression";
import { Antimatter } from "./Antimatter";
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
}

export class Binding extends BindingBase
{
    constructor(path?: string, source?: any, mode: BindingMode = BindingMode.Default)
    {
        super();
        this.Path = path;
        this.Source = source;
        this.Mode = mode;
    }

    public Source?: any;
    public Path?: string;
    public Mode: BindingMode = BindingMode.Default;

    public get IsDataContextDependent(): boolean
    {
        return !this.Source;
    }

    public CreateBindingExpression(
        target: any,
        targetProperty: string): BindingExpression
    {
        // return Antimatter.Client.Bind(target, targetProperty, this.Source, this.Path, this.Mode);
        return new BindingExpression(target, targetProperty, this.Source, this.Path, true, this.Mode);
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