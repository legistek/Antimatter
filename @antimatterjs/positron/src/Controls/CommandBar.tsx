import * as React from 'react';
import { ModelObjectReference } from '@antimatterjs/react';
import { CommandBar as FluentCommandBar, ICommandBar, ICommandBarItemProps } from '@fluentui/react';

import { Style } from '../Style';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { FrameworkElement } from '../FrameworkElement';
import { CommandButton } from './CommandButton';
import { IPanelProps, IPanelState, Panel } from './Panel';

class CommandBarPanel extends Panel<IPanelProps, IPanelState>
{
    _commandItems: ICommandBarItemProps[] = [];
    _bar?: ICommandBar | null;
    _renderIter: number = 0;

    /* override */ renderElement(): JSX.Element | null
    {
        this.AssembleCommandItems();
        return (
            <FluentCommandBar
                items={this._commandItems}
                componentRef={r => this._bar = r}
                styles={{
                    root: {
                        padding: "0px",
                        background: "transparent",
                        margin: this.state.Padding
                    }
                }}
            />
        );
    }

    /* override */ OnInvalidateRender()
    {
        //this._bar?.remeasure();
        this._renderIter++;
    }

    AssembleCommandItems(): void
    {
        this._commandItems = [];
        var itemsParent = this.state.ItemsParent;
        if (!itemsParent)
            return;

        var items = itemsParent?.state.ItemsSource;
        if (!items || items.length === 0)
            return;

        for (const item of items)
        {
            var cmd = item as ModelObjectReference;
            if (!cmd.IsModelObjectReference)
                continue;

            const cmdProps: ICommandBarItemProps = {
                key: cmd.Handle.toString(),// + "-" + this._renderIter,
                data: cmd,
                cacheKey: cmd.Handle.toString() + "-" + this._renderIter,
                onRender: (item, dismissMenu) =>
                {
                    return itemsParent?.OnRenderItem(item.data,
                        {
                            Command: item.data
                        });
                },
            };

            this._commandItems.push(cmdProps);
        }
    }
}

export class CommandBar extends ItemsControl<IItemsControlProps, IItemsControlState>
{
    public static DefaultStyle: Style<IItemsControlProps> = new Style<IItemsControlProps>(
    {
        ItemsSource: [],
        ItemsPanel: CommandBarPanel,
        ItemContainerStyle: CommandButton.CommandBarButtonStyle
    });

    /* override */ GetContainerForItemOverride(): typeof FrameworkElement
    {
        return CommandButton;
    }

    /* override */ OnRenderItem(item: any, props?: any): JSX.Element | null
    {
        props = props || {};
        props.ItemsParent = this;
        return super.OnRenderItem(item, props);
    }

    /* override */ OnPropertyChanged(property: string, value: any)
    {
        if (property === nameof(this.state.ItemsSource))
        {
            let a: number = 5;
            this.ItemsPanelInstance?.InvalidateRender();
        }
        super.OnPropertyChanged(property, value);
    }
}