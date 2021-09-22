import * as React from 'react';
import { Binding, DataContext, ModelObjectReference, ModelValue, Utilities } from '@antimatterjs/react';

import { Control, IControlProps, IControlState } from './Control';
import { FrameworkElement, IFrameworkElementProps } from '../FrameworkElement';
import { Panel, IPanelProps, IPanelState, PanelBase } from './Panel';
import { StackPanel, StackPanelBase } from './StackPanel';
import { ScrollBarVisibility } from '../Enums';
import { Style, WebStyle } from '../Style';
import { DataTemplate } from '../FrameworkTemplate';
import { WindowLayoutContext } from './Window';
import { BoundCollection } from '@antimatterjs/react/src/BoundCollection';

export interface IItemsControlProps extends IControlProps
{
    ItemsSource?: any[] | Binding,
    ItemTemplate?: DataTemplate,
    ItemPadding?: string,
    ItemsPanel?: React.ClassType<IPanelProps, Panel, any>,
    ItemsPanelStyle?: Style<IPanelProps>,
    ItemContainerStyle?: Style<IFrameworkElementProps>,
    HorizontalScrollBarVisibility?: ScrollBarVisibility,
    VerticalScrollBarVisibility?: ScrollBarVisibility
}

export interface IItemsControlState extends IControlState
{
    ItemsSource?: any[],
    ItemTemplate?: DataTemplate,
    ItemsPanel?: React.ClassType<IPanelProps, Panel, any>,
    ItemsPanelStyle?: Style<IPanelProps>,
    ItemContainerStyle?: Style<IFrameworkElementProps>
}

/** Base class for components displaying collections of items. ItemsControl
 * does not render its own items directly but it and its sub-classes
 * handle the control logic. Items are always rendered inside an items panel.  **/
export class ItemsControlBase<
    P extends IItemsControlProps = {},
    S extends IItemsControlState = {}>
    extends Control<P, S>
{
    constructor(props)
    {
        super(props);
    }

    public ItemsPanelInstance: Panel | undefined | null;
    public get ItemContainers(): FrameworkElement[]
    {
        return this._itemContainers;
    }

    public get ItemsSource(): any[]
    {
        return this.GetValue(nameof(this.props.ItemsSource), []);
    }

    public get ItemPadding(): string|undefined
    {
        return this.GetValue(nameof(this.props.ItemPadding));
    }

    public /* virtual */ OnRenderItem(item: any, index: number, props?: any): JSX.Element | null
    {
        var templ = this.GetTemplateForItem(item);
        if (!templ)
            return null;

        var itemProps = this.state.ItemContainerStyle ? { Style: this.state.ItemContainerStyle } : {};
        if (props)
            Object.assign(itemProps, props);

        (itemProps as any).key = Utilities.SmartGetKey(item);
        (itemProps as any).ref = (r: FrameworkElement) =>
            this._itemContainers[index] = r;

        return React.createElement(
            this.GetContainerForItemOverride(),
            itemProps,
            templ(item));
    }

    public /* override */ renderElement(): JSX.Element | null
    {
        if (this.Template)
            return super.renderElement();
        else
        {
            return (
                <WindowLayoutContext.Consumer>
                    {
                        (layout) =>
                        {
                            if (this.Layout !== layout)
                            {
                                this.Layout = layout;
                                this.ItemsPanelInstance?.InvalidateRender();
                            }
                            return React.createElement(
                                (this.state.ItemsPanel || StackPanel),
                                {
                                    Style: this.state.ItemsPanelStyle,
                                    Background: this.Background,
                                    BorderThickness: this.BorderThickness,
                                    BorderBrush: this.BorderBrush,
                                    ItemsParent: this,
                                } as IPanelProps);
                        }
                    }
                </WindowLayoutContext.Consumer>);
        }
    }

    override OnPropertyChanged(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.state.ItemsSource))
        {
            if (oldValue?.IsBoundCollection)
                (oldValue as BoundCollection<any>).CollectionChanged.unsubscribe(this.Callback(this.OnItemsSourceCollectionChanged));

            if (value?.IsBoundCollection)
                (value as BoundCollection<any>).CollectionChanged.subscribe(this.Callback(this.OnItemsSourceCollectionChanged));

            this._itemContainers = new Array((value as any[])?.length || 0);
            this.OnItemsSourceCollectionChanged(this);
        }
        super.OnPropertyChanged(property, value, oldValue);
    }

    protected /* virtual */ OnItemsSourceCollectionChanged (sender: any, e: void)
    {
        this.InvalidateRender();
    };

    /* override */ OnInvalidateRender(): void
    {
        this.ItemsPanelInstance?.InvalidateRender();
        super.OnInvalidateRender();
    }

    /* protected virtual */ GetContainerForItemOverride(): typeof FrameworkElement
    {
        return PanelBase;
    }

    GetTemplateForItem(item?: any): (item?: any) => JSX.Element
    {
        if (this.state.ItemTemplate)
            return this.state.ItemTemplate.GetVisualTree(this.Layout);
        else
            return ItemsControl.GetDefaultTemplateForItem(item);
    }

    static GetDefaultTemplateForItem(item?: any): (item?: any) => JSX.Element
    {
        return (i?: any) => (
            <>
                {i?.IsModelObjectReference ? (i as ModelObjectReference).Handle : i?.toString()}
            </>);
    }

    private _itemContainers: FrameworkElement[] = [];
}

export class ItemsControl extends ItemsControlBase<IItemsControlProps, IItemsControlState>
{
}