import { Antimatter } from "./Antimatter";
import { BindingSource, BindingSourceType } from "./BindingSource";
import { ModelObjectReference } from "./ModelObjectReference";

export class BindingExpression
{
    protected static _globalIndex: number = 0;
    protected static _globalBindings: Map<number, BindingExpression> = new Map<number, BindingExpression>();
    
    public readonly TargetProperty: string;
    public readonly SourcePath?: string;
    public readonly Source: ModelObjectReference | undefined;

    protected _resolvedSource?: BindingSource;    
    
    protected _target: any;

    private _lastAppliedBindingContext: ModelObjectReference | undefined;
    private _isApplied: boolean = false;
    private _affectsRender: boolean = false;

    public readonly Index: number;
   
    public constructor(
        target: any,
        targetProperty: string,
        source?: ModelObjectReference,
        sourcePath?: string,
        affectsRender?: boolean)
    {               
        this.Index = BindingExpression._globalIndex++;
        this.TargetProperty = targetProperty;

        this._target = target;
        this.Source = source;
        
        this.SourcePath = sourcePath;

        if (affectsRender === undefined || affectsRender)
            this._affectsRender = true;

        // this.onSourcePropertyChanged = this.onSourcePropertyChanged.bind(this);
    }

    public get IsDataContextDependent(): boolean
    {
        return !this.Source;
    }

    public Apply(dataContext: ModelObjectReference | undefined): boolean
    {
        BindingExpression._globalBindings.set(this.Index, this);

        if (this.Source)
            this._resolvedSource = new BindingSource(this.Source);
        else
        {
            //let dataContext: any = undefined;
            //if (this._targetProperty !== "DataContext")
            //{
            //    dataContext = Antimatter.Client.GetBindingContext(this._target);
            //}
            //else
            //{
            //    var parent = Antimatter.Client.GetParent(this._target);
            //    if (parent)
            //        dataContext = Antimatter.Client.GetBindingContext(parent);
            //}
            if (dataContext)
            {
                if (ModelObjectReference.Equals(this._lastAppliedBindingContext, dataContext))                    
                    return false; // no need to reapply
                this._lastAppliedBindingContext = dataContext;                
                this._resolvedSource = new BindingSource(dataContext);
            }
        }
        
        //console.log("Binding Applied " + this._resolvedSource?.NetRef?.Handle + "." + this.SourcePath + " to " + this.TargetProperty);

        // this.ApplyInternal();

        this._isApplied = this.subscribeToSourcePropertyChanges();
        return this._isApplied;
    }

    //protected abstract ApplyInternal();

    public Unapply(): void
    {
    }

    public GetSourceValue(): any
    {
        if (!this._resolvedSource)
            return null;
        if ((this._resolvedSource.Type & BindingSourceType.POJO) > 0)
            return this._resolvedSource.POJO[this.SourcePath as string];
        return null;
    }

    private unsubscribeFromSourcePropertyChanges()
    {
    }

    protected subscribeToSourcePropertyChanges(): boolean
    {
        if (!this._resolvedSource)
            return false;

        if ((this._resolvedSource.Type & BindingSourceType.NetRef) > 0 && this._resolvedSource.NetRef)
        {
            Antimatter.Server.Bind(
                this._resolvedSource.NetRef,
                this.SourcePath,
                this);
            return true;
        }

        return false;
        //}
        //else if ((this._resolvedSource.Type & BindingSourceType.DependencyObject) > 0)
        //{

        //}
        //else if ((this._resolvedSource.Type & BindingSourceType.POJO) > 0 &&
        //    (this._resolvedSource.Type & BindingSourceType.INPC) > 0)
        //{
        //    var inpc = this._resolvedSource.POJO as INotifyPropertyChanged;
        //    inpc.propertyChanged.subscribe(this.onSourcePropertyChanged);
        //    this._target.SetCurrentValue(this._targetProperty, this.GetSourceValue());
        //}
    }

    //private onSourcePropertyChanged(sender: any, e: PropertyChangedEventArgs): void
    //{
    //    if (e.propertyName === this._sourcePath)
    //        this._target.SetCurrentValue(this._targetProperty, this.GetSourceValue());
    //}

    public static OnExternalSourceValueChanged(bxIndex: number, value: any): void
    {
        var exp = this._globalBindings.get(bxIndex) as BindingExpression;
        if (!exp)
            return;

        Antimatter.UpdateTargetValue(exp._target, exp.TargetProperty, value, exp._isApplied && exp._affectsRender);
    }
}