import * as React from 'react';
import { Binding, DataContext, ModelObjectReference } from '@antimatterjs/react';

import { Control, IControlProps, IControlState } from './Control';
import { FrameworkElement, IFrameworkElementProps } from '../FrameworkElement';
import { Panel, IPanelProps } from './Panel';
import { StackPanel, StackPanelBase } from './StackPanel';
import { ScrollBarVisibility } from '../Enums';
import { Style } from '../Style';
import { DataTemplate } from '../FrameworkTemplate';
import { WindowLayoutContext } from './Window';

export interface IItemsControlProps extends IControlProps
{
    ItemsSource?: any[] | Binding,
    ItemTemplate?: DataTemplate,
    ItemsPanel?: React.ClassType<IPanelProps, Panel, any>,
    ItemContainerStyle?: Style<IFrameworkElementProps>
}

export interface IItemsControlState extends IControlState
{
    ItemsSource?: any[],
    ItemTemplate?: DataTemplate,
    ItemsPanel?: React.ClassType<IPanelProps, Panel, any>,
    ItemContainerStyle?: Style<IFrameworkElementProps>
}

/** Base class for components displaying collections of items. ItemsControl
 * does not render its own items directly but it and its sub-classes
 * handle the control logic. Items are always rendered inside an items panel.  **/
export class ItemsControl<
    P extends IItemsControlProps = {},
    S extends IItemsControlState = {}>
    extends Control<P, S>
{
    public ItemsPanelInstance: Panel | undefined | null;

    public /* virtual */ OnRenderItem(item: any, props?: any): JSX.Element | null
    {
        var templ = this.GetTemplateForItem(item);
        if (!templ)
            return null;

        var itemProps = this.state.ItemContainerStyle ? { Style: this.state.ItemContainerStyle } : {};
        if (props)
            Object.assign(itemProps, props);

        (itemProps as any).key = item?.IsModelObjectReference
            ? (item as ModelObjectReference).Handle.toString()
            : item?.toString();

        return React.createElement(
            this.GetContainerForItemOverride(),
            itemProps,
            templ(item));       
    }

    public /* override */ renderElement(): JSX.Element | null
    {
        if (this.state.Template)
            return super.renderElement();
        else
        {
            return (
                <WindowLayoutContext.Consumer>
                    {
                        (layout) =>
                        {
                            if (this.state.Layout !== layout)
                            {
                                (this.state as any).Layout = layout;
                                this.ItemsPanelInstance?.InvalidateRender();
                            }
                            return React.createElement(
                                (this.state.ItemsPanel || StackPanel),
                                {
                                    BorderThickness: this.state.BorderThickness,
                                    BorderBrush: this.state.BorderBrush,
                                    ItemsParent: this,
                                    VerticalScrollBarVisibility: ScrollBarVisibility.Auto
                                } as IPanelProps);
                        }
                    }
                </WindowLayoutContext.Consumer>);            
        }
    }

    /* override */ OnPropertyChanged(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.state.ItemsSource))
            this.ItemsPanelInstance?.InvalidateRender();
        super.OnPropertyChanged(property, value, oldValue);
    }

    /* override */ OnInvalidateRender(): void
    {
        this.ItemsPanelInstance?.InvalidateRender();
        super.OnInvalidateRender();
    }

    /* virtual */ GetContainerForItemOverride(): typeof FrameworkElement
    {
        return StackPanelBase;
    }

    GetTemplateForItem(item?: any): (item?: any) => JSX.Element
    {
        if (this.state.ItemTemplate)
            return this.state.ItemTemplate.GetVisualTree(this.state.Layout);
        else
            return ItemsControl.GetDefaultTemplateForItem(item);
    }

    static GetDefaultTemplateForItem(item?: any): (item?: any) => JSX.Element
    {
        return (i?: any) => (
            <>
                {i?.IsModelObjectReference ? (i as ModelObjectReference).Handle : i?.ToString()}
            </>);
    }
}
