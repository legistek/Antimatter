import * as React from 'react';
import
{
    Binding, Antimatter, BindingParameters,
    INotifyPropertyChanged, PropertyChangedEventArgs,
    ModelObjectReference, IBindableComponent, Point, Utilities, HostPlatform
} from '@antimatterjs/react';
import * as AM from '@antimatterjs/react';

import { HorizontalAlignment, UITransitionState, VerticalAlignment, WindowLayout } from './Enums';

import './positron.css';

import { TooltipDelay, TooltipHost } from '@fluentui/react';
import { IGridChildPosition } from './Controls/Grid';
import { Transform } from './Media/MultitouchTransform';
import { ManipulationEventArgs } from './Input/ManipulationEventArgs';
import { ManipulationHelper } from './Input/ManipulationHelper';
import { Style, StyleBase, WebStyle } from './Style';
import { CSSClasses } from './CSSClasses';
import { ThemeColor, Theme, ThemeLayout, ThemeEffect } from './Theme';
import { Application } from './Application';

export const TemplatedParentContext = React.createContext<FrameworkElement | undefined>(undefined);

interface IFrameworkElementCommon
{
    // Use only for control development; never use for cross-platform views
    Style?: StyleBase<any> | Binding,
    OnClick?: (event: React.MouseEvent, targetFe?: FrameworkElement) => void,
    OnDblClick?: (event: React.MouseEvent, targetFe?: FrameworkElement) => void,
    OnScroll?: (event: UIEvent) => void,
    OnResize?: () => void,
    OnPointerDown?: (event: PointerEvent, targetFe?: FrameworkElement) => void,
    OnPointerMove?: (event: PointerEvent, targetFe?: FrameworkElement) => void,
    OnPointerUp?: (event: PointerEvent, targetFe?: FrameworkElement) => void,
    OnPointerLeave?: (event: PointerEvent, targetFe?: FrameworkElement) => void,
    OnPointerEnter?: (event: PointerEvent, targetFe?: FrameworkElement) => void,
    OnPointerCancel?: (event: PointerEvent) => void,
    OnPointerOut?: (event: PointerEvent) => void,
    OnLostPointerCapture?: (event: PointerEvent) => void,
    OnPointerDownCapture?: (event: PointerEvent) => void,
    OnManipulationStarting?: (event: ManipulationEventArgs) => void,
    OnManipulationStarted?: (event: ManipulationEventArgs) => void,
    OnManipulationDelta?: (event: ManipulationEventArgs) => void,
    OnManipulationCompleted?: (event: ManipulationEventArgs) => void,
    OnManipulationHolding?: (event: ManipulationEventArgs) => void,
    IsMouseManipulationEnabled?: boolean | Binding,
    IsTouchManipulationEnabled?: boolean | Binding,
    OnKeyPress?: (event: KeyboardEvent, targetFe?: FrameworkElement) => void,
    OnKeyDown?: (event: KeyboardEvent, targetFe?: FrameworkElement) => void,
    Grid?: IGridChildPosition | Binding,
    Overlaps?: boolean,
    LoadingTemplate?: () => JSX.Element,
    Transform?: Transform | Binding,
    TabIndex?: number,
    ZIndex?: number | Binding,
    ContextMenuCommands?: BindingParameters | Binding | ModelObjectReference[] | (() => JSX.Element),
    ContextMenuCommandParameter?: Binding | ModelObjectReference,
    Cursor?: string | Binding,
    ObserveResize?: boolean | Binding,
    RenderVersion?: number | Binding,
    PlaceContextMenuWithMouse?: boolean,
    IsAbsolutePositioned?: boolean | Binding;
    AbsoluteX?: number | Binding;
    AbsoluteY?: number | Binding;
    VisibleOnParentHover?: boolean;
}

export interface IFrameworkElementProps extends IFrameworkElementCommon
{
    Margin?: string | ThemeLayout | Binding | number,
    IsEnabled?: boolean | Binding,
    ClassName?: string | Binding,
    HorizontalAlignment?: HorizontalAlignment | Binding,
    VerticalAlignment?: VerticalAlignment | Binding,
    IsVisible?: boolean | Binding,
    IsHidden?: boolean | Binding,
    IsHitTestVisible?: boolean | Binding,
    Opacity?: number | Binding,
    ToolTip?: string | JSX.Element | Binding,
    LoadedCommand?: ModelObjectReference | Binding,
    IsLoading?: boolean | Binding,
    OnDidMount?: ModelObjectReference | Binding | ((sender: FrameworkElement) => void),
    OnWillUnmount?: ModelObjectReference | Binding | ((sender: FrameworkElement) => void),
    //OnDoubleClick?: ModelObjectReference | Binding,
    Animation?: ThemeEffect | Binding,
    AnimateOnFirstRender?: boolean,
    TransitionState?: UITransitionState | Binding;
    EntranceAnimation?: ThemeEffect | Binding;
    ExitAnimation?: ThemeEffect | Binding;
}

export interface IFrameworkElementState extends IFrameworkElementCommon
{
    HorizontalAlignment?: HorizontalAlignment,
    VerticalAlignment?: VerticalAlignment,
    IsVisible?: boolean,
    Opacity?: number,
    DataContext?: ModelObjectReference,
    LoadedCommand?: ModelObjectReference,
    OnDidMount?: ModelObjectReference | ((sender: FrameworkElement) => void),
    OnWillUnmount?: ModelObjectReference | ((sender: FrameworkElement) => void),
    //OnDoubleClick?: ModelObjectReference,
    TemplatedParent?: FrameworkElement,
    IsActuallyVisible?: boolean,
}

export class FrameworkElement<
    P extends IFrameworkElementProps = {},
    S extends IFrameworkElementState = {}>
    extends React.Component<P, S>
    implements INotifyPropertyChanged, IBindableComponent
{
    private _calledLoaded: boolean = false;
    protected _isRenderValid: boolean = false;
    private _isCascadedRenderPending: boolean = false;
    private _boundCallbacks?: Map<Function, Function>;
    private _isMounted: boolean = false;
    private _templatedParent?: FrameworkElement;
    protected static _route: string = '/';
    protected _resizeObserver?: ResizeObserver;
    private _container: HTMLElement | SVGSVGElement | null = null;

    public HasUnappliedCtxBindings: boolean = false;

    public get Container(): HTMLElement | SVGSVGElement | null
    {
        return this._container;
    }

    public Mounted: AM.Event<void> = new AM.Event();

    public static LastMouseEvent: Point = { X: 0, Y: 0 };

    public static get Route(): string
    {
        return FrameworkElement._route;
    }

    public /* virtual */ get DeferBindings(): boolean
    {
        return false;
    }

    public /* virtual */ get VisibleOnParentHover(): boolean
    {
        return this.GetValue(nameof(this.props.VisibleOnParentHover), false);
    }

    public get IsAbsolutePositioned(): boolean
    {
        return this.GetValue(nameof(this.props.IsAbsolutePositioned), false);
    }

    public get AbsoluteX(): number
    {
        return this.GetValue(nameof(this.props.AbsoluteX), 0);
    }

    public get AbsoluteY(): number
    {
        return this.GetValue(nameof(this.props.AbsoluteY), 0);
    }

    public get PlaceContextMenuWithMouse(): boolean
    {
        return this.GetValue(nameof(this.props.PlaceContextMenuWithMouse), false);
    }

    public get OnPointerMove(): undefined | ((event: PointerEvent, targetFe?: FrameworkElement) => void)
    {
        return this.GetValue(nameof(this.props.OnPointerMove));
    }

    public get OnDblClick(): undefined | ((event: React.MouseEvent, targetFe?: FrameworkElement) => void)
    {
        return this.GetValue(nameof(this.props.OnDblClick));
    }

    public get OnClickHandler(): undefined | ((event: React.MouseEvent, targetFe?: FrameworkElement) => void)
    {
        return this.GetValue(nameof(this.props.OnClick));
    }

    public get Grid(): IGridChildPosition | undefined
    {
        return this.GetValue(nameof(this.props.Grid));
    }

    public get ZIndex(): number | undefined
    {
        return this.GetValue(nameof(this.props.ZIndex));
    }

    public get DataContext(): any
    {
        return this.GetValue(nameof(this.state.DataContext));
    }

    public get IsHidden(): boolean
    {
        return this.GetValue(nameof(this.props.IsHidden), false);
    }

    public get TransitionState(): UITransitionState
    {
        return this.GetValue(nameof(this.props.TransitionState), UITransitionState.Normal);
    }

    public get EntranceAnimation(): string | undefined
    {
        return this.GetValue(nameof(this.props.EntranceAnimation));
    }

    public get ExitAnimation(): string | undefined
    {
        return this.GetValue(nameof(this.props.ExitAnimation));
    }

    public get IsVisible(): boolean
    {
        const desiredVisibility = this.GetValue(nameof(this.props.IsVisible), true);
        if (!this.ExitAnimation)
            return desiredVisibility;
        else
            return this.GetValue(
                nameof(this.state.IsActuallyVisible),
                desiredVisibility);
    }

    protected /* virtual */ get VisibilityOverride(): boolean
    {
        return this.IsVisible;
    }

    public get ContextMenuCommands(): BindingParameters | ModelObjectReference[] | (() => JSX.Element) | undefined
    {
        return this.GetValue(nameof(this.props.ContextMenuCommands));
    }

    public get ContextMenuCommandParameter(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.ContextMenuCommandParameter));
    }

    private _isContextMenuOpen: boolean = false;
    public get IsContextMenuOpen(): boolean
    {
        return this._isContextMenuOpen;
    }
    public set IsContextMenuOpen(value: boolean)
    {
        if (this._isContextMenuOpen === value)
            return;
        this._isContextMenuOpen = value;
        this.PropertyChanged?.invoke(this, new PropertyChangedEventArgs(nameof(this.IsContextMenuOpen)));
        this.InvalidateRender();
    }

    public get IsManipulationEnabled(): boolean
    {
        return this.IsMouseManipulationEnabled || this.IsTouchManipulationEnabled;
    }

    public /* virtual */ get IsTouchManipulationEnabled(): boolean
    {
        return this.GetValue(nameof(this.props.IsTouchManipulationEnabled), false);
    }
    public set IsTouchManipulationEnabled(value: boolean)
    {
        this.SetValue(nameof(this.props.IsTouchManipulationEnabled), value);
    }

    public get IsMouseManipulationEnabled(): boolean
    {
        return this.GetValue(nameof(this.props.IsMouseManipulationEnabled), false);
    }

    public get AnimateOnFirstRender(): boolean
    {
        return this.GetValue(nameof(this.props.AnimateOnFirstRender), false);
    }

    public get Animation(): string | undefined
    {
        return this.GetValue(nameof(this.props.Animation));
    }

    public get ToolTip(): string | JSX.Element | undefined
    {
        return this.GetValue(nameof(this.props.ToolTip));
    }

    public get Style(): Style<any> | undefined
    {
        return this.GetValue(nameof(this.props.Style));    
    }

    public get RenderVersion(): number
    {
        return this.GetValue(nameof(this.props.RenderVersion), 0);
    }

    public get IsMounted(): boolean
    {
        return this._isMounted;
    }

    public get IsLoading(): boolean
    {
        return this.GetValue<boolean>(nameof(this.props.IsLoading), false);
    }

    public get IsHitTestVisible(): boolean | undefined
    {
        return this.GetValue<boolean>(nameof(this.props.IsHitTestVisible));
    }

    public get TemplatedParent(): FrameworkElement | undefined
    {
        return this._templatedParent;
    }

    public get Cursor(): string | undefined
    {
        return this.GetValue(nameof(this.props.Cursor));
    }

    public OnClickOutsideMe(callback: () => void)
    {
        if (!this._onClickOutsideMe)
        {
            // first time
            this.OnClickOutsideMeHandler = this.OnClickOutsideMeHandler.bind(this);
        }
        this._onClickOutsideMe = callback;
        this.FindWindowRootContainer()?.addEventListener(
            "pointerdown",
            this.OnClickOutsideMeHandler);
        //this.FindWindowRootContainer()?.addEventListener(
        //    "contextmenu",
        //    this.OnClickOutsideMeHandler);
        //if (Application.CurrentWindow)
        //    Application.CurrentWindow.ClickOutsideMeHandler = this.OnClickOutsideMeHandler;


    }

    protected /* virtual */ OnContainerMounted(container: HTMLElement)
    {
    }

    protected /* virtual */ OnContainerUnmounted(container: Element)
    {
    }

    protected /* virtual */ OnResize()
    {
    }

    protected SetupResizeObserver()
    {
        if (!this.Container)
            return;
        this._resizeObserver = new ResizeObserver(() =>
        {
            // console.log(`panel width ${this.Container?.clientWidth}; actual width ${this.ActualWidth}`);
            this.OnResize();
            this.state.OnResize?.call(undefined);
        });
        this._resizeObserver.observe(this.Container);
    }

    protected DisconnectResizeObserver()
    {
        this._resizeObserver?.disconnect();
        this._resizeObserver = undefined;
    }

    protected FindWindowRootContainer(): HTMLElement | undefined
    {
        var dlg = document.getElementsByClassName(CSSClasses.DialogRoot);
        if (dlg && dlg.length !== 0)
            return dlg[0] as HTMLElement;

        var windows = document.getElementsByClassName(CSSClasses.Root);
        // really should only be one
        if (windows && windows.length !== 0)
            return windows[0] as HTMLElement;

        return undefined;
    }

    private OnClickOutsideMeHandler(e: PointerEvent | MouseEvent)
    {
        if (!this._onClickOutsideMe)    // should be impossible
            return;
        if (!e.target ||
            this.Container === e.target ||
            this.Container?.contains(e.target as HTMLElement))
            return;
        this.FindWindowRootContainer()?.removeEventListener(
            "pointerdown",
            this.OnClickOutsideMeHandler);
        this._onClickOutsideMe();
    }

    private _onClickOutsideMe?: () => void;

    public ExecuteCommand(cmd?: ModelObjectReference | ((commandParameter: any) => void), parameter?: any)
    {
        if (!cmd)
            return;
        if (typeof (cmd) === "function")
        {
            (cmd as any)(parameter);
        }
        else
        {
            Antimatter.Server.ExecuteICommand(cmd as ModelObjectReference, parameter);
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

    constructor(props)
    {
        super(props);
        this.InitializeElement();

        //this.CurrentRoute = (this.state as any).history.location

        if (this.Transform)
            this.Transform.AssignTarget(this);
        this.OnEntranceAnimationCompleted = this.OnEntranceAnimationCompleted.bind(this);
        this.OnExitAnimationCompleted = this.OnExitAnimationCompleted.bind(this);
    }

    protected InitializeElement()
    {
        Antimatter.InitializeComponent(this);
        if (this.DeferBindings)
            return;
        this.ApplyStyle();
    }

    protected /* virtual */ OverrideContainerAttributes(
        containerProps:
            React.HTMLAttributes<HTMLElement> &
            React.ClassAttributes<HTMLElement>)
    {
    }

    readonly render = (): JSX.Element | null =>
    {
        if (!this.VisibilityOverride)
        {
            if (this.Container)
            {
                this.OnContainerUnmounted(this.Container);
                this.SetContainer(null);
            }
            return null;
        }

        this._isRenderValid = true;
        this._isCascadedRenderPending = false;

        let webStyleClass: string = '';
        if (this.Style)
            webStyleClass = this.Style.Class();

        //onContextMenu={(event) => event.preventDefault()}
        return (
            <TemplatedParentContext.Consumer>
                {ctx =>
                {
                    this._templatedParent = ctx;
                    var divProps: React.HTMLAttributes<HTMLElement> & React.ClassAttributes<HTMLElement> = {
                        ref: r =>
                        {
                            if (!r)
                                return;
                            this.SetContainer(r);
                            this.OnContainerMounted(r);
                        },
                        style: this.getCSSStyles(),
                        onScroll: this.state.OnScroll
                            ? (event) => this.state.OnScroll?.call(this, event.nativeEvent)
                            : undefined,
                        onClick: this.OnClickHandler
                            ? (event) =>
                            {
                                this.OnClickHandler?.call(this, event, this);
                            }
                            : undefined,
                        onDoubleClick: this.state.OnDblClick
                            ? (event) => this.state.OnDblClick?.call(this, event, this)
                            : undefined,
                        onKeyDown: this.state.OnKeyDown
                            ? (event) => this.state.OnKeyDown?.call(this, event.nativeEvent, this)
                            : undefined,
                        onKeyPress: this.state.OnKeyPress
                            ? (event) => this.state.OnKeyPress?.call(this, event.nativeEvent, this)
                            : undefined,
                        onTouchStart: this.state.IsTouchManipulationEnabled ?
                            (event) => this.OnHandleTouchStart(event) : undefined,
                        onTouchMove: this.state.IsTouchManipulationEnabled ?
                            (event) => this.OnHandleTouchMove(event) : undefined,
                        onTouchEnd: this.state.IsTouchManipulationEnabled ?
                            (event) => this.OnHandleTouchEnd(event) : undefined,
                        onPointerMove: this.state.OnPointerMove || this.IsManipulationEnabled
                            ? (event) => this.OnHandlePointerMove(event)
                            : undefined,
                        onPointerDown: this.state.OnPointerDown || this.IsManipulationEnabled || this.ContextMenuCommands
                            ? (event) => this.OnPointerDown(event)
                            : undefined,
                        onPointerUp: this.state.OnPointerUp || this.IsManipulationEnabled
                            ? (event) => this.OnPointerUp(event)
                            : undefined,
                        onPointerDownCapture: this.state.OnPointerDownCapture
                            ? (event) => this.state.OnPointerDownCapture?.call(this, event.nativeEvent)
                            : undefined,
                        onLostPointerCapture: this.state.OnLostPointerCapture
                            ? (event) => this.state.OnLostPointerCapture?.call(this, event.nativeEvent)
                            : undefined,
                        onPointerLeave: this.state.OnPointerLeave || this.IsManipulationEnabled
                            ? (event) => this.OnPointerLeave(event)
                            : undefined,
                        onPointerEnter: this.state.OnPointerEnter
                            ? (event) => this.state.OnPointerEnter?.call(this, event.nativeEvent, this)
                            : undefined,
                        onPointerCancel: this.state.OnPointerCancel || this.IsManipulationEnabled
                            ? (event) => this.OnPointerCancel(event)
                            : undefined,
                        onPointerOut: this.state.OnPointerOut || this.IsManipulationEnabled
                            ? (event) => this.OnPointerOut(event)
                            : undefined,
                        className: this.constructor.name + " " + (this.GetValue(nameof(this.props.ClassName)) || "") + " " + webStyleClass + " " + this.constructClasses(),
                        tabIndex: this.state.TabIndex
                    };

                    if (this.TransitionState === UITransitionState.New &&
                        this.EntranceAnimation)
                        divProps.onAnimationEnd = this.OnEntranceAnimationCompleted;
                    else if (this.TransitionState === UITransitionState.Removing &&
                        this.ExitAnimation)
                        divProps.onAnimationEnd = this.OnExitAnimationCompleted;

                    this.OverrideContainerAttributes(divProps);

                    var children =
                        this.IsLoading && this.state.LoadingTemplate
                            ? this.state.LoadingTemplate()
                            : (this.ToolTip
                                ? (<TooltipHost
                                    closeDelay={500}
                                    content={<pre>{this.ToolTip}</pre>}
                                    delay={TooltipDelay.long}>
                                    {
                                        this.ContextMenuCommands
                                            ? (<>{this.renderElement()}{FrameworkElement.RenderContextMenu(this, this.ContextMenuCommandParameter)}</>)
                                            : this.renderElement()
                                    }
                                </TooltipHost>)
                                : (this.ContextMenuCommands
                                    ? (<>{this.renderElement()}{FrameworkElement.RenderContextMenu(this, this.ContextMenuCommandParameter)}</>)
                                    : this.renderElement())
                            );

                    return React.createElement(this.BoundingBoxType, divProps, children);
                }}
            </TemplatedParentContext.Consumer>
        );
    }

    private OnEntranceAnimationCompleted()
    {
        this.SetValue(nameof(this.props.TransitionState), UITransitionState.Normal, false);
        // 2026-07 - PNM - this might be necessary for scrolling
        // so we don't get an entrance animation replaying when the item
        // scrolls back into place
        if (this.Container)
            this.Container.style.removeProperty("animation");
    }

    private OnExitAnimationCompleted()
    {
        this.SetValue(nameof(this.props.TransitionState), UITransitionState.Removed, false);
        // 2026-07 - PNM - this shouldn't actually be necessary, and it's 
        // causing a flash on React 19. 
        // if (this.Container)
        //     this.Container.style.removeProperty("animation");
    }

    protected /* virtual */ get BoundingBoxType(): keyof React.JSX.IntrinsicElements
    {
        return 'div';
    }
    
    public get Transform(): Transform | undefined
    {
        return this.GetValue(nameof(this.props.Transform));
    }

    public /* virtual */ get ObserveResize()
    {
        return this.GetValue(nameof(this.props.ObserveResize), false);
    }

    public /* virtual */ OnManipulationStarting(event: ManipulationEventArgs)
    {
        this.state.OnManipulationStarting?.call(this, event);
    }

    public /* virtual */ OnManipulationStarted(event: ManipulationEventArgs)
    {
        this.state.OnManipulationStarted?.call(this, event);
    }

    public /* virtual */ OnManipulationDelta(event: ManipulationEventArgs)
    {
        this.state.OnManipulationDelta?.call(this, event);
    }

    public /* virtual */ OnManipulationCompleted(event: ManipulationEventArgs)
    {
        this.state.OnManipulationCompleted?.call(this, event);
    }

    public /* virtual */ OnManipulationHolding(event: ManipulationEventArgs)
    {
        this.state.OnManipulationHolding?.call(this, event);
        //if (!this.Container)
        //    return;
        //var ev = new Event('contextmenu');
        //this.Container.dispatchEvent(ev);
    }

    public get IsEnabled(): boolean
    {
        return this.GetValue<boolean>(nameof(this.props.IsEnabled), true);
    }

    public get Margin(): string | number | undefined
    {
        return this.GetValue(nameof(this.props.Margin));
    }

    public get ActualHeight(): number
    {
        //return this.Container?.getBoundingClientRect()?.height || 0;
        return this.Container?.clientHeight || 0;
    }

    public get ActualWidth(): number
    {
        //var w1 = this.Container?.getBoundingClientRect()?.width || 0;
        return this.Container?.clientWidth || 0;
        //if (w1 !== w2)
        //{
        //    let a = 1;
        //}
        //return w1;
    }

    public InvalidateRender(forceCascade?: boolean)
    {
        if (!this._isRenderValid && this._isCascadedRenderPending == forceCascade)
            return;
        this._isRenderValid = false;
        this._isCascadedRenderPending ||= (forceCascade || false);
        this.OnInvalidateRender(!!forceCascade);
        if (!this.IsMounted)
            return;
        Antimatter._client.InvalidateRender(this, false);
    }

    /**
     * Used to bind a Model property to the React component state, without
     * having to expose bindable props, returning the most recent bound value.
     * As such it should typically called during render, the return value then
     * being used in place of an explicit state variable. (It is safe to call
     * this during each render, as the binding is not duplicated provided the
     * parameters do not change, and if they do change, the old binding is
     * cleared and the new one used instead).
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
        let sourceElement: HTMLElement | SVGSVGElement | null = null;
        if (source instanceof HTMLElement)
            sourceElement = source as HTMLElement;
        else if (source instanceof FrameworkElement)
            sourceElement = (source as FrameworkElement).Container;

        let relElement: HTMLElement | SVGSVGElement | null = null;
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

    protected /* virtual */ OnInvalidateRender(forceCasecade: boolean)
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
     * @param reRender Whether to force a re-render. If unsUnlike a source-drvien
     * binding update, a target-driven update will not necessarily result in a new
     * render of this element unless this argument is explicitly set to true. This
     * is because it is presumed that the UI has already given visual feedback
     * in response to the user input. (For example, an input field immediately
     * reflects typed text; there is no need to re-render when updating the
     * Model side with the new text). The default if not specified is true.
     * @param silent If explicitly set to true, the model is not notified
     * of the update. Use this when updating internal state in response to other
     * model changes.
     * @param force If set to true, the operaiton will go through even if the
     * value hasn't changed; used to force a model-side update.
     */
    public readonly SetValue = (stateVar: string, newValue: any, reRender?: boolean, silent?: boolean, force?: boolean): void =>
    {
        if (this.state[stateVar] === newValue && force !== true)
            return;

        Antimatter.UpdateModelValue(this, stateVar, newValue, reRender, silent);

        // TODO - Should this fire INotifyPropertyChanged.PropertyChanged?
    }

    private static _scrollbarSize?: number;
    public static get ScrollbarSize(): number
    {
        if (FrameworkElement._scrollbarSize !== undefined)
            return FrameworkElement._scrollbarSize;

        // Creating invisible container
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll'; // forcing scrollbar to appear
        document.body.appendChild(outer);

        // Creating inner element and placing it in the container
        const inner = document.createElement('div');
        outer.appendChild(inner);

        // Calculating difference between container's full width and the child width
        const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

        // Removing temporary elements from the DOM
        outer.parentNode?.removeChild(outer);

        return FrameworkElement._scrollbarSize = scrollbarWidth;
    }

    protected GetValue<T>(property: string, defaultValue: T | undefined = undefined): T
    {
        var val = (this.state as any)[property];
        if (typeof (val) === "number" && (val as number) >= Theme.FirstResourceId)
        {
            // Theme resource
            return Theme.Value(val as number);
        }
        else if (typeof (val) === "string" && this.TemplatedParent?.Style)
        {
            // Possibly a templated prop
            val = this.TemplatedParent.Style.GetTemplatablePropValue(val as string);
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
        if (this.Grid?.Column !== undefined)
            styles.gridColumn = `${this.Grid.Column + 1} ${this.Grid?.ColumnSpan !== undefined ? ` / span ${this.Grid.ColumnSpan}` : ''}`;
        if (this.Grid?.Row !== undefined)
            styles.gridRow = `${this.Grid.Row + 1} ${this.Grid?.RowSpan !== undefined ? ` / span ${this.Grid.RowSpan}` : ''}`;
        if (this.IsHitTestVisible === false)
            styles.pointerEvents = "none";
        else if (this.IsHitTestVisible === true)
            styles.pointerEvents = "all";
        //if (this._gestureHandlers)
        //    styles.touchAction = "pan-y";
        if (this.Transform)
        {
            styles.transform = this.Transform.ToCSS();
            styles.transformOrigin = this.Transform.OriginString;
        }
        if (this.state.Opacity !== undefined)
        {
            styles.opacity = this.state.Opacity.toString()
        }
        if (this.Animation !== undefined &&
            (this.AnimateOnFirstRender || this._isMounted))
        {
            styles.animation = this.Animation;
        }

        var props = this.Style?.TemplateProps;
        if (props?.size && props?.size > 0)
            this.SetupTemplateProps(styles, props);

        if (this.state.ZIndex)
            styles.zIndex = this.ZIndex;
        if (this.state.Cursor)
            styles.cursor = this.state.Cursor as any;

        if (this.IsHidden)
            styles.visibility = "collapse";

        if (this.TransitionState === UITransitionState.New &&
            this.EntranceAnimation)
        {
            styles.animation = this.EntranceAnimation;
        }
        else if (this.TransitionState === UITransitionState.Removing &&
            this.ExitAnimation)
        {
            styles.animation = this.ExitAnimation;
        }

        styles.position = this.IsAbsolutePositioned ? "absolute" : undefined;
        styles.left = this.IsAbsolutePositioned ? this.AbsoluteX : undefined;
        styles.top = this.IsAbsolutePositioned ? this.AbsoluteY : undefined;

        return styles;
    }

    public /* virtual */ OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.props.IsVisible))
        {
            // Allows the exit animation to be invoked when visibility is 
            // collapsed without having to explicitly bind to TransitionState
            if (this.ExitAnimation)
            {
                if (!value)
                {
                    if (this.Container)
                    {
                        this.Container.onanimationend = (e) =>
                        {
                            this.SetValue(nameof(this.state.IsActuallyVisible), false);
                            this.SetValue(nameof(this.props.TransitionState), UITransitionState.Removed, false);                            
                        };
                        this.SetValue(nameof(this.props.TransitionState), UITransitionState.Removing, true);
                    }
                    else
                    {
                        this.SetValue(nameof(this.props.TransitionState), UITransitionState.Removed, false);
                        this.SetValue(nameof(this.state.IsActuallyVisible), false, true);
                    }
                }
                else 
                {
                    this.SetValue(nameof(this.props.TransitionState), UITransitionState.New);
                    this.SetValue(nameof(this.state.IsActuallyVisible), true);
                }
            }
        }
        else if (!this._calledLoaded && value && property === nameof(this.state.LoadedCommand))
            this.callLoadedCommand();
        else if (property === nameof(this.props.RenderVersion))
            this.InvalidateRender(true);
        else if (property === nameof(this.props.Transform))
        {
            if (oldValue instanceof Transform)
                oldValue.ClearTarget();
            if (value instanceof Transform)
                value.AssignTarget(this);
        }
        else if (property === nameof(this.props.Style))
        {
            this.ApplyStyle(true);
        }
    }

    /* virtual */ GetLoadedCommandParameter(): any
    {
        return FrameworkElement._route;
    }

    async callLoadedCommand()
    {
        if (!this.state.LoadedCommand || this._calledLoaded)
            return;
        this._calledLoaded = true;
        await Antimatter.Server.ExecuteICommand(
            this.state.LoadedCommand as ModelObjectReference,
            this.GetLoadedCommandParameter());
    }

    private SetupTemplateProps(styles: React.CSSProperties, names: Set<string>)
    {
        for (var name of names)
        {
            if (!(this.state as any)[name])
                continue;
            if (this.props[name] === undefined)
                // element takes its value from the style, 
                // so no need to go further
                continue;
            var val = this.GetValue(name);
            if (val === undefined)
                continue;
            styles[`--prop-${name}${(this.Style as WebStyle<any>)._styleID}`] = val;
        }
    }

    protected readonly ExecutePropCommandHandler =
        (handler: undefined | ModelObjectReference | ((sender: FrameworkElement) => void),
        commandParameter?: any) =>
    {
        if (!handler)
            return;
        if (typeof (handler) == "function")
        {
            (handler as ((sender: FrameworkElement) => void))(this);
        }
        else if (handler instanceof ModelObjectReference)
        {
            Antimatter.Server.ExecuteICommand(handler as ModelObjectReference, commandParameter);
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
        this.callLoadedCommand();
        this.OnComponentMount();
        this.Mounted.invoke(this);
        this.OnElementRendered();
        this.ExecutePropCommandHandler(this.state.OnDidMount);
    }

    readonly componentWillUnmount = () =>
    {
        this.OnComponentWillUnmount();
        this._resizeObserver?.disconnect();
        this._resizeObserver = undefined;
        this.ExecutePropCommandHandler(this.state.OnWillUnmount);
        if (this._onClickOutsideMe)
            this.FindWindowRootContainer()?.removeEventListener(
                "pointerdown",
                this.OnClickOutsideMeHandler);
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
            case HorizontalAlignment.Inline:
                cls += `${CSSClasses.HAInline} `;
                break;
            case undefined:
            default:
                cls += `${CSSClasses.HAStretch} `;
                break;
        }

        cls += FrameworkElement.GetClassForVerticalAlignment(this.ActualVerticalAlignment);

        if (this.state.Overlaps)
            cls += `${CSSClasses.Overlaps} `;

        if (!this.IsEnabled)
            cls += `${CSSClasses.Disabled} `;

        if (this.VisibleOnParentHover)
            cls += `${CSSClasses.VisibleOnParentHover}`;

        return cls;
    }

    public static GetClassForVerticalAlignment(va?: VerticalAlignment)
    {
        switch (va)
        {
            case VerticalAlignment.Center:
                return `${CSSClasses.VACenter} `;
            case VerticalAlignment.Top:
                return `${CSSClasses.VATop} `;
            case VerticalAlignment.Bottom:
                return `${CSSClasses.VABottom} `;
            case VerticalAlignment.Stretch:
            case undefined:
                return `${CSSClasses.VAStretch} `;
        }
    }

    private ApplyStyle(lateBound?: boolean)
    {
        var style = (this.Style ||
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
        if (lateBound)
            this.InvalidateRender();
    }

    private SetContainer(container: HTMLElement | SVGSVGElement | null)
    {
        if (this._container === container)
            return;
        if (this._container)
            (this._container as any).AMXInstance = undefined;
        this._container = container;
        if (container)
            (container as any).AMXInstance = this;
        if (this._container && this.ObserveResize)
        {
            this.SetupResizeObserver();
        }
        else if (this._resizeObserver)
        {
            this.DisconnectResizeObserver();
        }
    }

    PropertyChanged: AM.Event<PropertyChangedEventArgs> = new AM.Event<PropertyChangedEventArgs>();

    //#region "Manipulation Gestures"

    private _manipulationHelper;
    private get ManipulationHelper(): ManipulationHelper
    {
        return this._manipulationHelper || (this._manipulationHelper =
            new ManipulationHelper(this));
    }

    private OnPointerDown(event: React.PointerEvent): void
    {
        FrameworkElement.LastMouseEvent = new Point(event.pageX, event.pageY);
        this.state.OnPointerDown?.call(this, event.nativeEvent, this);
        if (this.IsMouseManipulationEnabled || this.IsTouchManipulationEnabled)
            this.ManipulationHelper.OnPointerDown(event);
    }

    private OnHandleTouchMove(event: React.TouchEvent): void
    {
        if (!this.IsTouchManipulationEnabled)
            return;
        this.ManipulationHelper.OnTouchMove(event);
    }

    private OnHandleTouchEnd(event: React.TouchEvent): void
    {
        if (!this.IsTouchManipulationEnabled)
            return;
        this.ManipulationHelper.OnTouchEnd(event);
    }

    private OnHandleTouchStart(event: React.TouchEvent): void
    {
        if (!this.IsTouchManipulationEnabled)
            return;
        this.ManipulationHelper.OnTouchBegin(event);
    }

    private OnHandlePointerMove(event: React.PointerEvent): void
    {
        this.state.OnPointerMove?.call(this, event.nativeEvent, this);
        if (this.IsMouseManipulationEnabled)
            this.ManipulationHelper.OnPointerMove(event);
    }

    private OnPointerUp(event: React.PointerEvent): void
    {
        FrameworkElement.LastMouseEvent = new Point(event.pageX, event.pageY);
        this.state.OnPointerUp?.call(this, event.nativeEvent, this);
        if (this.IsMouseManipulationEnabled)
            this.ManipulationHelper.OnPointerUp(event);
    }

    private OnPointerLeave(event: React.PointerEvent): void
    {
        this.state.OnPointerLeave?.call(this, event.nativeEvent, this);
        //if (this.IsMouseManipulationEnabled || this.IsTouchManipulationEnabled)
        //    this.ManipulationHelper.OnPointerUp(event);
    }

    private OnPointerCancel(event: React.PointerEvent): void
    {
        this.state.OnPointerCancel?.call(this, event.nativeEvent);
        //if (this.IsMouseManipulationEnabled || this.IsTouchManipulationEnabled)
        //    this.ManipulationHelper.OnPointerUp(event);
    }

    private OnPointerOut(event: React.PointerEvent): void
    {
        this.state.OnPointerOut?.call(this, event.nativeEvent);
        //if (this.IsMouseManipulationEnabled || this.IsTouchManipulationEnabled)
        //    this.ManipulationHelper.OnPointerUp(event);
    }

    //#endregion "Manipulation Gestures"

    // Hideous ridiculous hack necessitated by Javascript stupidity
    // in being unable to allow a base class to reference a subclass
    static RenderContextMenu
        (target: FrameworkElement<IFrameworkElementProps, IFrameworkElementState>,
            commandParameter?: ModelObjectReference): JSX.Element | null
    {
        return null;
    }
}