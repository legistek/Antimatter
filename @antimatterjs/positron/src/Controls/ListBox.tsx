import * as React from 'react';
import { getTheme } from '@fluentui/react';
import { BindingMode } from '@antimatterjs/react';
import { Style } from '../Style';
import { ISelectorProps, ISelectorState, Selector } from './Primitives/Selector';
import { ISelectableItemControlProps, SelectableItemControlBase } from './Primitives/SelectableItemControl';

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
            },
            ItemContainerStyle: new Style<ISelectableItemControlProps>(
                {
                    Margin: "0px",
                    Template: (templatedParent: SelectableItemControlBase) =>
                    (
                        <div className="listboxitem">
                            <>{templatedParent.props.children}</>
                            <div className="listboxitem-border-layer" />
                        </div>
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
                        background: ListBox.theme.semanticColors.listItemBackgroundChecked,
                        color: ListBox.theme.semanticColors.bodyTextChecked
                    }
                },
                {
                    Selector: "@:hover.selected",
                    Rules: {
                        background: ListBox.theme.semanticColors.listItemBackgroundCheckedHovered,
                    }
                },
                {
                    Selector: "@:hover",
                    Rules: {
                        background: ListBox.theme.semanticColors.listItemBackgroundHovered
                    }
                },
                {
                    Selector: "@ .listboxitem-border-layer",
                    Rules: {
                        position: "absolute",
                        top: "0px",
                        width: "100%",
                        height: "100%",
                        background: ListBox.theme.semanticColors.listItemBackgroundCheckedHovered,
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
            )
        }
    );
}