import { Antimatter } from "../..";
import { PathComponent } from "./PathComponent";
import { BindingExpression } from "../BindingExpression";
import { ModelValue, ModelValueType } from "../ModelValue";
import { PropertyKey } from "./PropertyKey";
import { BindingMode } from "../BindingParameters";
import { ObservableObject } from "./ObservableObject";
import { ModelObjectReference } from "../ModelObjectReference";
import { DataErrorsChangedEventArgs } from "./DataErrorsChangedEventArgs";

export class JSBindingExpression
{
    public readonly ViewExpression: BindingExpression;

    constructor(viewExpression: BindingExpression)
    {
        this.ViewExpression = viewExpression;
        this.Path = viewExpression.Parameters.Path || '';
        this.PathComponents = this.ParsePath();
        this.Mode = viewExpression.ActualMode;
        this.OnSourceValidationError = this.OnSourceValidationError.bind(this);
    }

    public readonly Path: string;    

    public readonly Mode: BindingMode;

    public SetEffectiveValue(pathStart: number)
    {
        this.UnsubscribePropertyChange(pathStart);
        this.UpdateTargetValue(pathStart);
        this.SubscribePropertyChange(pathStart);
    }

    public ReportValidationError(message: string|undefined): void
    {
        BindingExpression.OnModelValueChanged(
            this.ViewExpression.Index,
            message,
            ModelValueType.ValidationError);
    }

    public CheckReportIDEIValidationError(): void
    {
        if (this.PathComponents.length === 0)
            return;
        var pc = this.PathComponents[this.PathComponents.length - 1];

        var lastPropertySource = pc.LastPropertySource as ObservableObject;
        if (lastPropertySource instanceof ObservableObject)
        {
            let error: string|undefined = lastPropertySource.HasErrors
                ? lastPropertySource.GetError(pc.Name)
                : undefined;
            if (error)
            {
                pc.HasValidationError = true;
                this.ReportValidationError(error);
            }
            else if (pc.HasValidationError)
            {
                pc.HasValidationError = false;
                this.ReportValidationError(undefined);
            }
        }
    }

    public static GetErrorsForProperty(source: object, property: string) : string|undefined
    {
        var oo = source as ObservableObject;
        if (oo instanceof ObservableObject)
        {
            return oo.GetError(property);
        }
        return undefined;
    }
    
    public get ResolvedSource(): object | undefined
    {
        return this._resolvedSource?.deref();
    }
    public set ResolvedSource(value: object | undefined | null)
    {
        if (!value)
            this._resolvedSource = undefined;
        else
            this._resolvedSource = new WeakRef(value);
    }

    public Apply(source: object): boolean
    {
        var source = this.ResolvedSource = source;
        if (this.Mode != BindingMode.OneTime && this.Mode != BindingMode.OneWayToSource)
            this.SubscribePropertyChange(0);

        this.UpdateTargetValue(0);
        return true;
    }    

    public UpdateSource(newValue: any)
    {
        this._suspendPropertyChangeReport = true;
        try
        {
            if (this.PathComponents.length === 0)
                return;
            var pathComponent = this.PathComponents[this.PathComponents.length - 1];
            var unchanged = newValue === this._lastValue;
            if (!unchanged)
            {
                this.ReleaseLastValue();
                this._lastValue = newValue;
            }
            pathComponent.OnTargetPropertyChanged(newValue);
        }
        finally
        {
            this._suspendPropertyChangeReport = false;
        }
    }

    public Unbind(): void
    {
        this.UnsubscribePropertyChange(0);
        this.ResolvedSource = undefined;        
    }

    private UpdateTargetValue(pathStart: number): object | undefined
    {                    
        var newVal = this.GetEffectiveValue(pathStart);
        this.ReportSourcePropertyUpdate(newVal);
        return newVal;
    }

    private ReportSourcePropertyUpdate(value: any)
    {
        if (this._suspendPropertyChangeReport)
            return;

        /* TODO - Model-side converters
         * if (this.Converter != null)
                value = this.Converter.ConvertTo(value);*/

        if (value !== undefined && value !== null &&
            this._lastValue !== undefined && this._lastValue !== null &&
            // !(value is IEnumerable)
            value === this._lastValue)
            // Value is unchanged; do nothing
            return;

        /*   TODO - Collection changed
         *   if (value is INotifyCollectionChanged incc)
                incc.CollectionChanged += OnSourceCollectionChanged;*/

        this.ReleaseLastValue();
        this._lastValue = value;

        let type: ModelValueType = ModelValueType.Any;

        if (value instanceof ObservableObject)
        {
            value = new ModelObjectReference(value, value.Key);
            type = ModelValueType.ObjectHandle;
        }

        BindingExpression.OnModelValueChanged(
            this.ViewExpression.Index,
            value,
            type);
        this.CheckReportIDEIValidationError();
    }   

    private ParsePath(): PathComponent[]
    {
        let index: number = 0;
        return this
            .Path
            .split(new RegExp('[.\[]'))
            .map(component =>
            {
                if (component.endsWith(']'))
                {
                    return new PathComponent(this, '[' + component, index++);
                }
                else
                {
                    return new PathComponent(this, component, index++);
                }
            });
    }

    private GetEffectiveValue(pathStart: number): object | undefined
    {
        if (this.PathComponents.length === 0)
            return this.ResolvedSource;
        let effectiveValueSource: object | undefined;
        this.TraversePath(pathStart, (o, component) =>
        {
            effectiveValueSource = o;
        });
        if (!effectiveValueSource)
            return undefined;
        return this.PathComponents[this.PathComponents.length - 1]
            .PropertyKey
            ?.GetValue(effectiveValueSource);
    }

    private UnsubscribePropertyChange(pathStart: number): void
    {
        if (this.PathComponents.length === 0)
            return;
        for (let i = pathStart; i < this.PathComponents.length; i++)
            this.PathComponents[i].Unsubscribe();

        var last = this.PathComponents[this.PathComponents.length - 1].LastPropertySource as ObservableObject;
        if (last instanceof ObservableObject)
            last.ErrorsChanged.unsubscribe(this.OnSourceValidationError);
    }

    private SubscribePropertyChange(pathStart: number): void
    {
        if (this.PathComponents.length === 0)
            return;
        this.TraversePath(pathStart, (source, pathComponent) =>
        {
            pathComponent.SubscribePropertyChange(source);
        });

        var last = this.PathComponents[this.PathComponents.length - 1].LastPropertySource as ObservableObject;
        if (last instanceof ObservableObject)
            last.ErrorsChanged.subscribe(this.OnSourceValidationError);            
    }

    private OnSourceValidationError(sender: any, e: DataErrorsChangedEventArgs)
    {
        if (this.PathComponents.length === 0)
            return;
        var last = this.PathComponents[this.PathComponents.length - 1];
        var oo = sender as ObservableObject;

        if (oo instanceof ObservableObject && last.Name === e.PropertyName)
        {
            var error = oo.GetError(e.PropertyName);
            this.ReportValidationError(error);
        }
    }

    private ReleaseLastValue() : void
    {
        if (this._lastValue === undefined || this._lastValue === null)
            return;

        this._lastValue = undefined;

        // TODO - collections
        //var reference = _reactor.TryGetObjectReference(_lastValue);
        //if (reference != null)
        //{
        //    if (reference.Object is INotifyCollectionChanged oldIncc)
        //    oldIncc.CollectionChanged -= OnSourceCollectionChanged;
        //    reference.Release(_reactor);
        //}

        //if (!(_currentObjectCollection is null) && _lastValue is IEnumerable)
        //{
        //    foreach(var val in _currentObjectCollection)
        //    _reactor.Release(val);
        //    _currentObjectCollection.Clear();
        //}

        //_lastValue = null;
    }

    private TraversePath(start: number, action: (value: object | undefined, pathComponent: PathComponent) => void)
    {
        if (this.PathComponents.length === 0)
            return;
        let propertySource: object | undefined = start === 0
            ? this.ResolvedSource
            : this.PathComponents[start].LastPropertySource;
        for (let i = start; i < this.PathComponents.length; i++)
        {
            var pathComponent = this.PathComponents[i];
            if (!pathComponent.PropertyKey)
            {
                pathComponent.PropertyKey = new PropertyKey(pathComponent.Name);
            }
            /*
             *      TODO - Model-side converters
                    if (pathComponent.PropertyKey != null &&
                        this.Converter == null &&
                        Reactor._customConverters.TryGetValue(
                            pathComponent.PropertyKey.PropertyInfo.PropertyType,
                            out IModelValueConverter conv))
                    {
                        this.Converter = conv;
                    }
             */
            action(propertySource, pathComponent);
            pathComponent.LastPropertySource = propertySource;
            if (propertySource)
                propertySource = pathComponent.PropertyKey?.GetValue(propertySource);
        }
    }
    private _suspendPropertyChangeReport: boolean = false;
    private _resolvedSource?: WeakRef<object>;
    private _lastValue: any;
    private readonly PathComponents: PathComponent[];
}