import * as React from 'react';
import { Binding } from '@antimatterjs/react';

import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { IItemsControlProps, IItemsControlState, ItemsControl, ItemsControlBase } from './ItemsControl';
import { ScrollBarVisibility } from '../Enums';
import { CSSClasses } from '../CSSClasses';
import { ThemeColor, SemanticColor } from '../Theme';

export interface IPanelProps extends IFrameworkElementProps
{
    Width?: number | string | Binding,
    Height?: number | string | Binding,
    MinWidth?: number,
    MinHeight?: number,
    Background?: string | Binding | ThemeColor | SemanticColor,
    BorderBrush?: string | Binding | ThemeColor | SemanticColor,
    BorderThickness?: string | Binding,
    Foreground?: string | Binding | ThemeColor | SemanticColor,
    Padding?: string,
    BoxShadow?: string,
    ItemsParent?: ItemsControlBase<IItemsControlProps, IItemsControlState>,
    HorizontalScrollBarVisibility?: ScrollBarVisibility,
    VerticalScrollBarVisibility?: ScrollBarVisibility
}

export interface IPanelState extends IFrameworkElementState
{
    Width?: number | string,
    Height?: number | string,
    MinWidth?: number,
    MinHeight?: number,
    //Background?: string,
    //BorderBrush?: string,
    //BorderThickness?: string,
    //Foreground?: string,
    Padding?: string,
    BoxShadow?: string,
    ItemsParent?: ItemsControlBase<IItemsControlProps, IItemsControlState>,
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

    public get Background(): string | undefined
    {
        return this.GetValue(nameof(this.props.Background));
    }

    public get BorderBrush(): string | undefined
    {
        return this.GetValue(nameof(this.props.BorderBrush));
    }

    public get BorderThickness(): string | undefined
    {
        return this.GetValue(nameof(this.props.BorderThickness));
    }

    public get Foreground(): string | undefined
    {
        return this.GetValue(nameof(this.props.Foreground));
    }

    /* override */ getCSSStyles() : React.CSSProperties
    {
        var styles = {
            width: this.state.Width,
            height: this.state.Height,
            minWidth: this.state.MinWidth,
            minHeight: this.state.MinHeight,
            color: this.Foreground,
            background:  this.Background,
            borderColor: this.BorderBrush,
            borderWidth: this.BorderThickness,
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
        return `${CSSClasses.Panel} ` +
            ((this.state.HorizontalScrollBarVisibility && this.state.HorizontalScrollBarVisibility !== ScrollBarVisibility.Hidden)
                ? `${CSSClasses.HScroll} ` : "") +
            ((this.state.VerticalScrollBarVisibility && this.state.VerticalScrollBarVisibility !== ScrollBarVisibility.Hidden)
                ? `${CSSClasses.VScroll} ` : "") +
            super.constructClasses();
    }

    protected /* override */ renderElement(): JSX.Element | null
    {
        return (<>{this.props.children}</>);
    }

    public /* virtual */ OnItemSourceChange()
    {
        this.InvalidateRender();
    }

    static GetScrollBarVisibilityCSSValue(v?: ScrollBarVisibility): "auto" | "hidden" | "scroll" | undefined
    {
        switch (v)
        {            
            case undefined:
                return undefined;
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