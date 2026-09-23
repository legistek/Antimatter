import * as React from 'react';
import { Antimatter, Binding, BindingMode, DataContext, ModelObjectReference, Span, Utilities } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { Panel, IPanelProps, IPanelState, PanelBase } from './Panel';
import { IStackPanelProps, StackPanel, StackPanelBase } from './StackPanel';
import { HorizontalAlignment, Orientation, ScrollBarVisibility } from '../Enums';
import { Style, WebStyle } from '../Style';
import { DataTemplate, FrameworkTemplate, TemplateFunction } from '../FrameworkTemplate';
import { WindowLayoutContext } from './Window';
import { BoundCollection } from '@antimatterjs/react';
import { ThemeLayout } from '../Theme';
import { IVirtualizedPanelProps, VirtualizedPanel, VirtualizedPanelBase } from './VirtualizedPanel';
import { ICollectionUpdate, NotifyCollectionChangedAction } from '@antimatterjs/react/src/ICollectionUpdate';
import { IVirtualizingPanelProps } from './VirtualizingPanel';
import { TypeOfExpression } from 'typescript';

export interface IItemsControlProps extends IControlProps
{
    children?: React.ReactNode;
    ItemsSource?: any[] | Binding,
    ItemTemplate?: DataTemplate|Binding,
    ItemPadding?: string | ThemeLayout,
    ItemsPanel?: Binding | React.ClassType<IPanelProps, Panel, any>,
    ScrollAnchor?: any | Binding,    
    ItemsPanelStyle?: Style<IPanelProps> | Binding,
    ItemSpacing?: string | ThemeLayout,
    ItemVisibilityPath?: string,
    ItemContainerStyle?: Style<IFrameworkElementProps>,
    HorizontalScrollBarVisibility?: ScrollBarVisibility,
    VerticalScrollBarVisibility?: ScrollBarVisibility,
    ItemAsDataContext?: boolean,
    RaiseItemSourceChangeOnCollectionChange?: boolean,
    VirtualizeItems?: boolean | Binding,
    VirtualizingPlaceholderHeight?: number | Binding,
    IsReversed?: boolean | Binding,
    RealizationDelayMs?: number | Binding,
    ItemContainerType?: typeof FrameworkElement,
}

/** Base class for components displaying collections of items. ItemsControl
 * does not render its own items directly but it and its sub-classes
 * handle the control logic. Items are always rendered inside an items panel.  **/
export class ItemsControlBase<
    P extends IItemsControlProps = {},
    S extends IFrameworkElementState = {}>
    extends Control<P, S>
{
    public static readonly PART_ItemsPanel = Antimatter.Identifier("amx-ptn-itemspanel");

    public get ItemVisibilityPath(): string|undefined
    {
        return this.GetValue(nameof(this.props.ItemVisibilityPath));
    }

    public get IsReversed(): boolean
    {
        return this.GetValue(nameof(this.props.IsReversed), false);
    }

    public get ItemAsDataContext(): boolean
    {
        return this.GetValue(nameof(this.props.ItemAsDataContext), true);
    }

    public get VirtualizingPlaceholderHeight(): number|undefined
    {
        return this.GetValue(nameof(this.props.VirtualizingPlaceholderHeight));
    }

    public get VirtualizeItems(): boolean
    {
        return this.GetValue(nameof(this.props.VirtualizeItems), false);
    }

    public get ItemSpacing(): string | undefined
    {
        return this.GetValue(nameof(this.props.ItemSpacing));
    }

    public get RealizationDelayMs(): number
    {
        return this.GetValue(nameof(this.props.RealizationDelayMs), 0);
    }

    public get ItemContainerType(): typeof FrameworkElement | undefined
    {
        return this.GetValue(nameof(this.props.ItemContainerType));
    }

    private _ItemsPanelInstance: PanelBase | undefined | null;
    public get ItemsPanelInstance(): PanelBase | undefined | null
    {
        return this._ItemsPanelInstance;
    }
    public set ItemsPanelInstance(value: PanelBase | undefined | null)
    {
        this._ItemsPanelInstance = value;
        if (this.ScrollAnchor && value)
            this.ScrollToAnchor(false);
    }

    public TryGetItemContainer(index: number): FrameworkElement | undefined
    {
        var ref = this._itemContainers[index];
        if (!ref)
            return undefined;
        return ref.deref();
    }

    protected /*virtual*/ SetItemContainer(index: number, container: FrameworkElement | undefined) : void
    {
        if (container)
            this._itemContainers[index] = new WeakRef<FrameworkElement>(container);
        // Bug 1914 - for some reason container is coming in undefined during a re-render
        // after previously being defined, and then not getting reassigned.
        // If it's truly gone it'll be GCd and the weakref will return undefined,
        // so this shouldn't cause a memory leak or other problems.
        //else
            //this._itemContainers[index] = undefined;
    }

    public get ItemsPanel(): React.ClassType<IPanelProps, Panel, any> | undefined
    {
        return this.GetValue(nameof(this.props.ItemsPanel));
    }

    public get ScrollAnchor(): any
    {
        return this.GetValue(nameof(this.props.ScrollAnchor));
    }

    public get ItemsPanelStyle(): Style<IPanelProps> | undefined
    {
        return this.GetValue(nameof(this.props.ItemsPanelStyle));
    }

    public get ItemContainerStyle(): Style<IFrameworkElementProps> | undefined
    {
        return this.GetValue(nameof(this.props.ItemContainerStyle));
    }

    public get ItemsSource(): any[]
    {
        return this.GetValue(nameof(this.props.ItemsSource), []);
    }

    public get ItemPadding(): string | undefined
    {
        return this.GetValue(nameof(this.props.ItemPadding));
    }

    public get ItemTemplate(): DataTemplate | undefined
    {
        return this.GetValue(nameof(this.props.ItemTemplate));
    }

    public get HorizontalScrollBarVisibility(): ScrollBarVisibility | undefined
    {
        return this.GetValue(nameof(this.props.HorizontalScrollBarVisibility));
    }

    public get VerticalScrollBarVisibility(): ScrollBarVisibility | undefined
    {
        return this.GetValue(nameof(this.props.VerticalScrollBarVisibility));
    }

    public get HorizontalScroll(): boolean
    {
        return this.HorizontalScrollBarVisibility == ScrollBarVisibility.Auto;
    }

    public get VerticalScroll(): boolean
    {
        return this.VerticalScrollBarVisibility == ScrollBarVisibility.Auto;
    }

    public get RaiseItemSourceChangeOnCollectionChange(): boolean
    {
        return this.GetValue(nameof(this.props.RaiseItemSourceChangeOnCollectionChange), false);
    }

    protected /* virtual */ get OverrideItemAlignForScroll()
    {
        return true;
    }

    public /* virtual */ OnRenderItem(item: any, index: number, props?: any): JSX.Element | null
    {
        var templ = this.GetTemplateForItem(item);
        if (!templ)
            return null;

        const containerStyle: Style<IPanelProps> | undefined = this.ItemContainerStyle;
        let itemProps: any = containerStyle ? { Style: containerStyle } : {};

        if (this.HorizontalScroll && this.OverrideItemAlignForScroll)
            itemProps.HorizontalAlignment = HorizontalAlignment.Left;

        if (props)
            Object.assign(itemProps, props);

        if (this.ItemVisibilityPath)
            itemProps.IsVisible = new Binding({
                Source: item,
                Path: this.ItemVisibilityPath
            });

        // (itemProps as any).key = Utilities.SmartGetKey(item);
        (itemProps as any).ref = (r: FrameworkElement) =>
        {
            this.SetItemContainer(index, r);
        }

        if (this.VirtualizeItems)
            (itemProps as any).PlaceholderHeight = this.VirtualizingPlaceholderHeight;

        if (this.ItemAsDataContext)
        {
            return (
                <DataContext Value={item} key={itemProps.key || Utilities.SmartGetKey(item)}>
                    {React.createElement(
                        this.GetContainerForItemOverride(),
                        itemProps,
                        templ(item, index, index === this.ItemsSource.length - 1))}
                </DataContext>
            );
        }
        else
        {
            itemProps.key = itemProps.key || Utilities.SmartGetKey(item);
            return React.createElement(
                this.GetContainerForItemOverride(),
                itemProps,
                templ(item, index, index === this.ItemsSource.length - 1));
        }
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
                            var props = {
                                Class: ItemsControl.PART_ItemsPanel,
                                Style: this.ItemsPanelStyle,
                                Padding: this.Padding,
                                HorizontalScrollBarVisibility: this.HorizontalScrollBarVisibility,
                                VerticalScrollBarVisibility: this.VerticalScrollBarVisibility,
                                Background: this.Background,
                                BorderThickness: this.BorderThickness,
                                BorderBrush: this.BorderBrush,
                                ItemsParent: this,
                                ItemSpacing: this.ItemSpacing,
                            } as IPanelProps;
                            (props as IVirtualizingPanelProps).RealizationDelayMs = this.RealizationDelayMs;                            
                            return React.createElement(
                                (this.ItemsPanel || StackPanel),
                                props);
                        }
                    }
                </WindowLayoutContext.Consumer>);
        }
    }

    /**
     * Subclasses can override this to further customize the ItemsPanel
     * based on dynamic properties rather than a single static style.
     * @param props The current props for the ItemsPanel
     */
    protected /* virtual */ OnRenderItemsPanel(props: IPanelProps)
    {
    }

    public override async OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        super.OnBoundPropertyUpdate(property, value, oldValue);
        if (property === nameof(this.ItemsSource))
        {
            if (oldValue?.IsBoundCollection)
                (oldValue as BoundCollection<any>).CollectionChanged.unsubscribe(this.Callback(this.OnItemsSourceCollectionChanged));

            if (value?.IsBoundCollection)
                (value as BoundCollection<any>).CollectionChanged.subscribe(this.Callback(this.OnItemsSourceCollectionChanged));

            this._itemContainers = new Array((value as any[])?.length || 0);
            this.OnItemsSourceCollectionChanged(this, {
                Action: NotifyCollectionChangedAction.Reset
            });

            if (value?.length > 0 || oldValue?.length > 0)                
            {
                this.InvalidateRender(true);
            }            
        }
        else if (property == nameof(this.ScrollAnchor))
        {
            if (!value)
                return;
            await this.ScrollToAnchor(true);
        }
    }

    private async ScrollToAnchor(animate: boolean): Promise<void>
    {
        if (!this.ItemsPanelInstance || !this.ScrollAnchor)
            return;
        var anchor = this.ScrollAnchor;
        var succeeded = await this.ItemsPanelInstance.ScrollTo(anchor, true, animate);
        if (!succeeded)
        {
            // Try again in case this was a newly added item that hasn't
            // been instantiated yet.
            await Utilities.SleepAsync(33);
            await this.ItemsPanelInstance.ScrollTo(anchor, true, animate);
        }
    }

    public OnItemsRendered(items: Span)
    {
        this.OnItemsRenderedOverride(items);
    }

    protected /* virtual */ OnItemsRenderedOverride(items: Span)
    {
    }

    protected /* virtual */ OnItemsSourceCollectionChanged(sender: any, e: ICollectionUpdate)
    {
        if (this.RaiseItemSourceChangeOnCollectionChange)
            this.SetValue(nameof(this.props.ItemsSource), this.ItemsSource, false, false, true);

        this.ItemsPanelInstance?.OnItemsSourceCollectionChanged(e);
        //this.InvalidateRender(e.Action === NotifyCollectionChangedAction.Reset);
    };

    /* override */ OnInvalidateRender(forceCascade: boolean): void
    {
        this.ItemsPanelInstance?.InvalidateRender(forceCascade);
        super.OnInvalidateRender(forceCascade);
    }

    protected /* virtual */ GetContainerForItemOverride(): typeof FrameworkElement
    {
        if (this.ItemContainerType)
            return this.ItemContainerType;

        if (this.VirtualizeItems)
            return VirtualizedPanelBase;
        
        return PanelBase;
    }

    public /* virtual */ GetTemplateForItem(item?: any): TemplateFunction
    {
        if (this.ItemTemplate)
            return FrameworkTemplate.GetRenderer(this.ItemTemplate, this.Layout);
        else
            return ItemsControl.GetDefaultTemplateForItem(item);
    }

    static GetDefaultTemplateForItem(item?: any): (item?: any) => JSX.Element
    {
        return (i?: any) => (
            <>
                {i?.IsModelObjectReference ? (i as ModelObjectReference).Key : i?.toString()}
            </>);
    }

    private _itemContainers: (WeakRef<FrameworkElement>|undefined)[] = [];
}

export class ItemsControl extends ItemsControlBase<IItemsControlProps, IFrameworkElementState>
{
}