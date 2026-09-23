import * as React from 'react';
import { BindingMode } from '@antimatterjs/react';
import { ICSSSheet, TemplateProp, WebStyle } from '../Style';
import { ISelectorProps, Selector, SelectorBase } from './Primitives/Selector';
import { ISelectableItemControlProps, SelectableItemControl, SelectableItemControlBase } from './Primitives/SelectableItemControl';
import { Panel } from './Panel';
import { SemanticColor, Theme, ThemeColor } from '../Theme';
import { IFrameworkElementState } from '../FrameworkElement';
import { ScrollBarVisibility } from '../Enums';
import { VirtualizedPanel } from './VirtualizedPanel';
import { Control } from './Control';

export interface IListBoxProps extends ISelectorProps
{
}

export class ListBox extends SelectorBase<ISelectorProps, IFrameworkElementState>
{
    public static DefaultBindings = {
        ItemsSource: {
            NotifyCollectionChanged: true,
            FallbackValue: []
        },
        SelectedItem: {
            Mode: BindingMode.TwoWay,
            ValidatesOnDataErrors: false,
        },
        SelectedItems: {
            Mode: BindingMode.TwoWay,
            NotifyCollectionChanged: true
        },
        SelectedIndex: {
            Mode: BindingMode.TwoWay
        },
    };

    private static _listBoxItemStyleSheet: ICSSSheet = {
        "@": {
            cursor: "pointer"
        },
        "@.selected": {
            background: Theme.Value(ThemeColor.ThemeLighter),
            color: Theme.Value(SemanticColor.BodyTextChecked)
        },
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
    };

    public static ListItemStyle: WebStyle<ISelectableItemControlProps> = new WebStyle<ISelectableItemControlProps>(
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
        ListBox._listBoxItemStyleSheet,
        SelectableItemControlBase.DefaultStyle
    );

    public static DefaultStyle: WebStyle<IListBoxProps> = new WebStyle<IListBoxProps>(
        {
            ItemsSource: [],
            BorderBrush: SemanticColor.ButtonBorder,
            BorderThickness: "1px",
            ItemPadding: "5px",
            VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
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
            ItemContainerStyle: ListBox.ListItemStyle
        },
        {
            "@ .listboxitem": {
                padding: TemplateProp(nameof<IListBoxProps>(p => p.ItemPadding))
            },
            [Control.DisabledElement()]: {
                opacity: 0.5,
            },
        }
    );

    public static VirtualizedItemsStyle: WebStyle<IListBoxProps> = new WebStyle<IListBoxProps>(
        {
            ItemContainerStyle: new WebStyle<ISelectableItemControlProps>(
                {
                    Margin: "0px",
                    Template: (templatedParent: SelectableItemControl) =>
                    (
                        <VirtualizedPanel
                            PlaceholderHeight={100}
                            ClassName="listboxitem" >
                            <>{templatedParent.props.children}</>
                            <div className="listboxitem-border-layer" />
                        </VirtualizedPanel>
                    )
                },
                ListBox._listBoxItemStyleSheet,
                SelectableItemControlBase.DefaultStyle),
        },
        {
        },
        ListBox.DefaultStyle        
    );

    protected override OnSelectionChanged()
    {
        this.InvalidateRender(true);
        super.OnSelectionChanged();
    }
}