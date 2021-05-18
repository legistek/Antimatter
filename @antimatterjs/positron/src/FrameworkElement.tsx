import * as React from 'react';
import { Binding, Antimatter, BindingParameters, INotifyPropertyChanged, PropertyChangedEventArgs, Event, ModelObjectReference, ModelValue } from '@antimatterjs/react';

import { HorizontalAlignment, VerticalAlignment } from './Enums';

import './positron.css';
import { Style } from '@antimatterjs/positron/src/Style';
import { TooltipHost } from '@fluentui/react';
import { IGridChildPosition } from './Controls/Grid';

interface IFrameworkElementCommon
{
    // Use only for control development; never use for cross-platform views
    ClassName?: string,
    Style?: Style<any>,    
    Margin?: string,    
    HorizontalAlignment?: HorizontalAlignment,
    VerticalAlignment?: VerticalAlignment,
    OnClick?: (event: MouseEvent) => void,
    OnPointerDown?: (event: PointerEvent) => void,
    OnPointerMove?: (event: PointerEvent) => void,
    OnPointerUp?: (event: PointerEvent) => void,
    OnLostPointerCapture?: (event: PointerEvent)=> void,
    Grid?: IGridChildPosition,
    Overlaps?: boolean,
    LoadingTemplate?: () => JSX.Element
}

export interface IFrameworkElementProps extends IFrameworkElementCommon
{    
    IsVisible?: boolean | Binding,
    ToolTip?: string | JSX.Element | Binding,
    LoadedCommand?: ModelObjectReference | Binding,    
    IsLoading?: boolean | Binding
}

export interface IFrameworkElementState extends IFrameworkElementCommon
{
    IsVisible?: boolean,
    ToolTip?: string | JSX.Element,
    DataContext?: ModelObjectReference,
    LoadedCommand?: ModelObjectReference,    
    IsLoading?: boolean,
}

export class FrameworkElement<
    P extends IFrameworkElementProps = {},
    S extends IFrameworkElementState = {}>    
    extends React.Component<P, S>
    implements INotifyPropertyChanged
{
    _calledLoaded: boolean = false;

    constructor(props)
    {
        super(props);        
        Antimatter.InitializeComponent(this);
        this.ApplyStyle();

        if (this.state.LoadedCommand)
            this.callLoadedCommand();        
    }    
    
    render()
    {
        if (this.state.IsVisible === false)
            return null;

        return (
            <div
                style={this.getCSSStyles()}
                onClick={this.state.OnClick
                    ? (event) => this.state.OnClick?.call(this, event.nativeEvent)
                    : undefined}
                onPointerMove={this.state.OnPointerMove
                    ? (event) =>
                        this.state.OnPointerMove?.call(this, event.nativeEvent)
                    : undefined}
                onPointerDown={this.state.OnPointerDown
                    ? (event) =>
                        this.state.OnPointerDown?.call(this, event.nativeEvent)
                    : undefined}
                onPointerUp={this.state.OnPointerUp
                    ? (event) =>
                        this.state.OnPointerUp?.call(this, event.nativeEvent)
                    : undefined}
                onLostPointerCapture={this.state.OnLostPointerCapture
                    ? (event) =>
                        this.state.OnLostPointerCapture?.call(this, event.nativeEvent)
                    : undefined}
                className={this.constructor.name + " " + (this.props.ClassName || "") + " " + (this.state.Style?.Class() || "") + " " + this.constructClasses()}>
                {
                    this.state.IsLoading && this.state.LoadingTemplate
                        ? this.state.LoadingTemplate()
                        : (this.state.ToolTip
                            ? (<TooltipHost content={this.state.ToolTip}>
                                    { this.renderElement()}
                                </TooltipHost>)
                            : this.renderElement())
                }
            </div>
        );
    }

    public InvalidateRender()
    {
        this.OnInvalidateRender();
        this.setState({});        
    }

    public BindState(parameters: BindingParameters, stateVar?: string): any
    {
        // Inline Binding. Binding function returns a value 
        // immediately and also binds state for future update                
        return Antimatter.BindState(this, parameters, stateVar);
    }

    /* virtual */ OnInvalidateRender()
    {
    }

    /* virtual */ OnLoaded()
    {
    }

    /**
     * Sets a state property value for the element, updating any
     * two-way binding targets, and optionally forces a re-render
     * of the element. Use instead of Component.setState.
     * @param property
     * @param newValue
     * @param reRender
     */
    /* protected */ SetValue(property: string, newValue: any, reRender?: boolean): void
    {
        if (this.state[property] === newValue)
            return;
        Antimatter.TargetChanged(this, property, newValue, reRender);
    }

    /* virtual */ renderElement(): JSX.Element | null
    {
        return null;
    }

    /* virtual */ getCSSStyles(): React.CSSProperties
    {
        let styles: React.CSSProperties = {
            margin: this.state.Margin
        };
        if (this.state.Grid?.Column !== undefined)
            styles.gridColumn = this.state.Grid.Column + 1;
        if (this.state.Grid?.Row !== undefined)
            styles.gridRow = this.state.Grid.Row + 1;
        return styles;
    }

    /* virtual */ OnPropertyChanged(property: string, value: any)
    {
        if (!this._calledLoaded && value && property === nameof(this.state.LoadedCommand))
            this.callLoadedCommand();       
    }

    /* virtual */ GetLoadedCommandParameter(): any
    {
    }

    async callLoadedCommand()
    {
        this._calledLoaded = true;
        await Antimatter.Server.ExecuteICommand(
            this.state.LoadedCommand as ModelObjectReference,
            ModelValue.Get(this.GetLoadedCommandParameter()));        
        this.OnLoaded();
    }

    constructClasses(): string
    {
        let cls: string = ' amx-ptn-fe ';

        switch (this.state.HorizontalAlignment)
        {
            case HorizontalAlignment.Center:
                cls += "amx-ptn-ha-center ";
                break;
            case HorizontalAlignment.Left:
                cls += "amx-ptn-ha-left ";
                break;
            case HorizontalAlignment.Right:
                cls += "amx-ptn-ha-right ";
                break;
            case undefined:
            default:
                cls += "amx-ptn-ha-stretch ";
                break;
        }

        switch (this.state.VerticalAlignment)
        {
            case VerticalAlignment.Center:
                cls += "amx-ptn-va-center ";
                break;
            case VerticalAlignment.Top:
                cls += "amx-ptn-va-top ";
                break;
            case VerticalAlignment.Bottom:
                cls += "amx-ptn-va-bottom ";
                break;
            case VerticalAlignment.Stretch:
            case undefined:
                cls += "amx-ptn-va-stretch ";
                break;
        }

        if (this.state.Overlaps)
            cls += "amx-ptn-overlaps ";       

        return cls;
    }

    ApplyStyle()
    {
        var style = this.props.Style ||
            (this.constructor as any).DefaultStyle
            //|| this.GetDefaultStyle()
            ;
        if (!style)
            return;
        (this.state as any).Style = style;
        var entries = Object.entries(style.Props);
        for (const entry of entries)
        {
            if (!this.props[entry[0]])
            {
                var val = entry[1];
                if ((val as Binding)?.IsAntimatterBinding)
                {
                    this.BindState((val as Binding).Parameters || {}, entry[0]);
                }
                else
                {
                    this.state[entry[0]] = entry[1];
                }
            }
        }
    }

    PropertyChanged: Event<PropertyChangedEventArgs> = new Event<PropertyChangedEventArgs>();
}