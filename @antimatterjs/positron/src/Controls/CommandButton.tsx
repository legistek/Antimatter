import * as React from 'react';
import { Antimatter, Binding, BindingParameters, ModelObjectReference, ModelValue, RelativeSourceMode } from '@antimatterjs/react';
import { Checkbox as FluentCheckBox, DefaultButton, CommandButton as FluentCommandButton, PrimaryButton, CommandBarButton, IconButton, ICommandBarItemProps, IContextualMenuItemProps, IContextualMenuProps, IContextualMenuItem, IButtonStyles, HighContrastSelector } from '@fluentui/react'

import { Style } from '../Style';
import { ButtonBase, IButtonBaseProps, IButtonBaseState } from './Primitives/ButtonBase';
import { ControlTemplate } from '../FrameworkTemplate';
import { HorizontalAlignment } from '../Enums';
import { ItemsControl } from './ItemsControl';

export interface ICommandButtonProps extends IButtonBaseProps
{
    Icon?: number | Binding,
    Label?: string | Binding,
    IsDefault?: boolean | Binding,
    SecondaryCommandsSource?: any[] | Binding,
}
export interface ICommandButtonState extends IButtonBaseState
{
    Icon?: number,
    Label?: string,
    IsDefault?: boolean,
    SecondaryCommandsSource?: any[]
}

export class CommandButtonBase<P extends ICommandButtonProps = {}, S extends ICommandButtonState = {}>
    extends ButtonBase<P, S>
{
    public static BaseCommandButtonProps: ICommandButtonProps = {
        HorizontalAlignment: HorizontalAlignment.Left,
        Margin: "5px",
        IsVisible: new Binding({ Path: "Visibility", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command", FallbackValue: true }),
        ToolTip: new Binding({ Path: "ToolTip", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
        IsEnabled: new Binding({ Path: "IsEnabled", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command", FallbackValue: true  }),
        Icon: new Binding({ Path: "Icon", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
        Label: new Binding({ Path: "Name", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" })
    };

    public menuProps?: IContextualMenuProps;

    renderElement(): JSX.Element | null
    {
        this.AssembleSecondaryCommands();
        return super.renderElement();
    }

    private AssembleSecondaryCommands(): void
    {
        this.menuProps = undefined;

        const items = this.state.SecondaryCommandsSource ?? [];
        if (!items || items.length == 0)
            return;

        const ctxItems: IContextualMenuItem[] = []
        for (const item of items)
        {
            var cmd = item as ModelObjectReference
            if (!cmd.IsModelObjectReference)
                return;

            const key: string = cmd.Handle.toString();
            const textBindParams: BindingParameters = { Path: "Name", Source: cmd };
            const iconBindParams: BindingParameters = { Path: "Icon", Source: cmd };
            const disabledBindParams: BindingParameters = { Path: "IsEnabled", Source: cmd, Converter: (val) => !val, FallbackValue: true };
            const visibleBindParams: BindingParameters = { Path: "Visibility", Source: cmd, FallbackValue: true };
            this.BindState(visibleBindParams, `${key}:Visibility`);

            const ctxItem: IContextualMenuItem = {
                key: key,
                text: this.BindState(textBindParams, `${key}:Name`),
                iconProps: { iconName: CommandButton.ModelIconConverter(this.BindState(iconBindParams, `${key}:Icon`)) },
                disabled: this.BindState(disabledBindParams, `${key}:IsEnabled`),
                data: cmd,
                onClick: (e, i) => this.Execute(i?.data)
            };

            if (this.state[`${key}:Visibility`])
                ctxItems.push(ctxItem);
        }
        if (ctxItems.length > 0)
            this.menuProps = { items: ctxItems };
    }

    private Execute(cmd?: ModelObjectReference): void
    {
        if (!cmd || !cmd.IsModelObjectReference)
            return;
        Antimatter.Server.ExecuteICommand(cmd, ModelValue.Get(null));
    }
}

export class CommandButton extends CommandButtonBase<ICommandButtonProps, ICommandButtonState>
{
    public static DialogButtonStyle = new Style<ICommandButtonProps>(
        Object.assign(
            Object.assign({}, CommandButtonBase.BaseCommandButtonProps),
            {
                IsDefault: new Binding({ Path: "IsDefault", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
                Template: new ControlTemplate((templatedParent: CommandButtonBase<ICommandButtonProps, ICommandButtonState>) =>
                    templatedParent.state.IsDefault
                        ? (<PrimaryButton
                            style={{ minWidth: "90px" }}
                            onClick={(e) => templatedParent.OnClick(e.nativeEvent)}
                            disabled={!templatedParent.state.IsEnabled}
                            menuProps={templatedParent.menuProps}>
                            {templatedParent.state.Label}
                        </PrimaryButton>)
                        : (<DefaultButton
                            style={{ minWidth: "90px" }}
                            onClick={(e) => templatedParent.OnClick(e.nativeEvent)}
                            disabled={!templatedParent.state.IsEnabled}
                            menuProps={templatedParent.menuProps}>
                            {templatedParent.state.Label}
                        </DefaultButton>))
            }
        ));

    public static PrimaryButtonStyle = new Style<ICommandButtonProps>(
        Object.assign(
            Object.assign({}, CommandButton.BaseCommandButtonProps),
            {
                Template: new ControlTemplate((templatedParent: CommandButton) =>
                (
                    <PrimaryButton
                        onClick={(e) => templatedParent.OnClick(e.nativeEvent)}
                        iconProps={{
                            iconName: CommandButton.ModelIconConverter(templatedParent.state.Icon)
                        }}
                        disabled={!templatedParent.state.IsEnabled}
                        menuProps={templatedParent.menuProps}>
                        {templatedParent.state.Label}
                    </PrimaryButton>
                ))
            }
        ));

    public static CommandBarButtonStyle = new Style<ICommandButtonProps>(
        Object.assign(
            Object.assign({}, CommandButton.BaseCommandButtonProps),
            {
                Padding: "8px 0px 8px 0px",
                IsVisible: true,
                Template: new ControlTemplate((templatedParent: CommandButton) =>
                (
                    <CommandBarButton
                        style={{
                            padding: templatedParent.state.Padding,
                            backgroundColor: 'transparent'
                        }}
                        onClick={(e) => templatedParent.OnClick(e.nativeEvent)}
                        iconProps={{
                            iconName: CommandButton.ModelIconConverter(templatedParent.state.Icon)
                        }}
                        text={templatedParent.state.Label}
                        disabled={!templatedParent.state.IsEnabled}
                        menuProps={templatedParent.menuProps}>

                    </CommandBarButton>
                )),
            }
        ));

    public static IconButtonStyle = new Style<ICommandButtonProps>(
        Object.assign(
            Object.assign({}, CommandButton.BaseCommandButtonProps),
            {
                Padding: "8px 5px 8px 5px",

                Template: new ControlTemplate((templatedParent: CommandButton) =>
                (
                    <IconButton
                        styles={{
                            root: {
                                width: "fit-content",
                                padding: templatedParent.state.Padding,
                                height: "fit-content"
                            },
                            flexContainer: {
                                height: "fit-content",
                                margin: "0px"
                            },
                            icon: {
                                height: "fit-content",
                                margin: "0px",
                                fontSize: "20px"
                            },
                            splitButtonMenuButton: { backgroundColor: 'white', width: 28, border: 'none' },
                            splitButtonMenuIcon: { fontSize: '7px' },
                            splitButtonDivider: { backgroundColor: '#c8c8c8', width: 1, right: 26, position: 'absolute', top: 4, bottom: 4 },
                            splitButtonContainer: {
                                selectors: {
                                    [HighContrastSelector]: { border: 'none' },
                                },
                            },

                        }}
                        onClick={(e) =>
                            templatedParent.OnClick(e.nativeEvent)}
                        iconProps={{
                            iconName: CommandButton.ModelIconConverter(templatedParent.state.Icon)
                        }}
                        disabled={templatedParent.state.IsEnabled === false}
                        menuProps={templatedParent.menuProps}>
                    </IconButton>
                )),
            }
        ));

    public static DefaultStyle = CommandButton.PrimaryButtonStyle;

    public static ModelIconConverter(icon: number | undefined): string | undefined
    {
        return (!icon) ? undefined : icon.toString(16);
    }
}