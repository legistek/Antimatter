import * as React from 'react';
import { ICollectionUpdate, ModelObjectReference } from '@antimatterjs/react';
import { CommandBar as FluentCommandBar, ICommandBar, ICommandBarItemProps } from '@fluentui/react';

import { Style, TemplateProp, WebStyle } from '../Style';
import { IItemsControlProps, ItemsControl, ItemsControlBase } from './ItemsControl';
import { FrameworkElement, IFrameworkElementState } from '../FrameworkElement';
import { CommandButton, CommandButtonBase, ICommandButtonProps } from './CommandButton';
import { IPanelProps, PanelBase } from './Panel';
import { SemanticColor } from '../Theme';

class CommandBarPanel extends PanelBase<IPanelProps, IFrameworkElementState>
{
    _allCommandItems?: ICommandBarItemProps[];
    _visibleCommandItems?: ICommandBarItemProps[];
    _bar?: ICommandBar | null;

    /* override */ renderElement(): JSX.Element | null
    {
        this.AssembleActualCommandItems();
        this._bar?.remeasure();
        return (
            <FluentCommandBar
                items={this._visibleCommandItems || []}
                componentRef={r => this._bar = r}
                overflowButtonAs={
                    (overflow) =>
                    {
                        var cmds = overflow.menuProps?.items?.map(item => item.data.command);
                        return <CommandButton
                            ContextMenuCommands={cmds}
                            Style={CommandButton.IconButtonStyle}
                            Icon="more" />
                    }
                }
                style={
                    {
                        direction: this.ItemsParent?.IsReversed ? "rtl" : undefined
                    }
                }
                styles={{
                    root: {
                        padding: "0px",
                        height: "auto",
                        background: "transparent",
                        margin: this.Padding
                    },
                }}
                overflowButtonProps={
                    {
                        style: {
                            background: "transparent"
                        }
                    }}
            />
        );
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

    override getCSSStyles()
    {
        var styles = super.getCSSStyles();
        styles.display = "block";
        return styles;
    }

    public override OnItemsSourceCollectionChanged(e: ICollectionUpdate)
    {
        this._allCommandItems = undefined;
        super.OnItemsSourceCollectionChanged(e);
    }    

    AssembleCommandItems(): void
    {
        this._allCommandItems = [];
        var itemsParent = this.ItemsParent;
        if (!itemsParent)
            return;

        var items = itemsParent?.ItemsSource;
        if (!items || items.length === 0)
            return;

        let i = 0;
        for (const item of items)
        {
            var cmd = item as ModelObjectReference;
            if (!cmd.IsModelObjectReference)
                continue;

            const cmdProps: ICommandBarItemProps = {
                key: cmd.Key.toString(),
                data: { index: i++, command: cmd },
                onRender: (item: ICommandBarItemProps, dismissMenu) =>
                {
                    if (this.state[item.key + "IsSeparator"])
                        return null;

                    return itemsParent?.OnRenderItem(
                        item.data.command,
                        item.data.index,
                        {
                            Command: item.data.command,
                        }) || (<></>);
                },
            };

            // We have to go through some hoops here because this control won't
            // remeasure for overflow if the buttons merely change their visibility
            // so instead we bind to each command's visibility directly and
            // assemble the command list accordingly. Note CommandBarButtonStyle
            // always has IsVisible = true for this reason.
            this.BindState(
                {
                    Source: cmd,
                    Path: "Visibility"
                }, cmd.Key.toString() + "IsVisible");
            this.BindState(
                {
                    Source: cmd,
                    Path: "IsSeparator"
                }, cmd.Key.toString() + "IsSeparator");

            this._allCommandItems.push(cmdProps);
        }
    }

    AssembleActualCommandItems(): void
    {
        if (!this._allCommandItems)
            this.AssembleCommandItems();
        if (!this._allCommandItems)
            return;

        this._visibleCommandItems = [];
        for (const item of this._allCommandItems)
        {
            if (this.state[item.key + "IsVisible"])
                this._visibleCommandItems.push(item);
        }
    }

    declare _resizeObserver?: ResizeObserver;
}

export class CommandBar extends ItemsControlBase<IItemsControlProps, IFrameworkElementState>
{
    public static DefaultStyle: WebStyle<IItemsControlProps> = new WebStyle<IItemsControlProps>(
        {
            ItemsSource: [],
            ItemsPanel: CommandBarPanel,
            Foreground: SemanticColor.BodyText,
            ItemContainerStyle: CommandButton.CommandBarButtonStyle,
            FontWeight: "bold"
        },
        {
            ["@ .ms-OverflowSet-overflowButton i"]: {
                color: TemplateProp(nameof<IItemsControlProps>(p => p.Foreground)),
                fontWeight: TemplateProp(nameof<IItemsControlProps>(p => p.FontWeight)),
            }
        }
    );

    /* override */ GetContainerForItemOverride(): typeof FrameworkElement
    {
        return CommandButtonBase;
    }

    public override async OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.ItemsSource))
        {
            (this.ItemsPanelInstance as CommandBarPanel)?.AssembleCommandItems();
        }
        super.OnBoundPropertyUpdate(property, value, oldValue);
    }


    protected override OnItemsSourceCollectionChanged(sender: any, e: ICollectionUpdate)
    {
        
        super.OnItemsSourceCollectionChanged(sender, e);
    }
}