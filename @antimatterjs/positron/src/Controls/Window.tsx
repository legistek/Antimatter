import * as React from 'react';
import { withRouter } from 'react-router';

import { Route } from 'react-router-dom'

import { Antimatter, Binding, Event, ModelObjectReference } from '@antimatterjs/react';

import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { HorizontalAlignment, VerticalAlignment, WindowLayout } from '../Enums';
import { ItemsControl } from './ItemsControl';
import { DialogBox } from './DialogBox';
import { DataTemplate } from '../FrameworkTemplate';
import { RouteEventArgs } from '../RouteEventArgs';

export const WindowLayoutContext = React.createContext<WindowLayout>(WindowLayout.Default);

export interface IWindowProps extends IPanelProps
{
    Dialogs?: ModelObjectReference[] | Binding;
    Layout?: WindowLayout;
}

export interface IWindowState extends IPanelState
{
    Dialogs?: ModelObjectReference[];
    Layout?: WindowLayout;
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
        (this.state as any)["HorizontalAlignment"] = HorizontalAlignment.Stretch;
        (this.state as any)["VerticalAlignment"] = VerticalAlignment.Stretch;
        (this.state as any)["Layout"] = this.GetLayout();
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
        return super.constructClasses() + "amx-ptn-root ";
    }

    /* override */ renderElement(): JSX.Element | null
    {
        return (
            <WindowLayoutContext.Provider value={this.state.Layout || WindowLayout.Default}>                
                <ItemsControl
                    ItemsSource={this.state.Dialogs || []}
                    VerticalAlignment={VerticalAlignment.Bottom}
                    Overlaps={true}
                    ItemTemplate={this._dialogTemplate}>
                </ItemsControl>
                {super.renderElement()}
            </WindowLayoutContext.Provider>
        );
    }

    /* override */ componentDidMount()
    {
        // Prevent accidental magnification
        this.Container?.addEventListener("wheel", (e) =>
        {
            if (!e.ctrlKey)
                return;
            e.preventDefault();
        });
    }

    /* protected virtual */ GetLayout(): WindowLayout
    {
        if (window.outerWidth < 1024)
            return WindowLayout.Tablet;
        else
            return WindowLayout.Default;
    }

    _dialogTemplate: DataTemplate = new DataTemplate((item) =>
    (
        <DialogBox ViewModel={item} />
    ));
}