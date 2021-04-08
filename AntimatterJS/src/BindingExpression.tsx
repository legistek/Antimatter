import { Antimatter } from "./Antimatter";
import { BindingMode, BindingParameters } from "./BindingParameters";
import { BindingSource, BindingSourceType } from "./BindingSource";
import { ModelObjectReference } from "./ModelObjectReference";

export class BindingExpression
{    
    public constructor(
        target: any,
        targetProperty: string,
        args?: BindingParameters)
    {
        this.Index = BindingExpression._globalIndex++;
        this.TargetProperty = targetProperty;

        this._target = target;

        this.Parameters = {};

        if (target.constructor.DefaultBindings && target.constructor.DefaultBindings[targetProperty])
        {
            this.Parameters = Object.assign(this.Parameters, target.constructor.DefaultBindings[targetProperty]);
            if (args)
                this.Parameters = Object.assign(this.Parameters, args);
        }
        else if (args)
        {
            this.Parameters = args;
        }
    }

    public readonly Index: number;
    public readonly Parameters: BindingParameters;
    public readonly TargetProperty: string;

    public get ActualMode(): BindingMode
    {
        return this.Parameters.Mode || BindingMode.OneWay;
    }

    public get AffectsRender(): boolean
    {
        var affects = this.Parameters.AffectsRender;
        if (affects === undefined)
            return true;
        return affects;
    }   

    public get IsDataContextDependent(): boolean
    {
        return this.Parameters.Source == undefined;    // undefined or null
    }

    public Apply(dataContext?: ModelObjectReference): boolean
    {
        BindingExpression._globalBindings.set(this.Index, this);

        if (this.Parameters.Source)
            this._resolvedSource = new BindingSource(this.Parameters.Source);
        else 
        {
            if (!dataContext)
                dataContext = this._target.state["DataContext"];

            if (!dataContext)
                return false;   // no source provided
                        
            if (ModelObjectReference.Equals(this._lastAppliedBindingContext, dataContext))
                return false; // no need to reapply
            this._lastAppliedBindingContext = dataContext;
            this._resolvedSource = new BindingSource(dataContext);            
        }
        
        this._isApplied = this.subscribeToSourcePropertyChanges();
        return this._isApplied;
    }
    
    public Unapply(): void
    {
        Antimatter.Server.Unbind(this);
    }

    public static OnExternalSourceValueChanged(bxIndex: number, value: any): void
    {
        var exp = this._globalBindings.get(bxIndex) as BindingExpression;
        if (!exp)
            return;

        Antimatter.UpdateTargetValue(exp._target, exp.TargetProperty, value, exp._isApplied && exp.AffectsRender);
    }

    private subscribeToSourcePropertyChanges(): boolean
    {
        if (this.Parameters.FallbackValue !== undefined)
            this._target.state[this.TargetProperty] = this.Parameters.FallbackValue;

        if (!this._resolvedSource)
            return false;

        if ((this._resolvedSource.Type & BindingSourceType.NetRef) > 0 && this._resolvedSource.NetRef)
        {
            Antimatter.Server.Bind(
                this._resolvedSource.NetRef,
                this.Parameters.Path,
                this);
            return true;
        }

        return false;
    }

    private static _globalIndex: number = 0;
    private static _globalBindings: Map<number, BindingExpression> = new Map<number, BindingExpression>();
    private _resolvedSource?: BindingSource;
    private _target: any;
    private _lastAppliedBindingContext: ModelObjectReference | undefined;
    private _isApplied: boolean = false;
}