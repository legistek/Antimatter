import * as React from 'react';
import { Component } from 'react';
import { DependencyProperty, DependencyPropertyChangedEventArgs, FrameworkPropertyMetadataOptions, PropertyMetadata } from './DependencyProperty';
import { BindingExpression } from '../BindingExpression';
import { BindingBase } from '../Binding';
import { isUndefined } from 'util';
import { IDependencyObject } from './IDependencyObject';
import { Event } from './Event';
const ParentContext = React.createContext<any>(null);

export abstract class DependencyObject<P> extends Component<P> implements IDependencyObject
{
    private _bindings: Map<number, BindingExpression> = new Map<number, BindingExpression>();
    private _localValues: Map<number, any> = new Map<number, any>();
    private _isRendering: boolean = false;
    private _isMounted: boolean = false;
    private _setBindings: boolean = false;

    constructor(props: P)
    {
        super(props);             
        this.OnParentInheritablePropertyChanged = this.OnParentInheritablePropertyChanged.bind(this);        
        this.processProps(this.props);
    }

    public componentDidMount(): void
    {
        this._isMounted = true;
    }

    public componentDidUpdate(): void
    {        
    }

    public IsDependencyObject: boolean = true;
    public Parent?: IDependencyObject;
    public InheritablePropertyChanged: Event<DependencyPropertyChangedEventArgs> = new Event<DependencyPropertyChangedEventArgs>();

    //#region DataContext Dependency Property
    public static readonly DataContextProperty: DependencyProperty = DependencyProperty.Register(
        "DataContext",
        new PropertyMetadata(
            null,
            FrameworkPropertyMetadataOptions.AffectsRender | FrameworkPropertyMetadataOptions.Inherits,
            (d, e) =>
            {
                // Will, do not delete this like you did in Blazor 
                // or you will be hunted down and destroyed
            })
    );
    public get DataContext(): any
    {
        return this.GetValue(DependencyObject.DataContextProperty);
    }
    public set DataContext(value: any)
    {
        this.SetValue(DependencyObject.DataContextProperty, value);
    }
    //#endregion

    public GetValue(property: DependencyProperty): any
    {
        var localValue = this._localValues[property.GlobalIndex];
        if (!isUndefined(localValue))
            return localValue;

        if (property.Inherits && this.Parent && !this._bindings.get(property.GlobalIndex))
            // Only go to the parent if we're not bound
            return this.Parent.GetValue(property);

        return property.DefaultValue;
    }

    public SetValue(property: DependencyProperty, value: any)
    {
        if (this._setBindings)
        {
            var existingBinding = this._bindings.get(property.GlobalIndex);
            if (existingBinding)
                existingBinding.Unapply();

            if (value.IsAntimatterBindingBase)
            {
                var exp = (value as BindingBase).CreateBindingExpression(this, property.Name);
                exp.Apply(property.GlobalIndex === DependencyObject.DataContextProperty.GlobalIndex
                    ? this.Parent?.DataContext
                    : this.DataContext);
                this._bindings[property.GlobalIndex] = exp;
                return;
            }
        }

        if (value && value.IsAntimatterBindingBase)
            return;

        this.SetCurrentValue(property, value);
    }

    public SetCurrentValue(property: DependencyProperty, value: any): void
    {
        var oldValue = this.GetValue(property);
        if (oldValue === value)
            return;

        var changedArgs = new DependencyPropertyChangedEventArgs(
            oldValue,
            value,
            property);

        this._localValues[property.GlobalIndex] = value;
        if (property.Inherits)
            // For children who inherit their values from us
            this.InheritablePropertyChanged.invoke(this, changedArgs);

        if (isUndefined(value))
            this._localValues.delete(property.GlobalIndex);
        else
            this._localValues.set(property.GlobalIndex, value);

        // For anyone else
        this.OnDependencyPropertyActualValueChange(changedArgs);
    }

    private OnDependencyPropertyActualValueChange(e: DependencyPropertyChangedEventArgs): void
    {
        if (e.Property.PropertyChangedCallback)
            e.Property.PropertyChangedCallback(this, e);

        if (e.Property === DependencyObject.DataContextProperty)
        {
            this.ReapplyDataContextDependentBindings();
        }

        if (e.Property.AffectsRender && !this._isRendering && this._isMounted)
            this.setState({});
    }

    private processProps(props: P)
    {
        this._setBindings = true;
        var entries = Object.entries(props);
        for (const entry of entries)
        {
            (this as any)[entry[0]] = entry[1];            
        }
        this._setBindings = false;
    }

    static contextType = ParentContext;
    /* sealed */ render()
    {
        // This is when we get a parent change; handle it
        // (including updating any inherited dependency properties)
        // before render!
        this._isRendering = true;
        this.setParent(this.context, true);        
        var render = (
            <ParentContext.Provider value={this}>
                {this.renderElement()}
            </ParentContext.Provider>
        );
        this._isRendering = false;
        return render;
    }

    protected abstract renderElement(): JSX.Element;

    private setParent(parent: IDependencyObject, isRendering: boolean)
    {
        if (this.Parent === parent)
            return;

        if (this.Parent)
            this.Parent.InheritablePropertyChanged.unsubscribe(this.OnParentInheritablePropertyChanged);

        if (!parent)
            return;

        this.Parent = parent;
        parent.InheritablePropertyChanged.subscribe(this.OnParentInheritablePropertyChanged);       

        if (parent.DataContext !== this.DataContext)
            this.ReapplyDataContextDependentBindings();
    }

    private ReapplyDataContextDependentBindings()
    {        
        var bindings = Object.entries(this._bindings);
        for (const binding of bindings)
        {
            if (!binding[1])
                continue;
            if (binding[1].IsDataContextDependent)
                binding[1].Apply(this.DataContext);
        }
    }

    private OnParentInheritablePropertyChanged(sender: any, e: DependencyPropertyChangedEventArgs)
    {
        this.OnDependencyPropertyActualValueChange(e);
    }
}
