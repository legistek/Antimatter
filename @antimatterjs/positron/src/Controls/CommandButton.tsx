import * as React from 'react';
import { Antimatter, Binding, BindingParameters, ModelObjectReference, ModelValue, RelativeSourceMode } from '@antimatterjs/react';
import { Checkbox as FluentCheckBox, DefaultButton, CommandButton as FluentCommandButton, PrimaryButton, CommandBarButton, IconButton, ICommandBarItemProps, IContextualMenuItemProps, IContextualMenuProps, IContextualMenuItem, IButtonStyles, HighContrastSelector, labelProperties, List } from '@fluentui/react'

import { WebStyle } from '../Style';
import { ButtonBase, IButtonBaseProps, IButtonBaseState } from './Primitives/ButtonBase';
import { ControlTemplate } from '../FrameworkTemplate';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';
import { Ellipse } from '../Shapes/Ellipse';
import { Panel } from './Panel';
import { Glyph } from './Glyph';
import { FontStyle, ThemeColor, SemanticColor, Theme } from '../Theme';
import { Control } from './Control';


export interface ICommandButtonProps extends IButtonBaseProps
{
    Icon?: number | string | Binding,
    IconSize?: number | FontStyle | Binding,
    IconForeground?: string | ThemeColor | SemanticColor | Binding,
    Label?: string | Binding,
    IsDefault?: boolean | Binding,
    SecondaryCommandsSource?: any[] | Binding,
    AllCapsLabel?: boolean,
}
export interface ICommandButtonState extends IButtonBaseState
{
    Icon?: number | string,    
    Label?: string,
    IsDefault?: boolean,
    AllCapsLabel?: boolean,
    SecondaryCommandsSource?: any[]
}

export class CommandButtonBase<P extends ICommandButtonProps = {}, S extends ICommandButtonState = {}>
    extends ButtonBase<P, S>
{
    private static BaseCommandButtonProps: ICommandButtonProps = {
        HorizontalAlignment: HorizontalAlignment.Left,
        AllCapsLabel: true,
        FontWeight: "bold",
        FontSize: FontStyle.SmallPlus,
        IconSize: FontStyle.Glyph1x,
        FontFamily: FontStyle.FontFamily,
        BorderThickness: "1px",
        IsVisible: new Binding({ Path: "Visibility", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command", FallbackValue: true }),
        ToolTip: new Binding({ Path: "ToolTip", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
        IsEnabled: new Binding({ Path: "IsEnabled", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command", FallbackValue: true }),
        Icon: new Binding({ Path: "Icon", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
        Label: new Binding({ Path: "Name", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" })
    };

    public static BaseCommandButtonStyle: WebStyle<ICommandButtonProps> = new WebStyle<ICommandButtonProps>(
        CommandButtonBase.BaseCommandButtonProps,
        {
            "@ .ms-Button": {
                height: "auto"
            },
            "@ .ms-Button-label": {
                lineHeight: "unset"
            }
        }
    );

    public get IconForeground(): string | undefined
    {
        return this.GetThemableProperty(nameof(this.props.IconForeground), Theme.Value(SemanticColor.PrimaryButtonText));
    }

    public get IconSize(): number
    {
        return this.GetThemableProperty(nameof(this.props.IconSize), Theme.Value(FontStyle.Glyph1x));
    }

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
                style: {
                    lineHeight: "unset",
                    fontFamily: this.FontFamily,
                },
                key: key,
                text: this.BindState(textBindParams, `${key}:Name`),
                iconProps: {                    
                    iconName: CommandButton.ModelIconConverter(this.BindState(iconBindParams, `${key}:Icon`)),
                    style: {
                        color: Theme.Value(SemanticColor.MenuIcon)
                    }                    
                },
                disabled: this.BindState(disabledBindParams, `${key}:IsEnabled`),
                data: cmd,
                onClick: (e, i) => this.Execute(i?.data)
            };

            if (this.state[`${key}:Visibility`])
                ctxItems.push(ctxItem);
        }
        if (ctxItems.length > 0)
            this.menuProps = {
                items: ctxItems
            };
    }

    private Execute(cmd?: ModelObjectReference): void
    {
        if (!cmd || !cmd.IsModelObjectReference)
            return;
        Antimatter.Server.ExecuteICommand(cmd, ModelValue.Get(null));
    }

    public get ActualLabel(): string | undefined
    {
        return this.state.AllCapsLabel
            ? this.state.Label?.toUpperCase()
            : this.state.Label;
    }

    override constructClasses()
    {
        return super.constructClasses() + (this.state.IsDefault ? " btn-default " : "");
    }
}

export class CommandButton extends CommandButtonBase<ICommandButtonProps, ICommandButtonState>
{
    public static DialogButtonStyle = new WebStyle<ICommandButtonProps>(
        {            
            IsDefault: new Binding({ Path: "IsDefault", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
            Padding: "8px",
            Margin: "0px 5px",
            Template: new ControlTemplate((templatedParent: CommandButtonBase<ICommandButtonProps, ICommandButtonState>) =>
                templatedParent.state.IsDefault
                    ? (<PrimaryButton
                        style={{
                            minWidth: "90px",
                            fontFamily: templatedParent.FontFamily,
                            fontSize: templatedParent.FontSize,
                        }}
                        styles={{
                            label: {
                                color: templatedParent.Foreground || Theme.Value(SemanticColor.PrimaryButtonText),
                            },
                            root: {
                                borderColor: templatedParent.BorderBrush || Theme.Value(SemanticColor.PrimaryButtonBackground),
                                background: templatedParent.Background || Theme.Value(SemanticColor.PrimaryButtonBackground),
                                padding: templatedParent.state.Padding
                            }
                        }}
                        onClick={(e) => templatedParent.OnClick(e.nativeEvent)}
                        disabled={!templatedParent.IsEnabled}
                        menuProps={templatedParent.menuProps}>
                        {templatedParent.ActualLabel}
                    </PrimaryButton>)
                    : (<DefaultButton
                        style={{
                            minWidth: "90px",
                            fontFamily: templatedParent.FontFamily,
                            fontSize: templatedParent.FontSize,
                        }}
                        styles={{
                            label: {
                                color: templatedParent.Foreground || Theme.Value(SemanticColor.ButtonText),
                            },
                            root: {
                                borderColor: templatedParent.BorderBrush || Theme.Value(SemanticColor.ButtonBorder),
                                background: templatedParent.Background || Theme.Value(SemanticColor.ButtonBackground),
                                padding: templatedParent.state.Padding
                            }
                        }}
                        onClick={(e) => templatedParent.OnClick(e.nativeEvent)}
                        disabled={!templatedParent.state.IsEnabled}
                        menuProps={templatedParent.menuProps}>
                        {templatedParent.ActualLabel}
                    </DefaultButton>))
        },
        {
            "@ .ms-Button:hover": {
                background: Theme.Value(SemanticColor.ButtonBackgroundHovered),
            },
            "@ .ms-Button:active": {
                background: Theme.Value(SemanticColor.ButtonBackgroundPressed),
            },
            "@.btn-default .ms-Button:hover": {
                background: Theme.Value(SemanticColor.PrimaryButtonBackgroundHovered),
                borderColor: Theme.Value(SemanticColor.PrimaryButtonBackgroundHovered),
            },
            "@.btn-default .ms-Button:active": {
                background: Theme.Value(SemanticColor.PrimaryButtonBackgroundPressed),
                borderColor: Theme.Value(SemanticColor.PrimaryButtonBackgroundPressed),
            },
            [Control.DisabledElement("ms-Button")]: {
                background: Theme.Value(SemanticColor.ButtonBackgroundDisabled),
                border: Theme.Value(SemanticColor.ButtonBorderDisabled),
                borderWidth: "1px",
                borderStyle: "solid"
            },
            [Control.DisabledElement("ms-Button-label")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText),
            },
        },
        CommandButtonBase.BaseCommandButtonStyle);

    public static PrimaryButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            BorderBrush: SemanticColor.PrimaryButtonBackground,
            Background: SemanticColor.PrimaryButtonBackground,
            Foreground: SemanticColor.PrimaryButtonText,
            IconForeground: SemanticColor.PrimaryButtonText,
            Padding: "8px",            
            Template: new ControlTemplate((templatedParent: CommandButton) =>
            (
                <PrimaryButton
                    onClick={(e) => templatedParent.OnClick(e.nativeEvent)}
                    iconProps={{
                        iconName: CommandButton.ModelIconConverter(templatedParent.state.Icon)
                    }}
                    styles={{
                        label: {
                            color: templatedParent.Foreground,
                        },
                        root: {
                            borderWidth: templatedParent.state.BorderThickness,
                            borderColor: templatedParent.BorderBrush,
                            background: templatedParent.Background,
                            padding: templatedParent.state.Padding,
                            selectors: {
                                ":hover": {
                                    border: "unset",
                                    borderWidth: templatedParent.state.BorderThickness,
                                },
                                ":active": {
                                    border: "unset",
                                    borderWidth: templatedParent.state.BorderThickness,
                                }
                            }
                        },
                        icon: {
                            color: templatedParent.IconForeground,
                            margin: "-5px 0px -5px 4px",
                            fontSize: templatedParent.IconSize
                        },
                        menuIcon: {
                            margin: "-5px 4px -5px 0px",
                            color: templatedParent.IconForeground,
                            fontSize: templatedParent.IconSize - 2
                        }
                    }}
                    style={{
                        fontFamily: templatedParent.FontFamily,
                        fontSize: templatedParent.FontSize,
                    }}
                    disabled={!templatedParent.IsEnabled}
                    menuProps={templatedParent.menuProps}>
                    {templatedParent.ActualLabel}
                </PrimaryButton>
            ))
        },
        {
            [Control.DisabledElement("ms-Button")]: {
                background: Theme.Value(SemanticColor.PrimaryButtonBackgroundDisabled),
                border: Theme.Value(SemanticColor.PrimaryButtonBackgroundDisabled),
                borderWidth: "1px",
                borderStyle: "solid"
            },
            [Control.DisabledElement("ms-Button-label")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText),
            },
            "@ .ms-Button:hover": {                
                background: Theme.Value(SemanticColor.PrimaryButtonBackgroundHovered),
                borderColor: Theme.Value(SemanticColor.PrimaryButtonBackgroundHovered),
                color: Theme.Value(SemanticColor.PrimaryButtonTextHovered),
            },
            "@ .ms-Button:active": {
                background: Theme.Value(SemanticColor.PrimaryButtonBackgroundPressed),
                borderColor: Theme.Value(SemanticColor.PrimaryButtonBackgroundPressed),
                color: Theme.Value(SemanticColor.PrimaryButtonTextPressed),
            },

        },
        CommandButtonBase.BaseCommandButtonStyle);

    public static CommandBarButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            Padding: "8px",            
            Foreground: ThemeColor.NeutralSecondary,
            Background: "transparent",
            BorderBrush: "transparent",
            BorderThickness: "1px",
            IconForeground: SemanticColor.MenuIcon,
            Template: new ControlTemplate((templatedParent: CommandButton) =>
            (
                <CommandBarButton
                    styles={{                        
                        label: {                            
                            color: templatedParent.Foreground,
                            fontWeight: templatedParent.state.FontWeight,
                        },
                        icon: {
                            color: templatedParent.IconForeground,
                            fontSize: templatedParent.IconSize,
                            margin: "-5px 0px -5px 4px",                            
                        },                        
                        root: {
                            borderWidth: templatedParent.state.BorderThickness,
                            borderColor: templatedParent.BorderBrush,
                            background: templatedParent.Background,                            
                            padding: templatedParent.state.Padding,
                            borderStyle: "solid"
                        },
                    }}
                    style={{
                        fontFamily: templatedParent.FontFamily,
                        padding: templatedParent.state.Padding,                        
                    }}
                    onClick={(e) => templatedParent.OnClick(e.nativeEvent)}
                    iconProps={{
                        iconName: CommandButton.ModelIconConverter(templatedParent.state.Icon)
                    }}
                    text={templatedParent.ActualLabel}
                    disabled={!templatedParent.state.IsEnabled}
                    menuProps={templatedParent.menuProps}/>
            )),
        },
        {
            "@ .ms-Button:hover": {
                backgroundColor: Theme.Value(SemanticColor.ButtonBackgroundHovered),
                borderColor: Theme.Value(SemanticColor.ButtonBackgroundHovered),
                color: Theme.Value(SemanticColor.ButtonTextHovered),
            },
            "@ .ms-Icon:hover": {
                color: Theme.Value(SemanticColor.ButtonTextHovered),
            },
            "@ .ms-Button:active": {
                background: Theme.Value(SemanticColor.ButtonBackgroundPressed),
                borderColor: Theme.Value(SemanticColor.ButtonBackgroundPressed),
                color: Theme.Value(SemanticColor.ButtonTextPressed),
            },
            [Control.DisabledElement("ms-Button")]: {
                //background: Theme.Value(SemanticColor.ButtonBackgroundDisabled),
                border: Theme.Value(SemanticColor.ButtonBorderDisabled),
                borderColor: 'transparent',
                borderStyle: "solid",
                borderWidth: "1px"
            },
            [Control.DisabledElement("ms-Button-label")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText),
            },
        },
        CommandButtonBase.BaseCommandButtonStyle);

    public static IconButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            Padding: "8px 5px 8px 5px",
            Background: "transparent",
            IconForeground: SemanticColor.InputIcon,
            Template: new ControlTemplate((templatedParent: CommandButton) =>
            (
                <IconButton
                    styles={{                        
                        root: {
                            background: templatedParent.Background,
                            color: templatedParent.IconForeground,
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
                            color: templatedParent.IconForeground,
                            fontSize: "16px"
                        },
                        menuIcon: {
                            margin: "-5px 0px -5px 4px",
                            color: templatedParent.IconForeground,
                            fontSize: templatedParent.IconSize - 2
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
        },
        {
            "@ .ms-Button:hover": {
                background: Theme.Value(SemanticColor.ButtonBackgroundHovered),
                borderColor: Theme.Value(SemanticColor.ButtonBackgroundHovered),
                color: Theme.Value(SemanticColor.InputIconHovered),
            },
            "@:hover .ms-Button-menuIcon,@:hover .ms-Button-icon": {
                color: Theme.Value(SemanticColor.InputIconHovered),
            },
            "@ .ms-Button:active": {
                background: Theme.Value(SemanticColor.ButtonBackgroundPressed),
                borderColor: Theme.Value(SemanticColor.ButtonBackgroundPressed),
                color: Theme.Value(SemanticColor.InputIcon),
            },
            "@:active .ms-Button-menuIcon,@:active .ms-Button-icon": {
                color: Theme.Value(SemanticColor.InputIcon),
            },
            [Control.DisabledElement("ms-Button")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText),
            },
        },
        CommandButton.BaseCommandButtonStyle);

    public static CircleButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            Padding: "0px",
            FontSize: FontStyle.Glyph1x,
            Template: new ControlTemplate((templatedParent: CommandButton) =>
            {
                return (
                    <Panel>
                        <Ellipse
                            HorizontalAlignment={HorizontalAlignment.Center}
                            VerticalAlignment={VerticalAlignment.Center}
                            Fill={templatedParent.Background}
                            Width={32} Height={32} />
                        <Glyph
                            HorizontalAlignment={HorizontalAlignment.Center}
                            VerticalAlignment={VerticalAlignment.Center}
                            Overlaps={true}
                            FontSize={templatedParent.FontSize}
                            Foreground={templatedParent.Foreground}
                            Icon={templatedParent.state.Icon} />
                    </Panel>);
            }),
            Foreground: "white"
        },
        {
            "@": {
                cursor: "pointer"
            }
        },
        CommandButtonBase.BaseCommandButtonStyle
    );

    public static DefaultStyle = CommandButton.PrimaryButtonStyle;

    public static ModelIconConverter(icon: string | number | undefined): string | undefined
    {
        if (typeof (icon) == "string")
            return icon;
        return (!icon) ? undefined : icon.toString(16);
    }
}

export class IconCommandButton extends CommandButtonBase<ICommandButtonProps, ICommandButtonState> {
    public static DefaultStyle = CommandButton.IconButtonStyle;
}