import * as React from 'react';

import { Binding, Antimatter, BindingParameters, INotifyPropertyChanged, PropertyChangedEventArgs, Event, ModelObjectReference, ModelValue } from '@antimatterjs/react';
import { HorizontalAlignment, VerticalAlignment, WindowLayout } from './Enums';

import './positron.css';
import { TooltipHost } from '@fluentui/react';
import { IGridChildPosition } from './Controls/Grid';
import { MultitouchTransform } from './Media/MultitouchTransform';
import { ManipulationEvent, ManipulationEventArgs } from './Input/ManipulationEventArgs';
import { ManipulationHelper } from './Input/ManipulationHelper';
import { Point } from './Foundation';
import { Style, WebStyle } from './Style';
import { CSSClasses } from './CSSClasses';
import { ThemeColor, Theme, ThemeLayout } from './Theme';

export const TemplatedParentContext = React.createContext<FrameworkElement | undefined>(undefined);

interface IFrameworkElementCommon
{
    // Use only for control development; never use for cross-platform views    
    Style?: Style<any>,    
    OnClick?: (event: MouseEvent) => void,
    OnScroll?: (event: UIEvent) => void,
    OnPointerDown?: (event: PointerEvent) => void,
    OnPointerMove?: (event: PointerEvent) => void,
    OnPointerUp?: (event: PointerEvent) => void,
    OnPointerLeave?: (event: PointerEvent) => void,
    OnPointerCancel?: (event: PointerEvent) => void,
    OnPointerOut?: (event: PointerEvent) => void,
    OnLostPointerCapture?: (event: PointerEvent) => void,
    OnManipulationStarting?: (event: ManipulationEventArgs) => void,
    OnManipulationStarted?: (event: ManipulationEventArgs) => void,
    OnManipulationDelta?: (event: ManipulationEventArgs) => void,
    OnManipulationCompleted?: (event: ManipulationEventArgs) => void,
    OnKeyPress?: (event: KeyboardEvent) => void,
    OnKeyDown?: (event: KeyboardEvent) => void,
    Grid?: IGridChildPosition,
    Overlaps?: boolean,
    LoadingTemplate?: () => JSX.Element,
    Transform?: MultitouchTransform,
    TabIndex?: number
}

export interface IFrameworkElementProps extends IFrameworkElementCommon
{
    Margin?: string | ThemeLayout,
    IsEnabled?: boolean | Binding,
    ClassName?: string|Binding,
    HorizontalAlignment?: HorizontalAlignment |Binding,
    VerticalAlignment?: VerticalAlignment|Binding,
    IsVisible?: boolean | Binding,
    IsHitTestVisible?: boolean | Binding,
    ToolTip?: string | JSX.Element | Binding,
    LoadedCommand?: ModelObjectReference | Binding,
    IsLoading?: boolean | Binding,
    OnDidMount?: ModelObjectReference | Binding | ((sender: FrameworkElement) => void),    
    OnWillUnmount?: ModelObjectReference | Binding,
}

export interface IFrameworkElementState extends IFrameworkElementCommon
{
    ClassName?: string,
    IsEnabled?: boolean,
    HorizontalAlignment?: HorizontalAlignment,
    VerticalAlignment?: VerticalAlignment,
    IsVisible?: boolean,
    IsHitTestVisible?: boolean,
    ToolTip?: string | JSX.Element,
    DataContext?: ModelObjectReference,
    LoadedCommand?: ModelObjectReference,
    IsLoading?: boolean,
    OnDidMount?: ModelObjectReference | ((sender: FrameworkElement) => void),    
    OnWillUnmount?: ModelObjectReference,
    TemplatedParent?: FrameworkElement
}

export class FrameworkElement<
    P extends IFrameworkElementProps = {},
    S extends IFrameworkElementState = {}>
    extends React.Component<P, S>
    implements INotifyPropertyChanged
{
    _calledLoaded: boolean = false;
    _isRenderValid: boolean = false;
    _isMeasureValid: boolean = false;
    _gestureHandlers: boolean = false;
    private _boundCallbacks?: Map<Function, Function>;
    private _isMounted: boolean = false;

    private _templatedParent?: FrameworkElement;
    private _templatedStyle?: Style<any>;

    public Container: HTMLElement | null = null;

    public get Style(): Style<any>
    {
        return this.state.Style as Style<any>;
    }

    public get IsMounted(): boolean
    {
        return this._isMounted;
    }

    public get TemplatedParent(): FrameworkElement | undefined
    {
        return this._templatedParent;
    }

    protected ExecuteCommand(cmd: ModelObjectReference | ((commandParameter: any) => void), parameter?: any )
    {
        if (typeof (cmd) === "function")
        {
            (cmd as any)(parameter);
        }
        else 
        {
            Antimatter.Server.ExecuteICommand(
                cmd as ModelObjectReference,
                ModelValue.Get(parameter));
        }
    }

    protected Callback(unbound: Function): any
    {
        let bound: Function | undefined = undefined;
        if (!this._boundCallbacks)
            this._boundCallbacks = new Map<Function, Function>();
        else if ((bound = this._boundCallbacks.get(unbound)))
            return bound;
        
        bound = unbound.bind(this) as Function;
        this._boundCallbacks.set(unbound, bound);
        return bound;                    
    }

    //public set TemplatedParent(value: FrameworkElement|undefined)
    //{
    //    if (this._templatedParent === value &&
    //        this._templatedParent?.Style === value?.Style )
    //        return;

    //    this._templatedParent = value;
    //    if (!value || !value.Style)
    //        return;

    //    var props = Object.entries(this.props);
    //    for (var prop of props)
    //    {
    //        if (typeof (prop[1]) === "string" &&
    //            (prop[1] as string).startsWith(WebStyle._templPropFlag))
    //        {
    //            var propName = (prop[1] as string).substring(WebStyle._templPropFlag.length);
    //            var newVal = `var(--prop-${propName}${value.Style._styleID})`;
    //            this.SetValue(prop[0], newVal, false);
    //        }                            
    //    }
    //}

    constructor(props)
    {
        super(props);
        Antimatter.InitializeComponent(this);
        this.ApplyStyle();

        //this.CurrentRoute = (this.state as any).history.location

        if (this.state.LoadedCommand)
            this.callLoadedCommand();
        if (this.state.Transform)
            this.state.Transform.AssignTarget(this);
    }

    readonly render = (): JSX.Element | null =>
    {
        if (this.state.IsVisible === false)
            return null;

        this._isRenderValid = true;

        if (this.state.OnManipulationStarting ||
            this.state.OnManipulationStarted ||
            this.state.OnManipulationDelta ||
            this.state.OnManipulationCompleted)
            this._gestureHandlers = true;

        let webStyleClass: string = '';
        if (this.state.Style instanceof WebStyle)
            webStyleClass = (this.state.Style as WebStyle<any>).Class();

        //onContextMenu={(event) => event.preventDefault()}
        return (
            <TemplatedParentContext.Consumer>
                {ctx =>
                {
                    this._templatedParent = ctx;
                    return (
                        <div
                            ref={r =>
                            {
                                this.Container = r;
                            }}
                            style={this.getCSSStyles()}
                            onScroll={this.state.OnScroll
                                ? (event) => this.state.OnScroll?.call(this, event.nativeEvent)
                                : undefined}
                            onClick={this.state.OnClick
                                ? (event) => this.state.OnClick?.call(this, event.nativeEvent)
                                : undefined}
                            onKeyDown={this.state.OnKeyDown
                                ? (event) => this.state.OnKeyDown?.call(this, event.nativeEvent)
                                : undefined}
                            onKeyPress={this.state.OnKeyPress
                                ? (event) => this.state.OnKeyPress?.call(this, event.nativeEvent)
                                : undefined}
                            onPointerMove={this.state.OnPointerMove || this._gestureHandlers
                                ? (event) => this.OnPointerMove(event)
                                : undefined}
                            onPointerDown={this.state.OnPointerDown || this._gestureHandlers
                                ? (event) => this.OnPointerDown(event)
                                : undefined}
                            onPointerUp={this.state.OnPointerUp || this._gestureHandlers
                                ? (event) => this.OnPointerUp(event)
                                : undefined}
                            onLostPointerCapture={this.state.OnLostPointerCapture
                                ? (event) => this.state.OnLostPointerCapture?.call(this, event.nativeEvent)
                                : undefined}
                            onPointerLeave={this.state.OnPointerLeave || this._gestureHandlers
                                ? (event) => this.OnPointerLeave(event)
                                : undefined}
                            onPointerCancel={this.state.OnPointerCancel || this._gestureHandlers
                                ? (event) => this.OnPointerCancel(event)
                                : undefined}
                            onPointerOut={this.state.OnPointerOut || this._gestureHandlers
                                ? (event) => this.OnPointerOut(event)
                                : undefined}
                            className={this.constructor.name + " " + (this.state.ClassName || "") + " " + webStyleClass + " " + this.constructClasses()}
                            tabIndex={this.state.TabIndex}>
                            {
                                this.state.IsLoading && this.state.LoadingTemplate
                                    ? this.state.LoadingTemplate()
                                    : (this.state.ToolTip
                                        ? (<TooltipHost content={this.state.ToolTip}>
                                            {
                                                this.renderElement()
                                            }
                                        </TooltipHost>)
                                        : this.renderElement())
                            }
                        </div>)
                    }
                }
            </TemplatedParentContext.Consumer>
        );
    }

    public get IsEnabled(): boolean
    {
        return this.GetValue<boolean>(nameof(this.props.IsEnabled), true);
    }

    public get Margin(): string|undefined
    {
        return this.GetValue(nameof(this.props.Margin));
    }

    public get ActualHeight(): number
    {
        return this.Container?.getBoundingClientRect()?.height || 0;
    }

    public get ActualWidth(): number
    {
        return this.Container?.getBoundingClientRect()?.width || 0;
    }

    public InvalidateRender()
    {
        if (!this._isRenderValid)
            return;        
        this._isRenderValid = false;
        this.OnInvalidateRender();
        this.setState((state, props) =>
        {
            return {};
        });
    }

    /**
     * Used to bind a Model property to the React component state, without
     * having to expose bindable props, returning the most recent bound value.
     * As such it should typically called during render, the return value then
     * being used in place of an explicit state variable. (It is safe to call
     * this during each render, as the binding is not duplicated provided the
     * parameters do not change).
     * @param parameters The binding parameters.
     * @param stateVar The name of the state variable to which to bind. If
     * not supplied, a name will be derived from the binding parameters. If
     * two-way binding is to be used, this name must be explicitly given so that
     * it can be provided to SetValue when updating the target value in response
     * to user input.
     */
    public BindState(parameters: BindingParameters, stateVar?: string): any
    {
        // Inline Binding. Binding function returns a value
        // immediately and also binds state for future update
        return Antimatter.BindState(this, parameters, stateVar);
    }

    /**
     * Translates a point from a coordinate system relative to the origin of this element
     * to the origin of another element.
     * @param sourcePoint The Point relative to the source element.
     * @param source The source element. If undefined, sourcePoint is assumed to be client (browser) coordinates.
     * @param relativeTo The element relative to which the point will be translated.
     */
    public static TranslatePoint(sourcePoint: Point, source: FrameworkElement | HTMLElement | undefined, relativeTo: FrameworkElement | HTMLElement): Point
    {
        let sourceElement: HTMLElement | null = null;
        if (source instanceof HTMLElement)
            sourceElement = source as HTMLElement;
        else if (source instanceof FrameworkElement)
            sourceElement = (source as FrameworkElement).Container;

        let relElement: HTMLElement | null = null;
        if (relativeTo instanceof HTMLElement)
            relElement = relativeTo as HTMLElement;
        else
            relElement = (relativeTo as FrameworkElement)?.Container;
        if (!relElement)
            return new Point();

        var sourceRC = sourceElement?.getBoundingClientRect() || { x: 0, y: 0 };
        var relRC = relElement.getBoundingClientRect();
        return new Point(
            sourcePoint.X + (sourceRC.x - relRC.x),
            sourcePoint.Y + (sourceRC.y - relRC.y));
    }

    /* virtual */ OnInvalidateRender()
    {
    }

    /* virtual */ OnLoaded()
    {
    }

    /**
     * Sets a single state variable value for the element, replacing
     * Component.setState. This is most typically used for two-way binding
     * situations to notify the Model side of a UI-driven change (like a button
     * click). Any Model properties two-way bound to this state variable will
     * be updated Model-side, but will not result in a new render of this
     * element unless other bound Model values wind up updating Model-side as a
     * consequence of this update. Also note that unlike setState, state
     * variables are guaranteed to immediately reflect their new values after
     * calling this function. Finally note that this element's OnPropertyChanged
     * function will NOT be called as a result of this function, since the
     * function should only be called in response to UI-side events like input
     * rather than from prop or Model-side changes.
     * @param stateVar The name of the state variable to set.
     * @param newValue The new value.
     * @param reRender Whether to force a re-render. Unlike a source-drvien
     * binding update, a target-driven update will not necessarily result in a new
     * render of this element unless this argument is explicitly set to true. This
     * is because it is presumed that the UI has already given visual feedback
     * in response to the user input. (For example, an input field immediately
     * reflects typed text; there is no need to re-render when updating the
     * Model side with the new text).
     * @param silent If explicitly set to true, the model is not notified
     * of the update. Use this when updating internal state in response to other 
     * model changes. 
     */
    public readonly SetValue = (stateVar: string, newValue: any, reRender?: boolean, silent?: boolean): void =>
    {
        if (this.state[stateVar] === newValue)
            return;

        Antimatter.UpdateModelValue(this, stateVar, newValue, reRender, silent);

        // TODO - Should this fire INotifyPropertyChanged.PropertyChanged?
    }    

    protected GetValue<T>(property: string, defaultValue: T|undefined = undefined): T
    {
        var val = (this.state as any)[property];
        if (typeof (val) === "number" && (val as number) >= Theme.FirstResourceId)
        {
            // Theme resource
            return Theme.Value(val as number);
        }
        else if (typeof (val) === "string" &&
            (this.TemplatedParent?.Style instanceof WebStyle))
        {
            // Possibly a templated prop
            val = (this.TemplatedParent?.Style as WebStyle<any>)?.GetTemplatablePropValue(val as string);
        }
        if (val === undefined)
            val = defaultValue;
        return val as T;
    }

    protected /* virtual */ renderElement(): JSX.Element | null
    {
        return null;
    }

    protected /* virtual */ getCSSStyles(): React.CSSProperties
    {
        let styles: React.CSSProperties = {
            margin: this.Margin
        };
        if (this.state.Grid?.Column !== undefined)
            styles.gridColumn = this.state.Grid.Column + 1;
        if (this.state.Grid?.Row !== undefined)
            styles.gridRow = this.state.Grid.Row + 1;
        if (this.state.IsHitTestVisible === false)
            styles.pointerEvents = "none";
        //if (this._gestureHandlers)
        //    styles.touchAction = "pan-y";
        if (this.state.Transform)
        {
            //styles.transform = this.state.Transform.ToCSS();
            styles.transformOrigin = "0px 0px";
        }        
        return styles;
    }

    public /* virtual */ OnPropertyChanged(property: string, value: any, oldValue: any)
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

    private readonly ExecutePropCommandHandler = (handler: undefined | ModelObjectReference | ((sender: FrameworkElement) => void)) =>
    {
        if (!handler)
            return;
        if (typeof (handler) == "function")
        {
            (handler as ((sender: FrameworkElement) => void))(this);
        }
        else if (handler instanceof ModelObjectReference)
        {
            Antimatter.Server.ExecuteICommand(handler as ModelObjectReference);
        }
    }

    protected /* virtual */ OnComponentMount()
    {
    }
    
    protected /* virtual */ OnComponentWillUnmount()
    {
    }

    protected /* virtual */ OnElementUpdated(oldProps?: P)
    {
    }

    protected /* virtual */ OnElementRendered()
    {
    }

    protected /* virtual */ get ActualHorizontalAlignment(): HorizontalAlignment
    {
        return (this.state.HorizontalAlignment as HorizontalAlignment) === undefined
            ? HorizontalAlignment.Stretch
            : this.state.HorizontalAlignment as HorizontalAlignment;
    }

    protected /* virtual */ get ActualVerticalAlignment(): VerticalAlignment
    {
        return (this.state.VerticalAlignment as VerticalAlignment) === undefined
            ? VerticalAlignment.Stretch
            : this.state.VerticalAlignment as VerticalAlignment;
    }

    componentDidUpdate(prevProps)
    {
        this.OnElementRendered();
        this.OnElementUpdated(prevProps);
    }

    readonly componentDidMount = () =>
    {
        this._isMounted = true;
        this.OnComponentMount();
        this.OnElementRendered();
        this.ExecutePropCommandHandler(this.state.OnDidMount);
    }

    readonly componentWillUnmount = () => 
    {
        this.OnComponentWillUnmount();
        this.ExecutePropCommandHandler(this.state.OnWillUnmount);
    }
    
    protected /* virtual */ constructClasses(): string
    {
        let cls: string = ` ${CSSClasses.Base} `;

        switch (this.ActualHorizontalAlignment)
        {
            case HorizontalAlignment.Center:
                cls += `${CSSClasses.HACenter} `;
                break;
            case HorizontalAlignment.Left:
                cls += `${CSSClasses.HALeft} `;
                break;
            case HorizontalAlignment.Right:
                cls += `${CSSClasses.HARight} `;
                break;
            case undefined:
            default:
                cls += `${CSSClasses.HAStretch} `;
                break;
        }

        switch (this.ActualVerticalAlignment)
        {
            case VerticalAlignment.Center:
                cls += `${CSSClasses.VACenter} `;
                break;
            case VerticalAlignment.Top:
                cls += `${CSSClasses.VATop} `;
                break;
            case VerticalAlignment.Bottom:
                cls += `${CSSClasses.VABottom} `;
                break;
            case VerticalAlignment.Stretch:
            case undefined:
                cls += `${CSSClasses.VAStretch} `;
                break;
        }

        if (this.state.Overlaps)
            cls += `${CSSClasses.Overlaps} `;

        if (!this.IsEnabled)
            cls += `${CSSClasses.Disabled} `;

        return cls;
    }

    private ApplyStyle()
    {
        var style = (this.props.Style ||
            (this.constructor as any).DefaultStyle) as Style<any>;
        if (!style)
            return;
        (this.state as any).Style = style;
        var entries = Object.entries(style.Setters);
        for (const entry of entries)
        {
            if (this.props[entry[0]] === undefined)
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

    //#region "Manipulation Gestures"

    private _manipulationHelper: ManipulationHelper = new ManipulationHelper(this);

    private OnPointerDown(event: React.PointerEvent): void
    {
        this.state.OnPointerDown?.call(this, event.nativeEvent);
        if (this._gestureHandlers)
            this._manipulationHelper.OnPointerDown(event.nativeEvent);
    }

    private OnPointerMove(event: React.PointerEvent): void
    {
        this.state.OnPointerMove?.call(this, event.nativeEvent);
        if (this._gestureHandlers)
            this._manipulationHelper.OnPointerMove(event.nativeEvent);
    }

    private OnPointerUp(event: React.PointerEvent): void
    {
        this.state.OnPointerUp?.call(this, event.nativeEvent);
        if (this._gestureHandlers)
            this._manipulationHelper.OnPointerUp(event.nativeEvent);
    }

    private OnPointerLeave(event: React.PointerEvent): void
    {
        this.state.OnPointerLeave?.call(this, event.nativeEvent);
        if (this._gestureHandlers)
            this._manipulationHelper.OnPointerUp(event.nativeEvent);
    }

    private OnPointerCancel(event: React.PointerEvent): void
    {
        this.state.OnPointerCancel?.call(this, event.nativeEvent);
        if (this._gestureHandlers)
            this._manipulationHelper.OnPointerUp(event.nativeEvent);
    }

    private OnPointerOut(event: React.PointerEvent): void
    {
        this.state.OnPointerOut?.call(this, event.nativeEvent);
        //if (this._gestureHandlers)
        //    this._manipulationHelper.OnPointerUp(event.nativeEvent);
    }


    //#endregion "Manipulation Gestures"
}