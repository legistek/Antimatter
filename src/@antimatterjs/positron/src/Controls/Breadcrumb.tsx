import * as React from 'react';
import { Antimatter, BindingParameters, ModelObjectReference } from '@antimatterjs/react';
import { Breadcrumb as FluentBreadcrumb, IBreadcrumbItem, IStyle } from '@fluentui/react';
import { TemplateProp, WebStyle } from '../Style';
import { IItemsControlProps, ItemsControlBase } from './ItemsControl';
import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { FontStyle } from '../Theme';
import { IControlState } from './Control';
import { IFrameworkElementState } from '../FrameworkElement';

class BreadcrumbPanel extends PanelBase<IPanelProps, IPanelState>
{
    private _items: IBreadcrumbItem[] = [];
    
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
                onRenderItem={this.ItemsParent?.ItemTemplate ? customRenderer : undefined}
                styles={
                    {
                        root: {
                            margin: "0px"
                        },
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

        const index: number = (item as any)?.index;
        if (index === undefined)
            return <></>;

        const cmd: ModelObjectReference = this.ItemsParent?.ItemsSource[index];

        return this.ItemsParent?.OnRenderItem(cmd, index) ?? null;
    }

    private ConstructFluentBreadcrumbItems(): void
    {
        this._items = [];

        if (!this.ItemsParent)
            return;

        var items = this.ItemsParent?.ItemsSource;
        if (!items || items.length === 0)
            return;

        let index = 0;
        items.forEach(item =>
        {
            const ref: ModelObjectReference = item as ModelObjectReference;
            if (!ref.IsModelObjectReference)
                return;

            const key: string = ref.Key.toString();
            const textBindingParams: BindingParameters = { Path: "Name", Source: ref };
            const disabledBindingParams: BindingParameters = { Path: "IsEnabled", Source: ref, Converter: (v) => !v };
            const disabled: boolean = this.BindState(disabledBindingParams, `${key}:Disabled`);

            const fluentItem: IBreadcrumbItem = {
                key: ref.Key.toString(),
                text: this.BindState(textBindingParams, `${key}:Name`),
                onClick: disabled ? undefined : (e, i) => this.ExecuteByKey(i?.key),
            };
            (fluentItem as any).index = index++;

            this._items.push(fluentItem);
        });
    }

    private ExecuteByKey(key?: string): void
    {
        const cmd: ModelObjectReference | undefined = this.ItemsParent?.ItemsSource.find(s => s.Handle == key);
        if (!cmd)
            return;
        Antimatter.Server.ExecuteICommand(cmd, null);
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

export class Breadcrumb extends ItemsControlBase<IItemsControlProps, IFrameworkElementState>
{

    public static DefaultBindings = {
        ItemsSource: {
            FallbackValue: [],
            NotifyCollectionChanged: true
        }
    };

    public static DefaultStyle: WebStyle<IItemsControlProps> = new WebStyle<IItemsControlProps>(
        {
            ItemsPanel: BreadcrumbPanel,
            FontFamily: FontStyle.FontFamily,
            FontSize: FontStyle.Medium,
        },
        {
            "@ .ms-Breadcrumb": {
                fontFamily: TemplateProp(nameof<IItemsControlProps>(p => p.FontFamily)),
                color: TemplateProp(nameof<IItemsControlProps>(p => p.Foreground)),                
            },
            "@ .ms-Breadcrumb-item": {
                fontSize: TemplateProp(nameof<IItemsControlProps>(p => p.FontSize)),
            },
            "@ .ms-Breadcrumb-itemLink": {
                fontSize: TemplateProp(nameof<IItemsControlProps>(p => p.FontSize)),
                lineHeight: "unset"
            }
        }
    );
}