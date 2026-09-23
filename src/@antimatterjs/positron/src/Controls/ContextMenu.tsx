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
import { StackPanel } from './StackPanel';
import { TextBlock } from './TextBlock';
import { Separator } from './Separator';
import { IItemsControlProps, ItemsControl, ItemsControlBase } from './ItemsControl';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { CommandButton } from './CommandButton';
import { PlacementMode, Popup } from './Popup';

export type CommandRef = ModelObjectReference | {
    Action: (param: any) => void,
    Key: string,
    Label: string,
    Icon?: number | string,
    Data?: any
};

export interface IContextMenuProps extends IItemsControlProps
{
    IsOpen?: boolean | Binding;
    GetTarget?: () => FrameworkElement;
    OnSelection?: () => void;
    GetCommandParameter?: () => any;
    LateBindingParams?: BindingParameters;
}

export class ContextMenuPanel extends PanelBase<IPanelProps>
{
    override renderElement()
    {
        var menu = this.ItemsParent;
        if (!(menu instanceof ContextMenuBase))
            return null;

        if (!menu.IsOpen)
            return null;

        let items: any[] = [];

        if (menu.LateBindingParams)
            items = this.BindState(menu.LateBindingParams) || [];
        else
            items = menu.ItemsSource || [];

        let isCustom = items.length === 0 && this.ItemsParent?.props.children;
        if (!isCustom && items.length === 0)
            return null;

        var lme = FrameworkElement.LastMouseEvent;
        var target = document.elementFromPoint(lme.X, lme.Y);
        var rc = target?.getBoundingClientRect();

        if (isCustom)
        {
            return (
                <Callout
                    hidden={!menu.IsOpen}
                    isBeakVisible={false}
                    preventDismissOnScroll={true}
                    coverTarget={true}
                    target={{
                        x: rc?.right,
                        y: rc?.bottom
                    }}
                    styles={{
                        calloutMain: {
                            display: "flex",
                            //maxHeight: "75vh"
                        },
                    }}
                    minPagePadding={0}
                    preventDismissOnResize={true}
                    //preventDismissOnLostFocus={true}
                    onDismiss={() =>
                    {
                        //if (!menu || !(menu instanceof ContextMenuBase))
                        //    return;
                        //menu.IsOpen = false
                        //var onSel = (this?.ItemsParent as ContextMenuBase)?.OnSelection;
                        //if (onSel) onSel();
                    }}>
                    <Panel ref={r =>
                    {
                        r?.OnClickOutsideMe(() =>
                        {
                            if (!menu || !(menu instanceof ContextMenuBase))
                                return;
                            menu.IsOpen = false
                            var onSel = (this?.ItemsParent as ContextMenuBase)?.OnSelection;
                            if (onSel) onSel();
                        });
                    }}>
                        {this.ItemsParent?.props.children}
                    </Panel>
                </Callout>
            );
        }

        var targetFE = menu.GetTarget && menu.GetTarget();
        var actualTarget = targetFE && targetFE.PlaceContextMenuWithMouse
            ? undefined
            : (menu.GetTarget && menu.GetTarget())?.Container;

        return (
            <ContextualMenu
                hidden={!menu.IsOpen}
                target={
                    actualTarget || {
                        x: rc?.x,
                        y: rc?.bottom
                    }
                }
                alignTargetEdge={true}
                calloutProps={{
                    preventDismissOnScroll: true
                }}
                onDismiss={() =>
                {
                    if (!menu || !(menu instanceof ContextMenuBase))
                        return;
                    menu.IsOpen = false;
                    var onSel = (this?.ItemsParent as ContextMenuBase)?.OnSelection;
                    if (onSel) onSel();
                }}
                items={
                    isCustom
                        ? [
                            {
                                key: "custom",
                                onRenderContent: (props, defaultRenderer) => this.ItemsParent?.props.children,
                                style: {
                                    height: "auto"
                                }
                            }
                        ]
                        : ContextMenuPanel.AssembleItems(
                            menu,
                            items,
                            menu.FontFamily)
                } />
        );
    }

    public static AssembleItems(
        parent: ContextMenu | CommandButton,
        items: CommandRef[],
        fontFamily?: string): IContextualMenuItem[]
    {
        const ctxItems: IContextualMenuItem[] = []
        let i = 0;
        let lastWasSeparator: boolean = false;
        for (const item of items)
        {
            let key: string = item.Key;
            let isVisible: boolean = true;
            let isSeparator: boolean = false;
            let isChecked: boolean = false;
            let isDisabled: boolean = false;
            let label: string = '';
            let icon: string | undefined = undefined;
            if (item instanceof ModelObjectReference)
            {
                label = parent.BindState({ Path: "Name", Source: item }, `${key}:Name`) || "sep";
                isVisible = parent.BindState({ Path: "Visibility", Source: item, FallbackValue: true }, `${key}:Visibility`);
                icon = CommandButton.ModelIconConverter(parent.BindState({ Path: "Icon", Source: item }, `${key}:Icon`));
                isSeparator = parent.BindState({
                    Path: "IsSeparator",
                    Source: item,
                    FallbackValue: false
                }, `${key}:IsSeparator`);
                isChecked = parent.BindState({
                    Path: "IsChecked",
                    Source: item,
                    FallbackValue: false
                }, `${key}:IsChecked`);
                isDisabled = parent.BindState({
                    Path: "IsEnabled",
                    Source: item,
                    Converter: (val) => !val,
                    FallbackValue: true
                }, `${key}:IsEnabled`);
            }
            else
            {
                icon = item.Icon?.toString();
                label = item.Label;
            }

            if (!isVisible)
                continue;

            // Don't allow starting with a separator or consecutive separators
            if (isSeparator &&
                (lastWasSeparator || ctxItems.length === 0))
                continue;
            lastWasSeparator = isSeparator;

            const ctxItem: IContextualMenuItem = {
                onRenderContent: (props, defaultRenders) =>
                {
                    if (props.item.data === "separator")
                        return (<Separator
                            VerticalAlignment={VerticalAlignment.Center}
                            Margin="0px"
                            Padding="0px"
                            Orientation={Orientation.Horizontal} />);

                    return (
                        <StackPanel
                            Orientation={Orientation.Horizontal} VerticalAlignment={VerticalAlignment.Center}>
                            {defaultRenders.renderCheckMarkIcon(props)}
                            {defaultRenders.renderItemIcon(props)}
                            {defaultRenders.renderItemName(props)}
                        </StackPanel>);
                },
                style: {
                    lineHeight: "unset",
                    fontFamily: fontFamily,
                    height: isSeparator ? "5px" : undefined,
                    color: isDisabled ? Theme.Value(SemanticColor.DisabledText) : Theme.Value(ThemeColor.NeutralDark)
                },
                key: key,
                text: label,
                iconProps: {
                    iconName: icon,
                    style: {
                        color: isDisabled ? Theme.Value(SemanticColor.DisabledText) : Theme.Value(SemanticColor.MenuIcon)
                    }
                },
                disabled: isSeparator || isDisabled,
                data: isSeparator
                    ? "separator"
                    : item,
                checked: isChecked,
                canCheck: isChecked,
                onClick: (e, i) =>
                {
                    if (i?.data)
                    {
                        e?.stopPropagation();
                        if (i?.data instanceof ModelObjectReference)
                        {
                            parent.ExecuteCommand(
                                i.data,
                                parent instanceof ContextMenu && parent?.GetCommandParameter
                                    ? parent.GetCommandParameter()
                                    : undefined);
                        }
                        else
                        {
                            i.data.Action(i.data);
                        }
                    }
                    var onSel = ((parent as any)?.ItemsParent as ContextMenuBase)?.OnSelection;
                    if (onSel)
                        onSel();
                    if (parent instanceof ContextMenu)
                        parent.IsOpen = false;
                }
            };

            ctxItems.push(ctxItem);
        }

        // Don't allow ending with a separator
        while (ctxItems[ctxItems.length - 1]?.data === "separator")
            ctxItems.pop();

        return ctxItems;
    }
}

export class ContextMenuBase<P extends IContextMenuProps = {}, S extends IControlState = {}> extends ItemsControlBase<P, S>
{
    public static DefaultBindings = {
        IsOpen: {
            Mode: BindingMode.TwoWay
        }
    };

    public static DefaultStyle = new WebStyle<IContextMenuProps>({
        ItemsPanel: ContextMenuPanel,
        VerticalAlignment: VerticalAlignment.Top
    });

    constructor(props)
    {
        super(props);
        this.OnContextMenu = this.OnContextMenu.bind(this);
        this.OnParentMounted = this.OnParentMounted.bind(this);
    }

    public get LateBindingParams(): BindingParameters | undefined
    {
        return this.GetValue(nameof(this.props.LateBindingParams));
    }

    public get GetCommandParameter(): (() => any) | undefined
    {
        return this.GetValue(nameof(this.props.GetCommandParameter)) ||
            (() => this.ContextMenuCommandParameter);
    }

    public get IsOpen(): boolean
    {
        return this.GetValue(nameof(this.props.IsOpen), false);
    }
    public set IsOpen(value: boolean)
    {
        this.SetValue(nameof(this.props.IsOpen), value, true);
        this.ItemsPanelInstance?.InvalidateRender();
        if (!this.GetTarget)
            return;
        var fe = this.GetTarget();
        if (!fe)
            return;
        fe.IsContextMenuOpen = value;
    }

    public override async OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.props.IsOpen))
            this.ItemsPanelInstance?.InvalidateRender();
        super.OnBoundPropertyUpdate(property, value, oldValue);
    }

    public get OnSelection(): (() => void) | undefined
    {
        return this.GetValue(nameof(this.props.OnSelection));
    }

    public get GetTarget(): (() => FrameworkElement) | undefined
    {
        return this.GetValue(nameof(this.props.GetTarget));
    }

    override OnComponentMount()
    {
        if (!this.GetTarget)
            return;
        var target = this.GetTarget();
        if (!target)
            return;
        target.Mounted.subscribe(this.OnParentMounted);
    }

    override OnComponentWillUnmount()
    {
        if (!this.GetTarget)
            return;
        var target = this.GetTarget();
        if (!target?.Container)
            return;
        target.Mounted.unsubscribe(this.OnParentMounted);
        target.Container.removeEventListener(
            "contextmenu",
            this.OnContextMenu);
    }

    private OnParentMounted(sender: FrameworkElement)
    {
        if (!sender?.Container)
            return;
        sender.Container.addEventListener("contextmenu", this.OnContextMenu);
    }

    private OnContextMenu(e: Event)
    {
        this.IsOpen = true;
        e.stopPropagation();
        e.preventDefault();
    }
}

export class ContextMenu extends ContextMenuBase<IContextMenuProps, IControlState>
{
}

// Hideous ridiculous hack necessitated by Javascript stupidity
// in being unable to allow a base class to reference a subclass
FrameworkElement.RenderContextMenu = (
    target: FrameworkElement<IFrameworkElementProps, IFrameworkElementState>,
    commandParameter: ModelObjectReference | undefined = undefined): JSX.Element | null =>
{
    var cmds = target.ContextMenuCommands;
    if (!cmds)
        return null;
    if (typeof cmds === "function")
    {
        var render = cmds as (() => JSX.Element);
        return (
            <ContextMenu
                Overlaps={true}
                GetCommandParameter={commandParameter ? () => commandParameter : undefined}
                GetTarget={() => target}>
                {render()}
            </ContextMenu>);
    }
    else
    {
        var cmdsAreBound = Utilities.IsIterable(cmds);
        return (<ContextMenu
            Overlaps={true}
            GetCommandParameter={commandParameter ? () => commandParameter : undefined}
            IsOpen={new Binding({
                Source: target,
                Path: nameof(target.IsContextMenuOpen)
            })}
            ItemsSource={cmdsAreBound ? cmds as any[] : undefined}
            LateBindingParams={cmdsAreBound ? undefined : cmds as BindingParameters}
            GetTarget={() => target} />);
    }
};