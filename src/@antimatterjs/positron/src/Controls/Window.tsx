import * as React from 'react';
import { Route } from 'react-router-dom'

import { Antimatter, Binding, Event, ModelObjectReference, ReactDataContext, Point, Utilities, HostPlatform, PropertyChangedEventArgs, AppHistory, ToAppRoute, ToAbsoluteRoute } from '@antimatterjs/react';
import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { HorizontalAlignment, VerticalAlignment, WindowLayout } from '../Enums';
import { ItemsControl } from './ItemsControl';
import { DataTemplate } from '../FrameworkTemplate';
import { RouteEventArgs } from '../RouteEventArgs';
import { CSSClasses } from '../CSSClasses';
import { ToastControl } from './ToastControl';
import { MultitouchTransform } from '../Media/MultitouchTransform';
import { ContentPresenter } from './ContentPresenter';
import { FrameworkElement, IFrameworkElementState } from '../FrameworkElement';
import { DragDropPanel } from './DragPanel';
import { DragGhost } from './Primitives/DragGhost';
import { Application } from '../Application';

export const WindowLayoutContext = React.createContext<WindowLayout>(WindowLayout.Default);

export type StringDictionary =
    {
        [key: string]: string
    };

export interface IWindowProps extends IPanelProps
{
    Title?: string | Binding,
    FavIcon?: string | Binding,
    Model?: ModelObjectReference,
    Dialogs?: ModelObjectReference[] | Binding;
    Toasts?: ModelObjectReference[] | Binding;
    DialogTemplate?: DataTemplate;
    ToastTemplate?: DataTemplate;
    Layout?: WindowLayout;
    LinkClickedCommand?: ModelObjectReference | Binding;
    AllowSystemContextMenu?: boolean | Binding;
}

export interface IWindowState extends IFrameworkElementState
{
    Model?: ModelObjectReference,
    Dialogs?: ModelObjectReference[];
    Toasts?: ModelObjectReference[];
    DialogTemplate?: DataTemplate;
    ToastTemplate?: DataTemplate;
    Layout?: WindowLayout;
}

export function StringResource(key: string, plural: boolean = false): string
{
    if (plural)
        key += ".Plural";
    return Application.Strings[key] || key;
}

export class Window extends PanelBase<IWindowProps, IWindowState>
{
    private _prefersTouch: boolean = false;
    public get PrefersTouch(): boolean
    {
        return this._prefersTouch;
    }
    public set PrefersTouch(value: boolean)
    {
        if (this._prefersTouch === value)
            return;
        this._prefersTouch = value;
        this.PropertyChanged?.invoke(this, new PropertyChangedEventArgs(nameof(this.PrefersTouch)));
        this.InvalidateRender();
    }

    public get AllowSystemContextMenu(): boolean
    {
        return this.GetValue(nameof(this.props.AllowSystemContextMenu), false);
    }

    public get LinkClickedCommand(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.LinkClickedCommand));
    }

    public get Title(): string | undefined
    {
        return this.GetValue(nameof(this.props.Title));
    }

    public get FavIcon(): string | undefined
    {
        return this.GetValue(nameof(this.props.FavIcon));
    }

    public get WindowLayout(): WindowLayout
    {
        return this.GetValue(nameof(this.WindowLayout), WindowLayout.Default);
    }

    public get DragGhost(): DragGhost | null
    {
        return this._ghost;
    }

    public get IsDragging(): boolean
    {
        return this._isDragging;
    }

    public get DragContent(): any
    {
        return this._dragContent;
    }
    
    constructor(props)
    {
        super(props);
        Antimatter._client.RegisterRoot(this);

        this.SetValue(nameof(this.state.HorizontalAlignment), HorizontalAlignment.Stretch, false);
        this.SetValue(nameof(this.state.VerticalAlignment), VerticalAlignment.Stretch, false);
        this.SetValue(nameof(this.state.Layout), this.GetLayout(), false);

        window.onresize = () =>
        {
            var layout = this.GetLayout();
            if (layout !== this.state.Layout)
            {
                this.state[nameof(this.props.Layout)] = layout;
                Antimatter._client.InvalidateRender(this, false);                
            }
        };

        //if (!Antimatter.Debug)
        {
            window.oncontextmenu = (e) =>
            {
                if (!this.AllowSystemContextMenu)
                    e.preventDefault();
            };
        }

        // Prevents moronic systems like iOS from doing moronic
        // things like zooming in the screen on double taps
        // Also allows us to intercept URL clicks
        document.addEventListener("click", (e) =>
        {
            var elem = e.target as HTMLElement;
            var anchor = elem.closest('a');
            if (anchor)
            {
                this.ExecuteCommand(
                    this.LinkClickedCommand,
                    anchor.href);               
            }
            
            if (e.isTrusted)
                e.preventDefault();
        });

        // Allows model to advise whether to warn before window close
        window.onbeforeunload = (e: BeforeUnloadEvent) =>
        {
            var warn = Antimatter.Server.InvokeBeforeClose();
            if (warn)
            {
                e.preventDefault();
                return 'You may have unsaved changes. Are you sure you want to leave this site?';
            }
        };

        Window._router = AppHistory;
        if (location.href && document.head.baseURI)
            FrameworkElement._route = location.href.substring(document.head.baseURI.length - 1);
        else
            FrameworkElement._route = location.pathname;

        // history v5 (what react-router 6/7 is built on) passes ONE argument -
        // an update object - where v4 passed (location, action) separately.
        AppHistory.listen(({ location, action }) =>
        {
            // AppHistory reports REAL URLs (/v4/...); routes are app-relative.
            const route = ToAppRoute(location.pathname) + location.search;
            FrameworkElement._route = route;
            Window.RouteEvent.invoke(this, new RouteEventArgs(action as any, route));
        });
    }

    public static ForcePopRoute()
    {
        Window.RouteEvent.invoke(
            Application.CurrentWindow,
            new RouteEventArgs('POP', FrameworkElement._route));
    }

    public static CombineRoute(components: string[]): string
    {
        if (!components || components.length === 0)
            return '/';
        let route: string = '';

        for (let j = 0; j < components.length; j++)
        {
            var component = components[j];
            if (!component || component.length === 0 || component === '/')
                continue;
            else if (!component.startsWith('/'))
                component = '/' + component;
            route += component;
        }
        return route;
    }

    public static PushRoute(...components: string[])
    {
        Window._router.push(ToAbsoluteRoute(Window.CombineRoute(components)));
    }

    public static GoBack(): void
    {
        // history v5 renamed goBack() to back().
        Window._router.back();
    }

    public static readonly RouteEvent: Event<RouteEventArgs> = new Event<RouteEventArgs>();

    public BeginDrag(data: any, template: DataTemplate, startingPoint: Point)
    {
        this._isDragging = true;
        this._dragTemplate = template;
        this._dragContent = data;
        this._dragGhostTransform.Translate(startingPoint);

        if (this._dragContent instanceof ModelObjectReference)
            this._dragContent.AddRef();

        this.InvalidateRender();
    }

    override constructClasses(): string
    {
        return super.constructClasses()
            + `${CSSClasses.Root} `
            + (this.GetLayout() === WindowLayout.Tablet
                ? `${CSSClasses.Tablet} `
                : `${CSSClasses.Landscape} `)
            + this.GetHostPlatformClass()
            + (this.PrefersTouch ? ` ${CSSClasses.PrefersTouch} ` : '')
            + (this._isDragging ? 'is-dragging ' : '');
    }

    private GetHostPlatformClass(): string
    {
        var platform = Utilities.BestGuessPlatform();
        if (platform === HostPlatform.iOS)
            // For now iOS is the only one we have to treat special, 
            // because Apple is sooooo cool
            return CSSClasses.iOS;
        else
            return "";
    }

    protected override renderElement(): JSX.Element | null
    {
        (this.state as any)["DataContext"] = this.state.Model;
        return (
            <ReactDataContext.Provider value={this.state.Model}>
                <WindowLayoutContext.Provider value={this.state.Layout || WindowLayout.Default}>
                    <ItemsControl
                        ItemsSource={this.state.Dialogs || []}
                        VerticalAlignment={VerticalAlignment.Bottom}
                        Overlaps={true}
                        ItemTemplate={this.state.DialogTemplate}>
                    </ItemsControl>
                    {super.renderElement()}
                    <ToastControl
                        ItemsSource={this.state.Toasts}
                        ItemTemplate={this.state.ToastTemplate}
                        VerticalAlignment={VerticalAlignment.Bottom}
                        HorizontalAlignment={HorizontalAlignment.Center}
                        Overlaps={true} />
                    <DragGhost
                        ref={r => { this._ghost = r; } }
                        Overlaps={true}
                        IsHitTestVisible={false}
                        IsVisible={this._isDragging}
                        Content={this._dragContent}
                        ContentTemplate={this._dragTemplate}
                        TransformControls={this._dragGhostTransform} />
                </WindowLayoutContext.Provider>
            </ReactDataContext.Provider>
        );
    }

    OverrideContainerAttributes(containerProps: React.HTMLAttributes<HTMLElement> & React.ClassAttributes<HTMLElement>)
    {
        containerProps.onPointerMove = e =>
        {
            this.PrefersTouch =
                // Show touchscreen controls when they use touch OR pen. Use of
                // pen implies they will want to use touch too.
                (e.pointerType === "touch" || e.pointerType === "pen");
            FrameworkElement.LastMouseEvent = {
                X: e.clientX,
                Y: e.clientY
            };
        };
        containerProps.onPointerDown = e =>
        {
            Antimatter.Server.OnUserActivity();
            this.PrefersTouch =
                (e.pointerType === "touch");
            FrameworkElement.LastMouseEvent = {
                X: e.clientX,
                Y: e.clientY
            };
        };
        containerProps.onDragEnter = e =>
        {
            this._isDragging = true;
            e.dataTransfer.dropEffect = 'none';
            e.stopPropagation();
            this._dragContent = e.dataTransfer.files;
            e.preventDefault();
        };
        containerProps.onDragOver = e =>
        {
            e.dataTransfer.dropEffect = 'none';
            e.stopPropagation();
            e.preventDefault();
        };
        containerProps.onDragLeave = e =>
        {
            this._isDragging = false;
            this._dragContent = undefined;
        }
        //containerProps.onMouseMove = ((e: React.MouseEvent) =>
        //{
        //    if (!this._isDragging)
        //        return;
        //    this._dragGhostTransform.Translate({ X: e.clientX, Y: e.clientY });            
        //}).bind(this);
        //containerProps.onMouseUp = ((e: React.MouseEvent) =>
        //{
        //    this._isDragging = false;
        //    this.InvalidateRender();
        //});
    }

    override OnComponentMount()
    {
        Application.RegisterWindow(this);

        // Prevent accidental magnification
        this.Container?.addEventListener("wheel", (e) =>
        {
            Antimatter.Server.OnUserActivity();
            if (!(e as WheelEvent).ctrlKey)
                return;
            e.preventDefault();
        });
        this.Container?.addEventListener("keydown", ((e) =>
        {
            Antimatter.Server.OnUserActivity();
            var ev = e as KeyboardEvent;
            if (ev.key === 'Escape' && this._isDragging)
            {
                this._isDragging = false;
                if (this._dragContent instanceof ModelObjectReference)
                    this._dragContent.ReleaseRef();
                this.InvalidateRender();
                var panel = Application.CurrentDropPanel;
                panel?.CancelDrag();
            }
        }).bind(this));

        document.addEventListener("mousemove", (e) =>
        {
            if (!this._isDragging)
                return;
            this._dragGhostTransform.Translate({ X: e.clientX, Y: e.clientY });
        }, true);
        document.addEventListener("mouseup", (e) =>
        {
            if (this._isDragging)
            {
                this._isDragging = false;
                if (this._dragContent instanceof ModelObjectReference)
                    this._dragContent.ReleaseRef();
            }
            this.InvalidateRender();
        }, true);
    }

    public override OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        super.OnBoundPropertyUpdate(property, value, oldValue);

        if (property === nameof(this.props.Title))
            document.title = value;
        else if (property === nameof(this.props.FavIcon))
        {
            var link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
            if (!link)
                return;
            link.href = value;
        }
    }

    protected /* virtual */ GetLayout(): WindowLayout
    {
        var portrait = window.innerWidth < window.innerHeight;
        if (portrait)
            return WindowLayout.Tablet;
        else
            return WindowLayout.Default;
    }

    private static _router: any;

    private _ghost: DragGhost | null = null;
    private _dragContent: any;
    private _dragTemplate?: DataTemplate;
    private _isDragging: boolean = false;
    private _dragGhostTransform: MultitouchTransform = new MultitouchTransform();
}