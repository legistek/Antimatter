import * as React from 'react';
import { Binding } from '@antimatterjs/react';

import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { ScrollBarVisibility } from '../Enums';

export interface IPanelProps extends IFrameworkElementProps
{
    Background?: string|Binding,
    BorderBrush?: string|Binding,
    BorderThickness?: string | Binding,
    Foreground?: string | Binding,
    Padding?: string,
    BoxShadow?: string,
    ItemsParent?: ItemsControl<IItemsControlProps, IItemsControlState>,
    HorizontalScrollBarVisibility?: ScrollBarVisibility,
    VerticalScrollBarVisibility?: ScrollBarVisibility
}

export interface IPanelState extends IFrameworkElementState
{
    Background?: string,
    BorderBrush?: string,
    BorderThickness?: string,
    Foreground?: string,
    Padding?: string,
    BoxShadow?: string,
    ItemsParent?: ItemsControl<IItemsControlProps, IItemsControlState>,
    HorizontalScrollBarVisibility?: ScrollBarVisibility,
    VerticalScrollBarVisibility?: ScrollBarVisibility
}

export class PanelBase<P extends IPanelProps = {}, S extends IPanelState = {}> extends FrameworkElement<P, S>
{
    constructor(props: IPanelProps)
    {        
        super(props);
        if (props.ItemsParent)        
            props.ItemsParent.ItemsPanelInstance = this;
    }

    /* override */ getCSSStyles() : React.CSSProperties
    {
        var styles = {
            color: this.state.Foreground,
            background: this.state.Background,
            borderColor: this.state.BorderBrush,
            borderWidth: this.state.BorderThickness,
            borderStyle: "solid",
            boxShadow: this.state.BoxShadow,
            padding: this.state.Padding,
            overflowX: Panel.GetScrollBarVisibilityCSSValue(this.state.HorizontalScrollBarVisibility),
            overflowY: Panel.GetScrollBarVisibilityCSSValue(this.state.VerticalScrollBarVisibility)            
        };
        return Object.assign(super.getCSSStyles(), styles);
    }

    /* override */ constructClasses() : string
    {
        return "amx-ptn-panel " + super.constructClasses();
    }

    /* override */ renderElement(): JSX.Element | null
    {
        return (<>{this.props.children}</>);
    }

    public /* virtual */ OnItemSourceChange()
    {
        this.InvalidateRender();
    }

    static GetScrollBarVisibilityCSSValue(v?: ScrollBarVisibility): "auto" | "hidden" | "scroll" 
    {
        switch (v)
        {            
            case undefined:
            case ScrollBarVisibility.Hidden:
                return "hidden";
            case ScrollBarVisibility.Visible:
                return "scroll";
            case ScrollBarVisibility.Auto:
            default:
                return "auto";
        }
    }
}

export class Panel extends PanelBase<IPanelProps, IPanelState>
{
}