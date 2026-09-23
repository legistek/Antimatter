import * as React from 'react';
import { Antimatter, Binding, IBindableComponent } from "@antimatterjs/react";
import { Component } from "react";

export interface IFrameworkFragmentProps
{
    children?: React.ReactNode;
    RenderVersion?: number;
    IsVisible?: boolean | Binding;
}

/**
 * Serves as a stateful wrapping component for child elements 
 * without a corresponding DOM element of its own.
 **/
export class FrameworkFragment<P extends IFrameworkFragmentProps> extends Component<P>
    implements IBindableComponent
{
    constructor(props)
    {
        super(props);
        Antimatter.InitializeComponent(this);
    }

    render(): JSX.Element
    {
        if (!this.IsVisible)
            return (<></>);
        return <>{this.props.children}</>;
    }

    protected GetValue<T>(property: string, defaultValue: T | undefined = undefined): T
    {
        var val = (this.state as any)[property];
        if (val === undefined)
            val = defaultValue;
        return val as T;
    }

    public HasUnappliedCtxBindings: boolean = false;

    public get IsVisible(): boolean
    {
        return this.GetValue(nameof(this.props.IsVisible), true);
    }

    public get RenderVersion(): number
    {
        return this.GetValue(nameof(this.props.RenderVersion), 0);
    }

    public OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.props.RenderVersion))
        {
            if (this._isMounted)
            {
                // forces React render even if no props have changed
                Antimatter._client.InvalidateRender(this, false); 
            }
        }
    }

    public get DeferBindings(): boolean
    {
        return false;
    }

    readonly componentDidMount = () =>
    {
        this._isMounted = true;
    }

    private _isMounted: boolean = false;
}

export type FrameworkAlternativeFragementKeyValues =
    {
        [key: string | number]: JSX.Element;
    };

export interface IFrameworkAlternativeFragmentProps
{
    RenderVersion?: number;
    CurrentValue?: string | number | boolean | Binding;
    DefaultValue?: string | number | boolean;
    Fragments?: FrameworkAlternativeFragementKeyValues
}

/**
 * Provides a stateful bindable component that can render any number
 * of ways based on a bound key value. Like a switch ... case
 * for rendering.   
 */
export class FrameworkAlternativeFragments<P extends IFrameworkAlternativeFragmentProps> extends Component<P>
    implements IBindableComponent
{
    constructor(props)
    {
        super(props);
        Antimatter.InitializeComponent(this);
    }

    render(): JSX.Element
    {
        var val = this.CurrentValue || this.DefaultValue;
        if (val === undefined || val === null)
            return <></>;
        var fragment = this.Fragments[val];
        if (!fragment)
            return <></>;

        return fragment;
    }

    protected GetValue<T>(property: string, defaultValue: T | undefined = undefined): T
    {
        var val = (this.state as any)[property];
        if (val === undefined)
            val = defaultValue;
        return val as T;
    }

    public HasUnappliedCtxBindings: boolean = false;

    public get RenderVersion(): number
    {
        return this.GetValue(nameof(this.props.RenderVersion), 0);
    }

    public OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.props.RenderVersion))
        {
            // forces React render even if no props have changed
            Antimatter._client.InvalidateRender(this, false);
        }
    }

    public get DeferBindings(): boolean
    {
        return false;
    }

    public get CurrentValue(): string | undefined
    {
        return this.GetValue(nameof(this.props.CurrentValue));
    }

    public get DefaultValue(): string | undefined
    {
        return this.GetValue(nameof(this.props.DefaultValue));
    }

    public get Fragments(): FrameworkAlternativeFragementKeyValues
    {
        return this.GetValue(nameof(this.props.Fragments), {});
    }
}