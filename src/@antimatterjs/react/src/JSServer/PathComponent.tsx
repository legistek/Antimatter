import { PropertyChangedEventArgs } from "../PropertyChangedEventArgs";
import { JSBindingExpression } from "./JSBindingExpression";
import { Event } from "../Event";
import { PropertyKey } from "./PropertyKey";
import { INotifyPropertyChanged } from "../INotifyPropertyChanged";
import { BindingExpression } from "../BindingExpression";

export class PathComponent
{
    private static _pcHhandle: number = 0;

    private _handle: number = 0;

    constructor(binding: JSBindingExpression, componentName: string, index: number)
    {
        this._handle = PathComponent._pcHhandle++;
        this.Binding = binding;
        this.Name = componentName;
        this._index = index;
        this.OnPropertyChanged = this.OnPropertyChanged.bind(this);
    }

    public readonly Name: string;
    public readonly Binding: JSBindingExpression;
    public PropertyKey?: PropertyKey;
    public HasValidationError: boolean = false;

    public SubscribePropertyChange(source: any)
    {
        if (source && source.PropertyChanged && source.PropertyChanged instanceof Event)
        {
            var inpc = source as INotifyPropertyChanged;
            inpc.PropertyChanged.subscribe(this.OnPropertyChanged);
        }
    }

    public OnPropertyChanged(sender: object, e: PropertyChangedEventArgs)
    {
        if (e.propertyName !== this.Name &&
            !(e.propertyName === "Item[]" && this.PropertyKey?.IsIndexed))
        {
            return;
        }
        this.Binding.SetEffectiveValue(this._index);
    }

    public Unsubscribe()
    {
        var lps = this.LastPropertySource as INotifyPropertyChanged;
        if (lps && lps.PropertyChanged && lps.PropertyChanged instanceof Event)
        {
            lps.PropertyChanged.unsubscribe(this.OnPropertyChanged);
        }
    }

    public get LastPropertySource(): object|undefined
    {
        return this._lastPropertySource?.deref();
    }

    public set LastPropertySource(value: object | undefined | null)
    {
        if (!value)
            this._lastPropertySource = undefined;
        else
            this._lastPropertySource = new WeakRef(value)
    }

    public OnTargetPropertyChanged(value: any)
    {
        var lps = this.LastPropertySource;
        if (!lps)
            return;

        try
        {
            this.PropertyKey?.SetValue(lps, value);
        }
        catch (e: any)
        {
            this._hasSetterException = true;
            this.Binding.ReportValidationError(e?.toString() || '');
            return;
        }

        if (this._hasSetterException || this.HasValidationError)
        {
            this._hasSetterException = false;
            var selfValidationError = JSBindingExpression.GetErrorsForProperty(lps, this.Name);
            if (!selfValidationError)
                this.HasValidationError = false;
            this.Binding.ReportValidationError(selfValidationError);
        }
        else
        {
            this.Binding.CheckReportIDEIValidationError();
        }
    }

    private _lastPropertySource?: WeakRef<object>;    
    private _index: number = 0;
    private _hasSetterException: boolean = false;    
}