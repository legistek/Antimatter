import { INotifyPropertyChanged } from "./INotifyPropertyChanged";
import { PropertyChangedEventArgs } from "./PropertyChangedEventArgs";
import { Antimatter } from "./Antimatter";
import { BindingMode, BindingParameters, RelativeSourceMode } from "./BindingParameters";
import { BindingSource, BindingSourceType } from "./BindingSource";
import { ModelObjectReference } from "./ModelObjectReference";
import { ModelValue, ModelValueType } from "./ModelValue";
import { ICollectionUpdate } from "./ICollectionUpdate";
import { BoundCollection } from "./BoundCollection";
import { RecyclingList } from "./RecyclingList";
import { Utilities } from "..";

export class BindingExpression
{
    public constructor(
        target: any,
        targetProperty: string,
        args?: BindingParameters)
    {
        //this.Index = BindingExpression._globalBindings.Add(this);
        //BindingExpression._finalization.register(this, this.Index);

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

        this.OnTargetPropertyChanged = this.OnTargetPropertyChanged.bind(this);
        this.OnPOJOValueChanged = this.OnPOJOValueChanged.bind(this);
    }

    public readonly Index: number;
    public readonly Parameters: BindingParameters;
    public readonly TargetProperty: string;   

    public get ActualMode(): BindingMode
    {
        return this.Parameters.Mode || BindingMode.OneWay;
    }

    public get ActualRelativeSourceMode(): RelativeSourceMode
    {
        return this.Parameters.RelativeSourceMode || RelativeSourceMode.None;
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
        return (this.ActualRelativeSourceMode === RelativeSourceMode.None) &&
            (this.Parameters.Source == undefined);    // undefined or null
    }

    public Apply(dataContext?: ModelObjectReference): boolean
    {        
        BindingExpression._globalBindings.set(this.Index, this);        

        if (this.ActualRelativeSourceMode === RelativeSourceMode.Self)
        {           
            if (!this.ApplyNewSelfRelativeSourceValue())
                return false;
        }
        else if (this.Parameters.Source)
        {           
            this._resolvedSource = new BindingSource(this.Parameters.Source);
        }
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

        this._isApplied = this.SubscribeToSourcePropertyChanges();
        return this._isApplied;
    }

    public Unapply(final: boolean): void
    {
        if (final)
            BindingExpression._globalBindings.delete(this.Index);           
            //BindingExpression._globalBindings.Remove(this.Index);           

        if (this.ActualRelativeSourceMode !== RelativeSourceMode.None)
            (this._target as INotifyPropertyChanged)?.PropertyChanged?.unsubscribe(this.OnTargetPropertyChanged);

        if (!this._isApplied)
            return;
        
        if (!this._resolvedSource)
            return;

        if ((this._resolvedSource.Type & BindingSourceType.NetRef) > 0)
            Antimatter.Server.Unbind(this);
        else if ((this._resolvedSource.Type & BindingSourceType.INPC) > 0)
            (this._resolvedSource.POJO as INotifyPropertyChanged)?.PropertyChanged.unsubscribe(this.OnPOJOValueChanged);
    }

    public static OnModelBoundCollectionChanged(bxIndex: number, update: ICollectionUpdate): void
    {
        //var exp = this._globalBindings.Get(bxIndex) as BindingExpression;
        var exp = this._globalBindings.get(bxIndex) as BindingExpression;
        if (!exp)
            return;
        Antimatter.ViewUpdateBoundCollection(
            exp,
            exp._target,
            exp.TargetProperty,
            update,
            exp._isApplied && exp.AffectsRender);
    }

    public static OnModelValueChanged(bxIndex: number, value: any, type: ModelValueType): void
    {
        //var exp = this._globalBindings.Get(bxIndex) as BindingExpression;
        var exp = this._globalBindings.get(bxIndex) as BindingExpression;
        if (!exp)
            return;

        let handle: any = 0;
        if (value instanceof ModelObjectReference)
            handle = value.Handle;
               
        if (type === ModelValueType.ValidationError)
        {
            if (exp.Parameters.ValidatesOnDataErrors && exp._target?.NotifyValidationError)
                exp._target.NotifyValidationError(value);
            return;
        }
        
        if (exp.Parameters.Converter)
            value = exp.Parameters.Converter(value);

        if ((type === ModelValueType.Collection ||
            type == ModelValueType.CollectionReference) &&
            Utilities.IsIterable(value))
        {
            if (type === ModelValueType.Collection)
            {
                handle = value.AMXModelObjectHandle;
                try
                {
                    value = new BoundCollection<any>(exp, ...value as any[]);
                }
                catch (e)
                {
                    let a = 5;
                }
                value.AMXModelObjectHandle = handle;
            }
            else if (type === ModelValueType.CollectionReference)
            {
                try
                {
                    value = new BoundCollection<any>(exp);
                }
                catch (e)
                {
                    let a = 5;
                }
                value.AMXModelObjectHandle = handle;
            }
        }

        if (value === undefined && exp.Parameters.FallbackValue !== undefined && exp.Parameters.FallbackValue !== null)
            value = exp.Parameters.FallbackValue;
        Antimatter.UpdateTargetValue(
            exp._target,
            exp.TargetProperty,
            value,
            exp._isApplied && exp.AffectsRender);        
    }
    
    SubscribeToSourcePropertyChanges(): boolean
    {
        if (this.Parameters.FallbackValue !== undefined)
            this._target.state[this.TargetProperty] = this.Parameters.FallbackValue;

        if (!this._resolvedSource)
            // for rel source only, pretend it's applied so we don't try infinitely
            return false;

        if ((this._resolvedSource.Type & BindingSourceType.NetRef) > 0 &&
            this._resolvedSource.NetRef)
        {
            Antimatter.Server.Bind(
                this._resolvedSource.NetRef,
                this.Parameters.Path,
                this);
            return true;
        }
        else if ((this._resolvedSource.Type & BindingSourceType.POJO) > 0 &&
            this._resolvedSource.POJO instanceof BoundCollection)
        {
            var ref = new ModelObjectReference(this._resolvedSource.POJO.AMXModelObjectHandle, '');
            Antimatter.Server.Bind(
                ref,
                this.Parameters.Path,
                this);
            return true;
        }

        if ((this._resolvedSource.Type & BindingSourceType.INPC) > 0 &&
            this._resolvedSource.POJO &&
            this._resolvedSource.POJO.PropertyChanged)
        {
            var inpc = this._resolvedSource.POJO as INotifyPropertyChanged;
            inpc.PropertyChanged.subscribe(this.OnPOJOValueChanged);

            var value = inpc[this.Parameters.Path || ''];
            if (this.Parameters.Converter)
                value = this.Parameters.Converter(value);
            this._target.state[this.TargetProperty] = value;
            return true;
        }

        return false;
    }

    OnPOJOValueChanged(sender: any, e: PropertyChangedEventArgs): void
    {
        if (this.SuspendPOJOSourceChangeHandler)
            return;

        if (e.propertyName !== this.Parameters.Path)
            return;

        var value = sender[e.propertyName];
        if (this.Parameters.Converter)
            value = this.Parameters.Converter(value);

        Antimatter.UpdateTargetValue(
            this._target,
            this.TargetProperty,
            value,
            this._isApplied && this.AffectsRender);
    }

    /**
     * Used exclusively in RelativeSource situations where objects need 
     * to monitor each others' properties.
     */
    OnTargetPropertyChanged(sender: any, e: PropertyChangedEventArgs)
    {
        if (this.ActualRelativeSourceMode == RelativeSourceMode.Self &&
            this.Parameters.RelativeSource === e.propertyName)
        {
            this.ApplyNewSelfRelativeSourceValue();
        }
    }

    ApplyNewSelfRelativeSourceValue(): boolean
    {
        this.Unapply(false);
        (this._target as INotifyPropertyChanged)?.PropertyChanged?.subscribe(this.OnTargetPropertyChanged);
        let resolvedSource: any;
        if (this.Parameters.RelativeSource && this.Parameters.RelativeSource !== '.')
        {
            resolvedSource = this._target.state[this.Parameters.RelativeSource];
            if (!resolvedSource)
                return false;
        }
        else
        {
            resolvedSource = this._target;
        }

        this._resolvedSource = new BindingSource(resolvedSource);
        return this._isApplied = this.SubscribeToSourcePropertyChanges();        
    }

    public SuspendPOJOSourceChangeHandler: boolean = false;

    //static _globalBindings: RecyclingList<BindingExpression> = new RecyclingList<BindingExpression>();

    //static _finalization: FinalizationRegistry<number> = new FinalizationRegistry(key =>
    //{
    //    BindingExpression._globalBindings.FreeKey(key);
    //});

    static _globalIndex: number = 0;
    static _globalBindings: Map<number, BindingExpression> = new Map<number, BindingExpression>();

    public _resolvedSource?: BindingSource;
    _target: any;
    _lastAppliedBindingContext: ModelObjectReference | undefined;
    _isApplied: boolean = false;
}