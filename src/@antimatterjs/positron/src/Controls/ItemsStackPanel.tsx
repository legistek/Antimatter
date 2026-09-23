import * as React from 'react';

import { Antimatter, Utilities } from '@antimatterjs/react';

import { HorizontalAlignment } from '../Enums';
import { IFrameworkElementState } from '../FrameworkElement';
import { IStackPanelProps, StackPanel, StackPanelBase } from './StackPanel';
import { VirtualizedPanel } from './VirtualizedPanel';
import { DataTemplate, FrameworkTemplate } from '../FrameworkTemplate';
import { PanelBase } from './Panel';
import { CSSClasses } from '../CSSClasses';

export interface IItemsStackPanelProps extends IStackPanelProps
{
    RealizationDelay?: number,
    HeaderTemplate?: DataTemplate,
    VirtualizationGroupSize?: number,
    HorizontalContentAlignment?: HorizontalAlignment,
    VirtualizingPlaceholderHeight?: number,
}

/**
 * A panel for stacking and virtualizing items in an ItemsControl when
 * heights are unknown. Simply use this in place of StackPanel for 
 * ItemsControl ItemsPanel, or in an overridden ItemsControl template.
 * This is also preferred over using VirtualizedPanel directly in the
 * ItemTemplate of an ItemsControl.
 */
export class ItemsStackPanel extends
    PanelBase<IItemsStackPanelProps, IFrameworkElementState>
{
    public static readonly PART_GroupPanels: string = Antimatter.Identifier("PART_GroupPanels");

    override renderElement(): JSX.Element | null
    {
        if (!this.ItemsParent)
            return null;
        let list: (JSX.Element | null | undefined)[] = [];
        var items = this.ItemsParent.ItemsSource;

        let arrayIndex = 0;
        let groupCount = Math.ceil((items.length || 0) / this.VirtualizationGroupSize);
        list = Array(groupCount +
            (this.HeaderTemplate ? 1 : 0));

        this._groups = new Array(groupCount);

        if (this.HeaderTemplate)
        {
            var jsx = FrameworkTemplate.GetRenderer(this.HeaderTemplate)(undefined);
            list[0] = jsx;
            arrayIndex++;
        }

        if (items?.length > 0)
        {
            let groupCount = Math.ceil(items.length / this.VirtualizationGroupSize);
            let itemIndex = 0;
            for (let groupIndex = 0; groupIndex < groupCount; groupIndex++, arrayIndex++)
            {
                let groupMembers: JSX.Element[] = [];
                for (let itemGroupIndex = 0;
                    itemGroupIndex < this.VirtualizationGroupSize && itemIndex < items.length;
                    itemIndex++, itemGroupIndex++)
                {
                    var row =
                        this.ItemsParent.OnRenderItem(items[itemIndex], itemIndex, {
                            HorizontalAlignment: this.HorizontalContentAlignment
                        });
                    if (!row)
                        continue;
                    groupMembers.push(row);
                }

                list[arrayIndex] = <>
                    <VirtualizedPanel
                        ref={r =>
                        {
                            if (!this._groups || !r)
                                return;
                            this._groups[r.GroupIndex] = r
                        }}
                        GroupIndex={arrayIndex}
                        ClassName={ItemsStackPanel.PART_GroupPanels}
                        RealizationDelay={this.RealizationDelay}
                        PlaceholderHeight={this.VirtualizingPlaceholderHeight * groupMembers.length}>
                        <StackPanel Style={StackPanel.UnspacedStyle}>
                            {groupMembers}
                        </StackPanel>
                    </VirtualizedPanel>
                </>;
            }
            this.ItemsParent.OnItemsRendered({
                Start: 0,
                End: items.length - 1
            });
        }

        return (<>{list}</>);
    }

    public get HeaderTemplate(): DataTemplate | undefined
    {
        return this.GetValue(nameof(this.props.HeaderTemplate));
    }

    public get VirtualizationGroupSize(): number
    {
        return this.GetValue(nameof(this.props.VirtualizationGroupSize), 25);
    }

    public get VirtualizingPlaceholderHeight(): number
    {
        return this.GetValue(nameof(this.props.VirtualizingPlaceholderHeight), 32);
    }

    public get RealizationDelay(): number
    {
        return this.GetValue(nameof(this.RealizationDelay), 250);
    }

    public get HorizontalContentAlignment(): HorizontalAlignment
    {
        return this.GetValue(nameof(this.HorizontalContentAlignment), HorizontalAlignment.Stretch);
    }

    public override async ScrollTo(item: number | any, ignoreIfInView?: boolean, animate: boolean = true): Promise<boolean>
    {
        if (!this.ItemsParent?.ItemsSource || !this.Container || !this._groups)
            return false;
        var index = typeof (item) === "number"
            ? item
            : this.ItemsParent.ItemsSource.findIndex((i) => Utilities.SmartEquals(i, item));
        if (index === -1)
            return false;

        var groupNum = Math.floor(index / this.VirtualizationGroupSize);

        var group = this._groups[groupNum];
        if (!group?.Container)
            return false;

        if (group.IsRealized)
            return await super.ScrollTo(item, ignoreIfInView, animate);

        var scroller = Utilities.FindParentElement(group.Container as HTMLElement, (e) =>
        {
            if (!e.style)
                return false;
            return e.style.overflowY === "auto" ||
                e.style.overflowY === "scroll";
        });
        if (!scroller)
            return false;

        var rc = group.Container.getBoundingClientRect();
        var rp = scroller.getBoundingClientRect();

        if (rc.top > rp.bottom) // further down
            scroller.scrollTo(0, scroller.scrollTop + (rc.top - rp.bottom));
        else if (rc.bottom < rp.top) // higher up
            scroller.scrollTo(0, scroller.scrollTop - (rp.top - rc.bottom));                   

        let timeout: number = 1000;
        while (!group.IsRealized && timeout > 0)
        {
            await Utilities.SleepAsync(33);
            timeout -= 33;
        }

        var realizedItem = this.ItemsParent.TryGetItemContainer(index);
        if (!realizedItem?.Container)
            // huh?
            return false;

        return await super.ScrollTo(item, undefined, animate);
    }

    override constructClasses(): string
    {
        return CSSClasses.VStack + " " + super.constructClasses();
    }

    private _groups?: VirtualizedPanel[];
}