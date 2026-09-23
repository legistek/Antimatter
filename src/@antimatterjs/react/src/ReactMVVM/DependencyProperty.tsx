import { IDependencyObject } from "./IDependencyObject";

export class DependencyProperty
{
    static _lastIndex: number = 0;
    _metadata: PropertyMetadata;

    constructor(name: string, index: number, metadata: PropertyMetadata)
    {
        this._name = name;
        this._globalIndex = index;
        this._metadata = metadata;
    }

    _name: string;
    public get Name(): string
    {
        return this._name;
    }

    _globalIndex: number;
    public get GlobalIndex(): number
    {
        return this._globalIndex;
    }

    public get Inherits(): boolean 
    {
        return (this._metadata.Options & FrameworkPropertyMetadataOptions.Inherits) > 0;
    }

    public get AffectsRender(): boolean
    {
        return (this._metadata.Options & FrameworkPropertyMetadataOptions.AffectsRender) > 0;
    }

    public get DefaultValue(): any
    {
        return this._metadata.DefaultValue;
    }

    public get PropertyChangedCallback(): ((d: IDependencyObject, e: DependencyPropertyChangedEventArgs) => void) | undefined
    {
        return this._metadata.PropertyChangedCallback;
    }   

    public static Register(name: string, metadata?: PropertyMetadata): DependencyProperty
    {
        var dp = new DependencyProperty(
            name,
            this._lastIndex++,
            metadata || new PropertyMetadata(undefined, FrameworkPropertyMetadataOptions.None, undefined));
        return dp;
    }
}

export enum FrameworkPropertyMetadataOptions
{
    None = 0,
    AffectsRender = 16,
    BindsTwoWayByDefault = 256,
    Inherits = 32,
}

export class PropertyMetadata
{
    constructor(
        defaultValue: any,
        options?: FrameworkPropertyMetadataOptions,
        callback?: (d: IDependencyObject, e: DependencyPropertyChangedEventArgs) => void)
    {
        this.DefaultValue = defaultValue;
        this.PropertyChangedCallback = callback;
        if (options)
            this.Options = options;
    }

    public readonly DefaultValue: any;
    public readonly PropertyChangedCallback?: (d: IDependencyObject, e: DependencyPropertyChangedEventArgs) => void;
    public readonly Options: FrameworkPropertyMetadataOptions = FrameworkPropertyMetadataOptions.None;
}

export class DependencyPropertyChangedEventArgs
{
    constructor(oldValue: any, newValue: any, property: DependencyProperty)
    {
        this.NewValue = newValue;
        this.OldValue = oldValue;
        this.Property = property;
    }

    public readonly NewValue: any;
    public readonly OldValue: any;
    public readonly Property: DependencyProperty;
}