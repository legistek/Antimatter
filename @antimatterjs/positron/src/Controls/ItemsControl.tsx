import * as React from 'react';
import { Binding, DataContext, ModelObjectReference } from '@antimatterjs/react';

import { Control, IControlProps, IControlState } from './Control';
import { FrameworkElement, IFrameworkElementProps } from '../FrameworkElement';
import { Panel, IPanelProps } from './Panel';
import { StackPanel } from './StackPanel';
import { ScrollBarVisibility } from '../Enums';
import { Style } from '../Style';

export interface IItemsControlProps extends IControlProps
{
    ItemsSource?: any[] | Binding,
    ItemTemplate?: (item?: any) => JSX.Element,
    ItemsPanel?: React.ClassType<IPanelProps, Panel, any>,
    ItemContainerStyle?: Style<IFrameworkElementProps>
}

export interface IItemsControlState extends IControlState
{
    ItemsSource?: any[],
    ItemTemplate?: (item?: any) => JSX.Element,
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

        return (
            <DataContext Value={item}>
                {React.createElement(
                    this.GetContainerForItemOverride(),
                    itemProps,
                    templ(item))}
            </DataContext>);        
    }

    public /* override */ renderElement(): JSX.Element
    {
        return React.createElement(
            (this.state.ItemsPanel || StackPanel),
            {
                BorderThickness: this.state.BorderThickness,
                BorderBrush: this.state.BorderBrush,
                ItemsParent: this,
                VerticalScrollBarVisibility: ScrollBarVisibility.Auto
            } as IPanelProps);
    }

    /* override */ OnPropertyChanged(property: string, value: any)
    {
        if (property === nameof(this.state.ItemsSource))
            this.ItemsPanelInstance?.InvalidateRender();
        super.OnPropertyChanged(property, value);
    }

    /* override */ OnInvalidateRender(): void
    {
        this.ItemsPanelInstance?.InvalidateRender();
        super.OnInvalidateRender();
    }

    /* virtual */ GetContainerForItemOverride(): typeof FrameworkElement
    {
        return StackPanel;
    }

    GetTemplateForItem(item?: any): (item?: any) => JSX.Element
    {
        if (this.props.ItemTemplate)
            return this.props.ItemTemplate as (item?: any) => JSX.Element;
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
