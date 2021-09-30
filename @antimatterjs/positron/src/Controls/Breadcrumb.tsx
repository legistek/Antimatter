import * as React from 'react';
import { Antimatter, BindingParameters, ModelObjectReference, ModelValue } from '@antimatterjs/react';
import { Breadcrumb as FluentBreadcrumb, IBreadcrumbItem, IStyle } from '@fluentui/react';
import { TemplateProp, WebStyle } from '../Style';
import { IItemsControlProps, IItemsControlState, ItemsControlBase } from './ItemsControl';
import { IPanelProps, IPanelState, PanelBase } from './Panel';

class BreadcrumbPanel extends PanelBase<IPanelProps, IPanelState>
{
    private _items: IBreadcrumbItem[] = [];
    private get ItemsParent() { return this.state.ItemsParent; }

    private _resizeObserver?: ResizeObserver;

    /* override */ renderElement(): JSX.Element | null
    {
        this.ConstructFluentBreadcrumbItems();

        const customRenderer = (item) => this.customRendererFunction(item);
        const itemStyle: IStyle = {
            fontSize: this.ItemsParent?.FontSize,
            fontWeight: this.ItemsParent?.FontWeight,
            fontFamily: this.ItemsParent?.FontFamily,
            maxWidth: 240,
            textOverflow: 'ellipsis',
            userSelect: 'none'
        }

        const elem: JSX.Element = (
            <FluentBreadcrumb
                items={this._items}
                onRenderItem={this.ItemsParent?.state.ItemTemplate ? customRenderer : undefined}
                styles={
                    {
                        itemLink: itemStyle,
                        item: itemStyle
                    }
                }
            />
        );

        return elem;
    }

    private customRendererFunction(item?: IBreadcrumbItem): JSX.Element | null
    {
        if (!item)
            return <></>;

        const index: number = this.ItemsParent?.ItemsSource.findIndex(s => s.Handle == item.key) ?? -1;
        if (index == -1)
            return <></>;

        const cmd: ModelObjectReference = this.ItemsParent?.ItemsSource[index];

        return this.ItemsParent?.OnRenderItem(cmd, index) ?? null;
    }

    private ConstructFluentBreadcrumbItems(): void
    {
        this._items = [];

        if (!this.ItemsParent)
            return;

        var items = this.ItemsParent?.state.ItemsSource;
        if (!items || items.length === 0)
            return;

        items.forEach(item =>
        {
            const ref: ModelObjectReference = item as ModelObjectReference;
            if (!ref.IsModelObjectReference)
                return;

            const key: string = ref.Handle.toString();
            const textBindingParams: BindingParameters = { Path: "Name", Source: ref };
            const disabledBindingParams: BindingParameters = { Path: "IsEnabled", Source: ref, Converter: (v) => !v };
            const disabled: boolean = this.BindState(disabledBindingParams, `${key}:Disabled`);

            const fluentItem: IBreadcrumbItem = {
                key: ref.Handle.toString(),
                text: this.BindState(textBindingParams, `${key}:Name`),
                onClick: disabled ? undefined : (e, i) => this.ExecuteByKey(i?.key),
            }

            this._items.push(fluentItem);
        });
    }

    private ExecuteByKey(key?: string): void
    {
        const cmd: ModelObjectReference | undefined = this.ItemsParent?.ItemsSource.find(s => s.Handle == key);
        if (!cmd)
            return;
        Antimatter.Server.ExecuteICommand(cmd, ModelValue.Get(null));
    }

    override getCSSStyles()
    {
        var styles = super.getCSSStyles();
        styles.display = "block";
        return styles;
    }

    override OnComponentMount()
    {
        this._resizeObserver = new ResizeObserver((entries) =>
        {
            this.InvalidateRender();
        });
        if (this.Container)
            this._resizeObserver.observe(this.Container)
    }


    override OnComponentWillUnmount()
    {
        this._resizeObserver?.disconnect();
    }
}

export class Breadcrumb extends ItemsControlBase<IItemsControlProps, IItemsControlState>
{

    public static DefaultBindings = {
        ItemsSource: {
            FallbackValue: [],
            NotifyCollectionChanged: true
        }
    };

    public static DefaultStyle: WebStyle<IItemsControlProps> = new WebStyle<IItemsControlProps>(
        {
            ItemsPanel: BreadcrumbPanel
        }
    );
}