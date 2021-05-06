import * as React from 'react';
import { ModelObjectReference } from '@antimatterjs/react';
import { CommandBar as FluentCommandBar, ICommandBarItemProps } from '@fluentui/react';

import { Style } from '../Style';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { FrameworkElement } from '../FrameworkElement';
import { CommandButton } from './CommandButton';
import { IPanelProps, IPanelState, Panel } from './Panel';

class CommandBarPanel extends Panel<IPanelProps, IPanelState>
{
    _commandItems: ICommandBarItemProps[] = [];

    /* override */ renderElement(): JSX.Element | null
    {
        this.AssembleCommandItems();
        return (
            <FluentCommandBar               
                items={this._commandItems}
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
                key: cmd.Handle.toString(),
                data: cmd,                
                onRender: (item, dismissMenu) =>
                    itemsParent?.OnRenderItem(item.data,
                        {
                            Command: item.data
                        }),
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
}