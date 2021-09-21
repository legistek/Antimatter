import * as React from 'react';
import { Antimatter, Binding, BindingParameters, ModelObjectReference, ModelValue, RelativeSourceMode } from '@antimatterjs/react';
import { Checkbox as FluentCheckBox, DefaultButton, CommandButton as FluentCommandButton, PrimaryButton, CommandBarButton, IconButton, ICommandBarItemProps, IContextualMenuItemProps, IContextualMenuProps, IContextualMenuItem, IButtonStyles, HighContrastSelector, labelProperties, List } from '@fluentui/react'

import { Style, TemplateProp, WebStyle } from '../Style';
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
    IconSize?: string | FontStyle | Binding,
    IconForeground?: string | ThemeColor | SemanticColor | Binding,
    Label?: string | Binding,
    IsDefault?: boolean | Binding,
    SecondaryCommandsSource?: any[] | Binding,
    AllCapsLabel?: boolean,
}
export interface ICommandButtonState extends IButtonBaseState
{
}

export class CommandButtonBase<P extends ICommandButtonProps = {}, S extends ICommandButtonState = {}>
    extends ButtonBase<P, S>
{
    public static DefaultBindings = {
        FontSize: {
            Converter: (size) => typeof (size) === "number" ? `${size}px` : size
        }
    };

    private static BaseCommandButtonProps: ICommandButtonProps = {
        HorizontalAlignment: HorizontalAlignment.Left,
        AllCapsLabel: true,
        FontWeight: "bold",
        FontSize: FontStyle.SmallPlus,
        IconSize: "16px",
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
                borderStyle: "solid",
                height: "auto",
                background: TemplateProp(nameof<ICommandButtonProps>(p => p.Background)),
                borderColor: TemplateProp(nameof<ICommandButtonProps>(p => p.BorderBrush)),
                borderWidth: TemplateProp(nameof<ICommandButtonProps>(p => p.BorderThickness)),
                padding: TemplateProp(nameof<ICommandButtonProps>(p => p.Padding))
            },
            "@ .ms-Button:hover": {
                borderWidth: TemplateProp(nameof<ICommandButtonProps>(p => p.BorderThickness)),
                background: Theme.Value(SemanticColor.PrimaryButtonBackgroundHovered),
                borderColor: Theme.Value(SemanticColor.PrimaryButtonBackgroundHovered),
                color: Theme.Value(SemanticColor.PrimaryButtonTextHovered),
            },
            "@ .ms-Button:active": {
                borderWidth: TemplateProp(nameof<ICommandButtonProps>(p => p.BorderThickness)),
                background: Theme.Value(SemanticColor.PrimaryButtonBackgroundPressed),
                borderColor: Theme.Value(SemanticColor.PrimaryButtonBackgroundPressed),
                color: Theme.Value(SemanticColor.PrimaryButtonTextPressed),
            },
            "@ .ms-Button-label": {
                lineHeight: "unset",
                fontWeight: TemplateProp(nameof<ICommandButtonProps>(p => p.FontWeight)),
                color: TemplateProp(nameof<ICommandButtonProps>(p => p.Foreground)),
                fontFamily: TemplateProp(nameof<ICommandButtonProps>(p => p.FontFamily)),
                fontSize: TemplateProp(nameof<ICommandButtonProps>(p => p.FontSize))
            },
            "@ .ms-Button-icon": {
                color: TemplateProp(nameof<ICommandButtonProps>(p => p.IconForeground)),
                margin: "-5px 0px -5px 4px",
                fontSize: TemplateProp(nameof<ICommandButtonProps>(p => p.IconSize))
            },
            "@ .ms-Button-menuIcon": {
                margin: "-5px 4px -5px 0px",
                color: TemplateProp(nameof<ICommandButtonProps>(p => p.IconForeground)),
                fontSize: "14px"
            },
            [Control.DisabledElement("ms-Button")]: {
                background: Theme.Value(SemanticColor.PrimaryButtonBackgroundDisabled),
                border: Theme.Value(SemanticColor.PrimaryButtonBackgroundDisabled),
                borderWidth: "1px",
                borderStyle: "solid"
            },
            [Control.DisabledElement("ms-Button-label")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText),
            }
        }
    );

    public get SecondaryCommandsSource(): any[] | undefined
    {
        return this.GetValue(nameof(this.props.SecondaryCommandsSource));
    }

    public get Icon(): number | string | undefined
    {
        return this.GetValue(nameof(this.props.Icon));
    }

    public get AllCapsLabel(): boolean
    {
        return this.GetValue(nameof(this.props.AllCapsLabel));
    }

    public get Label(): string | undefined
    {
        return this.GetValue(nameof(this.props.Label));
    }

    public get IsDefault(): boolean
    {
        return this.GetValue(nameof(this.props.IsDefault), false);
    }

    public get IconForeground(): string | undefined
    {
        return this.GetValue(nameof(this.props.IconForeground), Theme.Value(SemanticColor.PrimaryButtonText));
    }

    public get IconSize(): number
    {
        return this.GetValue(nameof(this.props.IconSize), Theme.Value(FontStyle.Glyph1x));
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

        const items = this.SecondaryCommandsSource ?? [];
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
        return this.AllCapsLabel
            ? this.Label?.toUpperCase()
            : this.Label;
    }

    override constructClasses()
    {
        return super.constructClasses() + (this.IsDefault ? " btn-default " : "");
    }
}

export class CommandButton extends CommandButtonBase<ICommandButtonProps, ICommandButtonState>
{
    public static DialogButtonStyle = new WebStyle<ICommandButtonProps>(
        {            
            IsDefault: new Binding({ Path: "IsDefault", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
            Padding: "8px",
            // Margin: "0px 5px",
            Template: new ControlTemplate((templatedParent: CommandButtonBase<ICommandButtonProps, ICommandButtonState>) =>
                templatedParent.IsDefault
                    ? (<PrimaryButton
                        styles={{
                            label: {
                                color: templatedParent.Foreground || Theme.Value(SemanticColor.PrimaryButtonText),
                            },
                            root: {
                                borderColor: templatedParent.BorderBrush || Theme.Value(SemanticColor.PrimaryButtonBackground),
                                background: templatedParent.Background || Theme.Value(SemanticColor.PrimaryButtonBackground),
                                padding: templatedParent.Padding
                            }
                        }}
                        onClick={(e) => templatedParent.OnClick(e.nativeEvent)}
                        disabled={!templatedParent.IsEnabled}
                        menuProps={templatedParent.menuProps}>
                        {templatedParent.ActualLabel}
                    </PrimaryButton>)
                    : (<DefaultButton                        
                        onClick={(e) => templatedParent.OnClick(e.nativeEvent)}
                        disabled={!templatedParent.state.IsEnabled}
                        menuProps={templatedParent.menuProps}>
                        {templatedParent.ActualLabel}
                    </DefaultButton>))
        },
        {
            "@ .ms-Button": {
                minWidth: "90px",
                color: Theme.Value(SemanticColor.ButtonText),
                background: Theme.Value(SemanticColor.ButtonBackground),
                borderColor: Theme.Value(SemanticColor.ButtonBorder),
            },
            "@ .ms-Button:hover": {
                color: Theme.Value(SemanticColor.ButtonTextHovered),
                background: Theme.Value(SemanticColor.ButtonBackgroundHovered),
                borderColor: Theme.Value(SemanticColor.InputBorderHovered),
            },
            "@.btn-default .ms-Button": {
                color: Theme.Value(SemanticColor.PrimaryButtonText),
                background: Theme.Value(SemanticColor.PrimaryButtonBackground),
                borderColor: Theme.Value(SemanticColor.PrimaryButtonBackground)
            },
            "@.btn-default .ms-Button:hover": {
                color: Theme.Value(SemanticColor.PrimaryButtonTextHovered),
                background: Theme.Value(SemanticColor.PrimaryButtonBackgroundHovered),
                borderColor: Theme.Value(SemanticColor.PrimaryButtonBackgroundHovered),
            },
            "@.btn-default .ms-Button:active": {
                background: Theme.Value(SemanticColor.PrimaryButtonBackgroundPressed),
                borderColor: Theme.Value(SemanticColor.PrimaryButtonBackgroundPressed),
            },
            [Control.DisabledElement("ms-Button", "@.btn-default")]: {
                background: Theme.Value(SemanticColor.PrimaryButtonBackgroundDisabled),
                borderColor: Theme.Value(SemanticColor.PrimaryButtonBackgroundDisabled),
            }
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
                        iconName: CommandButton.ModelIconConverter(templatedParent.Icon)
                    }}
                    disabled={!templatedParent.IsEnabled}
                    menuProps={templatedParent.menuProps}>
                    {templatedParent.ActualLabel}
                </PrimaryButton>
            ))
        },
        {},
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
                    onClick={(e) => templatedParent.OnClick(e.nativeEvent)}
                    iconProps={{
                        iconName: CommandButton.ModelIconConverter(templatedParent.Icon)
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
            [Control.DisabledElement("ms-Icon")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText)
            }
        },
        CommandButtonBase.BaseCommandButtonStyle);

    public static IconButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            Padding: "8px 5px 8px 5px",
            Background: "transparent",
            BorderBrush: "transparent",
            IconForeground: SemanticColor.InputIcon,
            Template: new ControlTemplate((templatedParent: CommandButton) =>
            (
                <IconButton
                    styles={{                        
                        root: {
                            background: templatedParent.Background,
                            color: templatedParent.IconForeground,
                            width: "fit-content",
                            padding: templatedParent.Padding,
                            height: "fit-content"                            
                        },
                        flexContainer: {
                            height: "fit-content",
                            margin: "0px"
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
                        iconName: CommandButton.ModelIconConverter(templatedParent.Icon)
                    }}
                    disabled={templatedParent.state.IsEnabled === false}
                    menuProps={templatedParent.menuProps}>
                </IconButton>
            )),
        },
        {
            "@ .ms-Button-icon": {
                margin: "0px",
                height: "fit-content",
            },
            "@ .ms-Button-menuIcon": {
                margin: "-5px 0px -5px 4px",
            },
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
                background: "transparent",
                borderColor: "transparent",
            },
            [Control.DisabledElement("ms-Button-icon")]: {
                color: Theme.Value(SemanticColor.DisabledText)
            },
            [Control.DisabledElement("ms-Button-menuIcon")]: {
                color: Theme.Value(SemanticColor.DisabledText)
            }
        },
        CommandButton.BaseCommandButtonStyle);

    public static CircleButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            Padding: "0px",
            FontSize: FontStyle.Glyph1x,            
            Template: new ControlTemplate((tp: CommandButton) =>
            {
                return (
                    <Panel>
                        <Ellipse
                            ClassName="btn-ellipse"
                            HorizontalAlignment={HorizontalAlignment.Center}
                            VerticalAlignment={VerticalAlignment.Center}                            
                            Width={32} Height={32} />
                        <Glyph
                            HorizontalAlignment={HorizontalAlignment.Center}
                            VerticalAlignment={VerticalAlignment.Center}
                            Overlaps={true}
                            FontSize={TemplateProp("FontSize")}
                            Foreground={TemplateProp("Foreground")}
                            Icon={tp.Icon} />
                    </Panel>);
            }),
            Foreground: "white"
        },
        {
            "@": {
                cursor: "pointer"
            },
            "@ .btn-ellipse": {
                color: TemplateProp(nameof<ICommandButtonProps>(p => p.Foreground)),
                background: TemplateProp(nameof<ICommandButtonProps>(p => p.Background)),
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