import * as React from 'react';
import { withRouter, Route } from 'react-router-dom'

import { Antimatter, Binding, Event, ModelObjectReference, ReactDataContext } from '@antimatterjs/react';
import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { HorizontalAlignment, VerticalAlignment, WindowLayout } from '../Enums';
import { ItemsControl } from './ItemsControl';
import { DataTemplate, DataTemplateValue } from '../FrameworkTemplate';
import { RouteEventArgs } from '../RouteEventArgs';
import { CSSClasses } from '../CSSClasses';
import { Theme } from '../Theme';
import { PositronTheme } from '../Themes/PositronTheme';
import { ToastControl } from './ToastControl';
import { MultitouchTransform } from '../Media/MultitouchTransform';
import { ContentPresenter } from './ContentPresenter';
import { Point } from '../Foundation';
import { FrameworkElement } from '../FrameworkElement';
import { DragPanel } from './DragPanel';
import { DragGhost } from './Primitives/DragGhost';

export const WindowLayoutContext = React.createContext<WindowLayout>(WindowLayout.Default);

export interface IWindowProps extends IPanelProps
{
    Model?: ModelObjectReference,
    Dialogs?: ModelObjectReference[] | Binding;
    Toasts?: ModelObjectReference[] | Binding;
    DialogTemplate?: DataTemplateValue;
    ToastTemplate?: DataTemplateValue;
    Layout?: WindowLayout;
}

export interface IWindowState extends IPanelState
{
    Model?: ModelObjectReference,
    Dialogs?: ModelObjectReference[];
    Toasts?: ModelObjectReference[];
    DialogTemplate?: DataTemplateValue;
    ToastTemplate?: DataTemplateValue;
    Layout?: WindowLayout;
    Theme?: Theme;
}

@withRouter
export class Window<P extends IWindowProps = {}, S extends IWindowState = {}> extends PanelBase<IWindowProps, IWindowState>
{
    public static get Route(): string
    {
        return Window._route;
    }

    public static get CurrentWindow(): Window | undefined
    {
        return this._currentWindow;
    }

    public get DragGhost(): DragGhost|null
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
        this.SetValue(nameof(this.state.Theme), new PositronTheme(), false);

        window.onresize = () =>
        {
            var layout = this.GetLayout();
            if (layout !== this.state.Layout)
                this.setState({
                    Layout: layout
                });
        };

        Window._router = (props as any).history;
        Window._route = location.pathname;        
        (props as any).history.listen((location, action) =>
        {
            Window._route = location.pathname;
            Window.RouteEvent.invoke(this, new RouteEventArgs(action, location.pathname));
        });

        this.OnThemeChange(this.state.Theme);
        Window._currentWindow = this;
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
        Window._router.push(Window.CombineRoute(components));
    }

    public static GoBack(): void
    {
        this._router.goBack();
    }

    public static readonly RouteEvent: Event<RouteEventArgs> = new Event<RouteEventArgs>();

    public BeginDrag(data: any, template: DataTemplateValue, startingPoint: Point)
    {
        this._isDragging = true;
        this._dragTemplate = template;
        this._dragContent = data;
        this._dragGhostTransform.Translate(startingPoint);
        this.InvalidateRender();
    }

    override constructClasses() : string
    {
        let elem: HTMLElement;
        return super.constructClasses()
            + `${CSSClasses.Root} `
            + (this._isDragging ? 'is-dragging ' : '');
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
                        ref={r => this._ghost = r}
                        Overlaps={true}
                        IsHitTestVisible={false}
                        IsVisible={this._isDragging}
                        Content={this._dragContent}
                        ContentTemplate={this._dragTemplate}
                        Transform={this._dragGhostTransform} />
                </WindowLayoutContext.Provider>
            </ReactDataContext.Provider>
        );
    }

    OverrideContainerAttributes(containerProps: React.HTMLAttributes<HTMLElement> & React.ClassAttributes<HTMLElement>)
    {
        containerProps.onDragEnter = e =>
        {
            e.dataTransfer.dropEffect = 'none';
            e.stopPropagation();
            e.preventDefault();
        };
        containerProps.onDragOver = e =>
        {
            e.dataTransfer.dropEffect = 'none';
            e.stopPropagation();
            e.preventDefault();
        };
        containerProps.onMouseMove = ((e: React.MouseEvent) =>
        {
            if (!this._isDragging)
                return;
            this._dragGhostTransform.Translate({ X: e.clientX, Y: e.clientY });
        }).bind(this);
        containerProps.onMouseUp = ((e: React.MouseEvent) =>
        {
            this._isDragging = false;
            this.InvalidateRender();
        });        
    }

    override OnComponentMount()
    {        
        // Prevent accidental magnification
        this.Container?.addEventListener("wheel", (e) =>
        {
            if (!e.ctrlKey)
                return;
            e.preventDefault();
        });
    }

    protected /* virtual */ GetLayout(): WindowLayout
    {
        if (window.outerWidth < 1024)
            return WindowLayout.Tablet;
        else
            return WindowLayout.Default;
    }

    private OnThemeChange(newTheme?: Theme)
    {
        if (!newTheme)
            return;
        newTheme.Apply();
    }

    private static _router: any;
    private static _route: string = "/";
    private static _currentWindow: Window | undefined;

    private _ghost: DragGhost | null = null;
    private _dragContent: any;
    private _dragTemplate?: DataTemplateValue;
    private _isDragging: boolean = false;
    private _dragGhostTransform: MultitouchTransform = new MultitouchTransform();
    private _currentDragTarget?: DragPanel;
}