import * as React from 'react';
import { BindingMode } from '@antimatterjs/react';
import { TemplateProp, WebStyle } from '../Style';
import { ISelectorProps, ISelectorState, Selector } from './Primitives/Selector';
import { ISelectableItemControlProps, SelectableItemControl, SelectableItemControlBase } from './Primitives/SelectableItemControl';
import { Panel } from './Panel';
import { SemanticColor, Theme, ThemeColor } from '../Theme';

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
        },
        SelectedItems: {
            Mode: BindingMode.TwoWay,
            NotifyCollectionChanged: true
        }
    };
    public static DefaultStyle: WebStyle<IListBoxProps> = new WebStyle<IListBoxProps>(
        {
            ItemsSource: [],
            BorderBrush: SemanticColor.ButtonBorder,
            BorderThickness: "1px",
            ItemPadding: "5px",
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
            ItemContainerStyle: new WebStyle<ISelectableItemControlProps>(
                {
                    Margin: "0px",
                    Template: (templatedParent: SelectableItemControl) =>
                    (
                        <Panel ClassName="listboxitem"  >
                            <>{templatedParent.props.children}</>
                            <div className="listboxitem-border-layer" />
                        </Panel>
                    )
                },
                {
                    "@": {
                        cursor: "pointer"
                    },
                    "@.selected": {
                        background: Theme.Value(ThemeColor.ThemeLighter),
                        color: Theme.Value(SemanticColor.BodyTextChecked)
                    },
                    //"@:hover.selected": {
                    //    background: Theme.Value(SemanticColor.ListItemBackgroundCheckedHovered),
                    //},
                    "@:hover:not(.selected)": {
                        background: Theme.Value(SemanticColor.ListItemBackgroundHovered)
                    },
                    "@ .listboxitem-border-layer": {
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
                    },
                    "@:hover:not(.selected) .listboxitem-border-layer": {
                        visibility: "visible",
                    }
                },
                SelectableItemControlBase.DefaultStyle
            )
        },
        {
            "@ .listboxitem": {
                padding: TemplateProp(nameof<IListBoxProps>(p => p.ItemPadding))
            },
        }
    );
}