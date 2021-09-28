import { BindingExpression } from "./BindingExpression";
import { BindingParameters } from "./BindingParameters";

export class Binding
{
    constructor(args?: BindingParameters | string)
    {
        if (typeof args === "string")
            this.Parameters = { Path: args };
        else
            this.Parameters = args as BindingParameters;
    }

    public readonly IsAntimatterBinding: boolean = true;

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

export function Bind(args: BindingParameters|string): Binding
{
    return new Binding(args);
}