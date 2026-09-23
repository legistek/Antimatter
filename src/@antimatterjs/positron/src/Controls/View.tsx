import * as React from 'react';
import { Binding, ModelObjectReference, ReactDataContext } from '@antimatterjs/react';
import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { IFrameworkElementState } from '../FrameworkElement';
import { WindowLayout } from '../Enums';
import { WindowLayoutContext } from './Window';

export interface IViewProps extends IPanelProps
{
    ViewModel?: ModelObjectReference | Binding,
    ClickCommand?: ModelObjectReference | Binding,
    ClickCommandParameter?: ModelObjectReference | Binding,

    // Up to the individual View whether to honor this, but
    // no point in replicating the same property every time.
    DarkMode?: boolean | Binding;
}

export abstract class ViewBase<P extends IViewProps = {}>
    extends PanelBase<P, IFrameworkElementState>
{
    /* protected */ abstract View(): JSX.Element;

    constructor(props)
    {
        super(props);
        this.OnClick = this.OnClick.bind(this);
    }

    public get Layout(): WindowLayout
    {
        return this.GetValue(nameof(this.Layout), WindowLayout.Default);
    }

    public get DarkMode(): boolean
    {
        return this.GetValue(nameof(this.props.DarkMode), false);
    }

    public get IsPortrait(): boolean
    {
        return this.Layout === WindowLayout.Tablet;
    }

    public get ViewModel(): any
    {
        return this.GetValue(nameof(this.props.ViewModel));
    }

    protected override OnContainerMounted(container: HTMLElement)
    {
        container.addEventListener("click", this.OnClick);
    }

    private OnClick(e: MouseEvent): void
    {
        this.ExecuteCommand(this.ClickCommand, this.ClickCommandParameter);
    }

    public get ClickCommand(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.ClickCommand));
    }

    public get ClickCommandParameter(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.ClickCommandParameter));
    }


    protected override getCSSStyles(): React.CSSProperties
    {
        var st = super.getCSSStyles();
        if (!this.IsEnabled)
            st.opacity = 0.5;
        return st;
    }

    readonly renderElement = (): JSX.Element =>
    {
        if (this.props.ViewModel)
        {
            (this.state as any)["DataContext"] = this.ViewModel;
            return (
                <ReactDataContext.Provider value={this.ViewModel}>
                    <WindowLayoutContext.Consumer>
                        {(layout) =>
                        {
                            this.SetValue(nameof(this.Layout), layout, false);
                            return this.View();
                        }
                    }
                    </WindowLayoutContext.Consumer>
                </ReactDataContext.Provider>
            );
        }
        else
        {
            return (                
                <WindowLayoutContext.Consumer>
                    {(layout) =>
                    {
                        this.SetValue(nameof(this.Layout), layout, false);
                        return this.View();
                    }}
                </WindowLayoutContext.Consumer>                
            );
        }
    };
}

export abstract class View extends ViewBase<IViewProps>
{
}

export abstract class View2<T> extends ViewBase<IViewProps>
{
    protected Model: T = {} as any;
}