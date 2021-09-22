import * as React from 'react';
import { withRouter, Route } from 'react-router-dom'

import { Antimatter, Binding, Event, ModelObjectReference, ReactDataContext } from '@antimatterjs/react';
import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { HorizontalAlignment, VerticalAlignment, WindowLayout } from '../Enums';
import { ItemsControl } from './ItemsControl';
import { DataTemplate } from '../FrameworkTemplate';
import { RouteEventArgs } from '../RouteEventArgs';
import { CSSClasses } from '../CSSClasses';
import { Theme } from '../Theme';
import { PositronTheme } from '../Themes/PositronTheme';
import { ToastControl } from './ToastControl';

export const WindowLayoutContext = React.createContext<WindowLayout>(WindowLayout.Default);

export interface IWindowProps extends IPanelProps
{
    Model?: ModelObjectReference,
    Dialogs?: ModelObjectReference[] | Binding;
    Toasts?: ModelObjectReference[] | Binding;
    DialogTemplate?: DataTemplate;
    ToastTemplate?: DataTemplate;    
    Layout?: WindowLayout;
}

export interface IWindowState extends IPanelState
{
    Model?: ModelObjectReference,
    Dialogs?: ModelObjectReference[];
    Toasts?: ModelObjectReference[];
    DialogTemplate?: DataTemplate;
    ToastTemplate?: DataTemplate;
    Layout?: WindowLayout;
    Theme?: Theme;
}

@withRouter
export class Window<P extends IWindowProps = {}, S extends IWindowState = {}> extends PanelBase<IWindowProps, IWindowState>
{
    private static _router: any;

    private static _route: string = "/";
    public static get Route(): string
    {
        return Window._route;
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

    /* override */ constructClasses() : string
    {
        return super.constructClasses() + `${CSSClasses.Root} `;
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
                        Overlaps={true}
                    />
                </WindowLayoutContext.Provider>
            </ReactDataContext.Provider>
        );
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
}