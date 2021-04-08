import { Antimatter } from "./Antimatter";
import { BindingMode, BindingParameters } from "./BindingParameters";
import { BindingSource, BindingSourceType } from "./BindingSource";
import { ModelObjectReference } from "./ModelObjectReference";

export class BindingExpression
{
    protected static _globalIndex: number = 0;
    protected static _globalBindings: Map<number, BindingExpression> = new Map<number, BindingExpression>();
    
    //public readonly SourcePath?: string;
    //public readonly Source: ModelObjectReference | undefined;
    //public readonly Mode: BindingMode = BindingMode.OneWay;

    protected _resolvedSource?: BindingSource;    
    
    protected _target: any;
    public readonly TargetProperty: string;
    public readonly ActualMode: BindingMode = BindingMode.OneWay;

    private _lastAppliedBindingContext: ModelObjectReference | undefined;
    private _isApplied: boolean = false;
    private _affectsRender: boolean = false;

    public readonly Index: number;

    public readonly Parameters?: BindingParameters;

    public constructor(
        target: any,
        targetProperty: string,
        args?: BindingParameters)
    {               
        this.Index = BindingExpression._globalIndex++;
        this.TargetProperty = targetProperty;
        this.Parameters = args;
        this._target = target;
        
        if (!this.Parameters?.Mode || this.Parameters.Mode == BindingMode.Default)
        {
            if (this._target._bindableProps)
            {
                var defaultMode = this._target._bindableProps[targetProperty] as BindingMode;
                if (defaultMode != undefined)
                    this.ActualMode = defaultMode;
            }
        }
        else
        {
            this.ActualMode = this.Parameters.Mode;
        }

        if (args?.AffectsRender === undefined || args?.AffectsRender)
            this._affectsRender = true;        
    }

    public get IsDataContextDependent(): boolean
    {
        return this.Parameters?.Source == undefined;    // undefined or null
    }

    public Apply(dataContext?: ModelObjectReference): boolean
    {
        BindingExpression._globalBindings.set(this.Index, this);

        if (this.Parameters?.Source)
            this._resolvedSource = new BindingSource(this.Parameters?.Source);
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

    //protected abstract ApplyInternal();

    public Unapply(): void
    {
        Antimatter.Server.Unbind(this);
    }

    protected subscribeToSourcePropertyChanges(): boolean
    {
        if (!this._resolvedSource)
            return false;

        if ((this._resolvedSource.Type & BindingSourceType.NetRef) > 0 && this._resolvedSource.NetRef)
        {
            Antimatter.Server.Bind(
                this._resolvedSource.NetRef,
                this.Parameters?.Path,
                this);
            return true;
        }

        return false;        
    }

    public static OnExternalSourceValueChanged(bxIndex: number, value: any): void
    {
        var exp = this._globalBindings.get(bxIndex) as BindingExpression;
        if (!exp)
            return;

        Antimatter.UpdateTargetValue(exp._target, exp.TargetProperty, value, exp._isApplied && exp._affectsRender);
    }
}