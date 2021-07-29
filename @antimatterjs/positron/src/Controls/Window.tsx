import * as React from 'react';
import { Antimatter, Binding, ModelObjectReference } from '@antimatterjs/react';

import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { HorizontalAlignment, VerticalAlignment, WindowLayout } from '../Enums';
import { ItemsControl } from './ItemsControl';
import { DialogBox } from './DialogBox';
import { DataTemplate } from '../FrameworkTemplate';

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

export class Window<P extends IWindowProps = {}, S extends IWindowState = {}> extends PanelBase<IWindowProps, IWindowState>
{
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
    }

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