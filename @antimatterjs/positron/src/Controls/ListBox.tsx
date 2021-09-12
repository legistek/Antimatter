import * as React from 'react';
import { BindingMode } from '@antimatterjs/react';
import { Style } from '../Style';
import { ISelectorProps, ISelectorState, Selector } from './Primitives/Selector';
import { ISelectableItemControlProps, SelectableItemControlBase } from './Primitives/SelectableItemControl';
import { Panel } from './Panel';
import { SemanticColor, Theme } from '../Theme';

export interface IListBoxProps extends ISelectorProps
{
}

export interface IListBoxState extends ISelectorState
{
}

export class ListBox extends Selector<IListBoxProps, IListBoxState>
{    
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
            BorderBrush: SemanticColor.ButtonBorder,
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
                        <Panel ClassName="listboxitem">
                            <>{templatedParent.props.children}</>
                            <div className="listboxitem-border-layer" />
                        </Panel>
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
                        background: Theme.Value(SemanticColor.ListItemBackgroundChecked),
                        color: Theme.Value(SemanticColor.BodyTextChecked)
                    }
                },
                {
                    Selector: "@:hover.selected",
                    Rules: {
                        background: Theme.Value(SemanticColor.ListItemBackgroundCheckedHovered),
                    }
                },
                {
                    Selector: "@:hover",
                    Rules: {
                        background: Theme.Value(SemanticColor.ListItemBackgroundHovered)
                    }
                },
                {
                    Selector: "@ .listboxitem-border-layer",
                    Rules: {
                        position: "absolute",
                        top: "0px",
                        width: "100%",
                        height: "100%",
                        background: Theme.Value(SemanticColor.ListItemBackgroundCheckedHovered),
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