import * as React from 'react';
import { Antimatter, Binding, BindingMode, BindingParameters, ModelObjectReference, RelativeSourceMode, Utilities } from '@antimatterjs/react';
import { Checkbox as FluentCheckBox, DefaultButton, CommandButton as FluentCommandButton, PrimaryButton, CommandBarButton, IconButton, ICommandBarItemProps, IContextualMenuItemProps, IContextualMenuProps, IContextualMenuItem, IButtonStyles, HighContrastSelector, labelProperties, List, ActionButton, ContextualMenu, Callout, Rectangle, Target } from '@fluentui/react'

import { Style, TemplateProp, WebStyle } from '../Style';
import { ButtonBase, IButtonBaseProps, IButtonBaseState } from './Primitives/ButtonBase';
import { ControlTemplate } from '../FrameworkTemplate';
import { HorizontalAlignment, Orientation, VerticalAlignment } from '../Enums';
import { Ellipse } from '../Shapes/Ellipse';
import { IPanelProps, Panel, PanelBase } from './Panel';
import { Glyph } from './Glyph';
import { FontStyle, ThemeColor, SemanticColor, Theme, ThemeEffect, ThemeLayout } from '../Theme';
import { Control, IControlProps, IControlState } from './Control';
import { ContentPresenter } from './ContentPresenter';
import { IStackPanelProps, StackPanel } from './StackPanel';
import { TextBlock } from './TextBlock';
import { Separator } from './Separator';
import { IItemsControlProps, ItemsControl, ItemsControlBase } from './ItemsControl';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { CommandButton } from './CommandButton';
import { PlacementMode, Popup } from './Popup';

export interface ICommandMenuProps extends IItemsControlProps
{
    Orientation?: Orientation;        
    ItemSpacing?: string | ThemeLayout,
}

interface ICommandInfo
{
    IsSeparator: boolean;
    AbsoluteIndex: number;
    IsVisible: boolean;
}

export class CommandMenu extends ItemsControlBase<ICommandMenuProps>
{
    public static DefaultStyle = new WebStyle<ICommandMenuProps>(
        {
            Orientation: Orientation.Horizontal,
            Template: (templatedParent: CommandMenu) =>
            (
                <StackPanel
                    ItemSpacing={templatedParent.ItemSpacing}
                    Background={templatedParent.Background}
                    BorderBrush={templatedParent.BorderBrush}
                    BorderThickness={templatedParent.BorderThickness}
                    Orientation={templatedParent.Orientation}
                    Margin={templatedParent.Padding}
                    ItemsParent={templatedParent}/>
            ),
            ItemTemplate: (command) =>
                <>
                    <CommandButton
                        Command={command}
                        Padding={ThemeLayout.MarginSmallLTRB}
                        Style={CommandButton.CommandBarButtonStyle}
                    />
                </>
        },
        {
        }
    )

    //public /* virtual */ OnRenderItem(item: any, index: number, props?: any): JSX.Element | null
    //{
    //    var isSeparator = this.GetIsSeparator(item);
    //    var isVisible = this.GetIsVisible(item);
    //    if (!isVisible || isSeparator && (index === 0 || index === this.ItemsSource.length - 1))
    //        return null;

    //    if (!isSeparator)
    //        return super.OnRenderItem(item, index, props);

    //    // To show a separator, the prior visible item must be a non-separator
    //    for (let i = index; i >= 1; i--)
    //    {
    //        var preceding = this.ItemsSource[i];
    //        if (this.GetIsVisible(preceding) &&
    //            !this.GetIsSeparator(preceding))
    //            return this.RenderSeparator();
    //    }

    //    return null;
    //}

    //private RenderSeparator()
    //{
    //    return <Separator Orientation={this.Orientation === Orientation.Horizontal ? Orientation.Vertical : Orientation.Horizontal} />
    //}

    //public override async OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    //{
    //    super.OnBoundPropertyUpdate(property, value, oldValue);
    //    if (property === nameof(this.props.ItemsSource))
    //    {
    //        for (const item of this.ItemsSource)
    //        {
    //            let key: string = item.Key;
    //            if (item instanceof ModelObjectReference)
    //            {
    //                this.BindState({
    //                    Path: "IsSeparator",
    //                    Source: item,
    //                    FallbackValue: false
    //                }, `${key}:IsSeparator`);
    //                this.BindState({
    //                    Path: "Visibility",
    //                    Source: item,
    //                    FallbackValue: true
    //                }, `${key}:Visibility`);
    //            }
    //        }
    //    }
    //}

    public get ItemSpacing(): string|undefined
    {
        return this.GetValue(nameof(this.props.ItemSpacing));
    }

    public get Orientation(): Orientation
    {
        return this.GetValue(nameof(this.props.Orientation), Orientation.Vertical);
    }

    private GetIsSeparator(item: ModelObjectReference)
    {
        let key: string = item.Key;
        return this.GetValue(`${key}:IsSeparator`);
    }

    private GetIsVisible(item: ModelObjectReference)
    {
        let key: string = item.Key;
        return this.GetValue(`${key}:Visibility`);
    }    
}