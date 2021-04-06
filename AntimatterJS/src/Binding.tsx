import { BindingExpression } from "./BindingExpression";
import { BindingParameters } from "./BindingParameters";

export class Binding
{
    constructor(args?: BindingParameters)
    {        
        this.Parameters = args;
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
