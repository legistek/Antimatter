import * as React from 'react';
import { ModelObjectReference } from '@antimatterjs/react';
import { CommandBar as FluentCommandBar, ICommandBar, ICommandBarItemProps } from '@fluentui/react';

import { Style } from '../Style';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { FrameworkElement } from '../FrameworkElement';
import { CommandButton } from './CommandButton';
import { IPanelProps, IPanelState, PanelBase } from './Panel';

class CommandBarPanel extends PanelBase<IPanelProps, IPanelState>
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
        this._allCommandItems = [];
        var itemsParent = this.state.ItemsParent;
        if (!itemsParent)
            return;

        var items = itemsParent?.state.ItemsSource;
        if (!items || items.length === 0)
            return;

        let i = 0;
        for (const item of items)
        {
            var cmd = item as ModelObjectReference;
            if (!cmd.IsModelObjectReference)
                continue;

            const cmdProps: ICommandBarItemProps = {
                key: cmd.Handle.toString(),
                data: { index: i, command: cmd },
                onRender: (item: ICommandBarItemProps, dismissMenu) =>
                {
                    return itemsParent?.OnRenderItem(
                        item.data.command,
                        item.data.index,
                        {
                            Command: item.data,
                        }) || <></>;
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
                }, cmd.Handle.toString() + "IsVisible");
            
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

    /* override */ OnPropertyChanged(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.state.ItemsSource))
        {
            (this.ItemsPanelInstance as CommandBarPanel)?.AssembleCommandItems();
        }
        super.OnPropertyChanged(property, value, oldValue);
    }
}