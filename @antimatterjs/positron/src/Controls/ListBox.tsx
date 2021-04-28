import * as React from 'react';
import { getTheme } from '@fluentui/react';

import { BindingMode } from '@antimatterjs/react';

import { Style } from '../Style';
import { FrameworkElement } from '../FrameworkElement';
import { ISelectableItemProps, ISelectableItemState, ISelectorProps, ISelectorState, Selector } from './Primitives/Selector';
import { Control, IControlProps, IControlState } from '@antimatterjs/positron/src/Controls/Control';

export interface IListBoxProps extends ISelectorProps
{
}

export interface IListBoxState extends ISelectorState
{
}

export class ListBox extends Selector<IListBoxProps, IListBoxState>
{
    static theme = getTheme();

    public static DefaultBindings = {
        ItemsSource: {
            NotifyCollectionChanged: true,
            FallbackValue: []
        },
        SelectedItem: {
            Mode: BindingMode.TwoWay
        }
    };
    public static DefaultStyle: Style<IListBoxProps> = new Style<IListBoxProps>(
        {
            ItemsSource: [],
            Margin: "5px",
            BorderBrush: ListBox.theme.semanticColors.inputBorder,
            BorderThickness: "1px",
            OnPointerMove: (e) =>
            {
                var target = e.currentTarget as HTMLElement;
                if (!target)
                    return;
                var layer = target.querySelector(".listboxitem:hover .listboxitem-border-layer") as HTMLElement;
                if (!layer)
                    return;
                (layer.style as any).webkitMaskPosition = `${(e as any).layerX - 75}px center`;
            }
        }
    );

    protected /* override */ GetContainerForItemOverride(): typeof FrameworkElement
    {
        return ListBoxItem;
    }
}

export interface IListBoxItemProps extends ISelectableItemProps, IControlProps
{
}

interface IListBoxItemState extends ISelectableItemState, IControlState
{
}

class ListBoxItem<P extends IListBoxItemProps = {}, S extends IListBoxItemState = {}>
    extends Control<P, S>
{    
    static theme = getTheme();
    static DefaultStyle: Style<IListBoxItemProps> = new Style<IListBoxItemProps>(
        {
            Margin: "0px",
            Template: (templatedParent: ListBoxItem) =>
            (
                <>
                    <>{templatedParent.props.children}</>
                    <div className="listboxitem-border-layer"/>
                </>
            )
        },
        {
            Rules: {
                cursor: "pointer"
            }
        },
        {
            Selector: "@.selected",
            Rules: {
                background: ListBoxItem.theme.semanticColors.listItemBackgroundChecked,
                color: ListBoxItem.theme.semanticColors.bodyTextChecked
            }
        },
        {
            Selector: "@:hover.selected",
            Rules: {
                background: ListBoxItem.theme.semanticColors.listItemBackgroundCheckedHovered,
            }
        },
        {
            Selector: "@:hover",
            Rules: {
                background: ListBoxItem.theme.semanticColors.listItemBackgroundHovered
            }
        },
        {
            Selector: "@ .listboxitem-border-layer",
            Rules: {
                position: "absolute",
                top: "0px",
                width: "100%",
                height: "100%",
                background: ListBoxItem.theme.semanticColors.listItemBackgroundCheckedHovered,
                mixBlendMode: "darken",
                pointerEvents: "none",
                visibility: "hidden",
                WebkitMaskImage: "radial-gradient(circle at center, rgba(0,0,0,.5) 0%, transparent 75px)",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskSize: "150px 9999px"
            }
        },
        {
            Selector: "@:hover .listboxitem-border-layer",
            Rules: {
                visibility: "visible",
            }
        }
    );

    protected /* override */ constructClasses()
    {        
        return super.constructClasses() +
            "listboxitem " +
            (this.props.IsSelected ? "selected " : "");
    }
}
