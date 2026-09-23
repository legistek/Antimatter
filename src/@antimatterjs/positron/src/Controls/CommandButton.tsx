import * as React from 'react';
import { Antimatter, Binding, BindingParameters, ModelObjectReference, RelativeSourceMode } from '@antimatterjs/react';
import { Checkbox as FluentCheckBox, DefaultButton, CommandButton as FluentCommandButton, PrimaryButton, CommandBarButton, IconButton, ICommandBarItemProps, IContextualMenuItemProps, IContextualMenuProps, IContextualMenuItem, IButtonStyles, HighContrastSelector, labelProperties, List, ActionButton, IButtonProps } from '@fluentui/react'

import { Style, TemplateProp, WebStyle } from '../Style';
import { ButtonBase, IButtonBaseProps, IButtonBaseState } from './Primitives/ButtonBase';
import { ControlTemplate } from '../FrameworkTemplate';
import { HorizontalAlignment, Orientation, VerticalAlignment } from '../Enums';
import { Ellipse } from '../Shapes/Ellipse';
import { Panel } from './Panel';
import { Glyph } from './Glyph';
import { FontStyle, ThemeColor, SemanticColor, Theme, ThemeEffect, ThemeLayout } from '../Theme';
import { Control, IControlProps } from './Control';
import { ContentPresenter } from './ContentPresenter';
import { StackPanel } from './StackPanel';
import { TextBlock } from './TextBlock';
import { Separator } from './Separator';
import { ContextMenuPanel } from './ContextMenu';
import { Grid } from './Grid';

export interface ICommandButtonProps extends IButtonBaseProps
{
    children?: React.ReactNode;
    Icon?: number | string | Binding,
    IconSize?: string | FontStyle | Binding,
    IconForeground?: string | ThemeColor | SemanticColor | Binding,
    IsShaking?: boolean | Binding,
    Label?: string | Binding,
    IsDefault?: boolean | Binding,
    HideDropdownButton?: boolean,
    AllCapsLabel?: boolean,
    IsActive?: boolean | Binding,
    IsActiveForeground?: string | ThemeColor | SemanticColor | Binding,
    IsActiveIndocator?: boolean | Binding,
    CommandBarOrientation?: Orientation,
    ForceShowDropdownButton?: boolean | Binding,
}
export interface ICommandButtonState extends IButtonBaseState
{
}

export class CommandButtonBase<P extends ICommandButtonProps = {}, S extends ICommandButtonState = {}>
    extends ButtonBase<P, S>
{
    public static readonly CLASS_NoIcon: string = Antimatter.Identifier("btn-no-icon");

    public static DefaultBindings = {
        FontSize: {
            Converter: (size) => typeof (size) === "number" ? `${size}px` : size
        }
    };

    constructor(props)
    {
        super(props);
        this.OnRenderMenuIcon = this.OnRenderMenuIcon.bind(this);
    }

    public OnRenderMenuIcon(): JSX.Element
    {
        if (!this.ContextMenuCommands || this.HideDropdownButton)
            return <></>;
        else
            return <Glyph
                Foreground={this.IconForeground}
                HorizontalAlignment={HorizontalAlignment.Left}
                VerticalAlignment={VerticalAlignment.Center}
                Margin={ThemeLayout.MarginSmallR}
                Icon="ChevronDownMed" />;
    }

    private static BaseCommandButtonProps: ICommandButtonProps = {
        HorizontalAlignment: HorizontalAlignment.Left,
        AllCapsLabel: false,
        FontWeight: "bold",
        FontSize: FontStyle.SmallPlus,
        IconSize: "16px",
        FontFamily: FontStyle.FontFamily,
        BorderThickness: "0px",
        OnClick: (e, target) => (target as ButtonBase).OnClick(e),
        TeachingBubbleParams: new Binding({ Path: "Tip", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
        IsVisible: new Binding({ Path: "Visibility", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command", FallbackValue: true }),
        ToolTip: new Binding({ Path: "ToolTip", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
        IsEnabled: new Binding({ Path: "IsEnabled", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command", FallbackValue: true }),
        Icon: new Binding({ Path: "Icon", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
        Label: new Binding({ Path: "Name", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
        IsActive: new Binding({ Path: "IsChecked", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
        IsActiveForeground: new Binding({ Path: "IsCheckedColor", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
    };

    public static BaseCommandButtonStyle: WebStyle<ICommandButtonProps> = new WebStyle<ICommandButtonProps>(
        CommandButtonBase.BaseCommandButtonProps,
        {
            "@ .ms-Button": {
                borderStyle: "solid",
                height: "auto",
                borderRadius: TemplateProp(nameof<ICommandButtonProps>(p => p.BorderRadius)),
                background: TemplateProp(nameof<ICommandButtonProps>(p => p.Background)),
                borderColor: TemplateProp(nameof<ICommandButtonProps>(p => p.BorderBrush)),
                borderWidth: TemplateProp(nameof<ICommandButtonProps>(p => p.BorderThickness)),
                padding: TemplateProp(nameof<ICommandButtonProps>(p => p.Padding)),
                transitionProperty: "background",
                transitionDuration: Theme.Value(ThemeEffect.HoverTransitionTime)
            },
            "@:hover": {
                background: Theme.Value(SemanticColor.ButtonBackgroundHovered),                
            },
            "@:active": {
                background: Theme.Value(SemanticColor.ButtonBackgroundPressed),                
            },
            "@:hover .ms-Button": {
                borderColor: Theme.Value(SemanticColor.ButtonBackgroundHovered),
                borderWidth: TemplateProp(nameof<ICommandButtonProps>(p => p.BorderThickness)),
                color: Theme.Value(SemanticColor.ButtonTextHovered),
            },
            "@ .ms-Button:active": {
                borderWidth: TemplateProp(nameof<ICommandButtonProps>(p => p.BorderThickness)),
                borderColor: Theme.Value(SemanticColor.ButtonBackgroundPressed),
                color: Theme.Value(SemanticColor.ButtonTextPressed),
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
                fontWeight: "normal",
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
                borderWidth: "0px",
                borderStyle: "solid"
            },
            [Control.DisabledElement("ms-Button-label")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText),
            },
            "@.amx-ptn-ha-stretch .ms-Button": {
                width: "100%"
            }
        }
    );

    public get HideDropdownButton(): boolean
    {
        return this.GetValue(nameof(this.props.HideDropdownButton), false);
    }

    public get ForceShowDropdownButton(): boolean
    {
        return this.GetValue(nameof(this.props.ForceShowDropdownButton), false);
    }

    public get IsShaking(): boolean
    {
        return this.GetValue(nameof(this.props.IsShaking), false);
    }

    public get CommandBarOrientation(): Orientation
    {
        return this.GetValue(nameof(this.props.CommandBarOrientation), Orientation.Horizontal);
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

    public get IsActiveIndocator(): boolean
    {
        return this.GetValue(nameof(this.props.IsActiveIndocator), false);
    }

    public get IsDefault(): boolean
    {
        return this.GetValue(nameof(this.props.IsDefault), false);
    }

    public get IconForeground(): string | undefined
    {
        if (this.IsActive) {
            const override = this.GetValue(nameof(this.props.IsActiveForeground), null);
            if (override)
                return override;
        }

        return this.GetValue(nameof(this.props.IconForeground), Theme.Value(SemanticColor.PrimaryButtonText));
    }

    public get IconSize(): string
    {
        return this.GetValue(nameof(this.props.IconSize), Theme.Value(FontStyle.Glyph1x));
    }

    public get IsActive(): boolean | undefined
    {
        return this.GetValue(nameof(this.props.IsActive));
    }

    override constructClasses()
    {
        const noIcon: boolean = !this.Icon || this.Icon == 0;

        return super.constructClasses()
            + (this.AllCapsLabel ? " amx-ptn-btn-allcaps " : "")
            + (this.IsDefault ? " btn-default " : "")
            + (this.IsShaking ? " amx-ptn-animate-shake " : "")
            + (noIcon ? ` ${CommandButtonBase.CLASS_NoIcon}` : '');
    }
}

export class CommandButton extends CommandButtonBase<ICommandButtonProps, ICommandButtonState>
{
    public static DialogButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            IsDefault: new Binding({ Path: "IsDefault", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
            Padding: "8px 4px",
            // Margin: "0px 5px",
            Template: new ControlTemplate((templatedParent: CommandButtonBase<ICommandButtonProps, ICommandButtonState>) =>
                templatedParent.IsDefault
                    ? (<PrimaryButton
                        autoFocus={false}
                        styles={{
                            label: {
                                color: templatedParent.Foreground || Theme.Value(SemanticColor.PrimaryButtonText),
                            },
                            root: {
                                borderColor: templatedParent.BorderBrush || Theme.Value(SemanticColor.PrimaryButtonBackground),
                                background: templatedParent.Background || Theme.Value(SemanticColor.PrimaryButtonBackground),
                                padding: templatedParent.Padding
                            },
                            menuIcon: {
                                display: templatedParent.HideDropdownButton ? "none" : undefined
                            }
                        }}
                        onRenderMenuIcon={templatedParent.OnRenderMenuIcon}
                        //onClick={(e) => templatedParent.OnClick(e as any)}
                        disabled={!templatedParent.IsEnabled}>
                        {templatedParent.Label}
                    </PrimaryButton>)
                    : (<DefaultButton
                        autoFocus={false}
                        onRenderMenuIcon={templatedParent.OnRenderMenuIcon}
                        //onClick={(e) => templatedParent.OnClick(e as any)}
                        disabled={!templatedParent.IsEnabled}>
                        {templatedParent.Label}
                    </DefaultButton>))
        },
        {
            "@ .ms-Button": {
                minWidth: "90px",
                color: Theme.Value(SemanticColor.PrimaryButtonBackground),
                background: Theme.Value(SemanticColor.ButtonBackground),
                borderColor: "transparent",
            },
            "@ .ms-Button:hover": {
                color: Theme.Value(SemanticColor.PrimaryButtonBackground),
                background: Theme.Value(SemanticColor.ButtonBackgroundHovered),
                borderColor: "transparent" //
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

    public static DialogButtonGroupedStyle = new WebStyle<ICommandButtonProps>(
        {
            Margin: "0px 5px"
        },
        {
        },
        CommandButton.DialogButtonStyle
    )

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
                    tabIndex={templatedParent.state.TabIndex}
                    autoFocus={false}
                    onRenderMenuIcon={templatedParent.OnRenderMenuIcon}
                    //onClick={(e) => templatedParent.OnClick(e as any)}
                    iconProps={{
                        iconName: CommandButton.ModelIconConverter(templatedParent.Icon)
                    }}
                    styles={{
                        menuIcon: {
                            display: templatedParent.HideDropdownButton ? "none" : undefined
                        },
                        icon: {
                            display: !templatedParent.Icon ? "none" : undefined,
                        }
                    }}
                    disabled={!templatedParent.IsEnabled}>
                    {templatedParent.Label}
                </PrimaryButton>
            ))
        },
        {},
        CommandButtonBase.BaseCommandButtonStyle);

    public static CommandBarButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            Padding: "8px 0px",
            Foreground: ThemeColor.NeutralPrimaryAlt,
            Background: "transparent",
            BorderBrush: "transparent",
            //FontWeight: "normal",
            BorderThickness: "0px",
            IconForeground: SemanticColor.MenuIcon,
            VerticalAlignment: VerticalAlignment.Center,
            Template: new ControlTemplate((templatedParent: CommandButton) =>
            {
                return (
                    <CommandBarButton
                        autoFocus={false}
                        onRenderMenuIcon={templatedParent.OnRenderMenuIcon}
                        //onClick={(e) => templatedParent.OnClick(e as any)}
                        iconProps={{
                            iconName: CommandButton.ModelIconConverter(templatedParent.Icon)
                        }}
                        text={templatedParent.Label}
                        disabled={!templatedParent.IsEnabled}
                        styles={{
                            menuIcon: {
                                display: templatedParent.HideDropdownButton ? "none" : undefined
                            }
                        }}
                    />
                )
            }),
        },
        {
            "@ .ms-Button": {
                borderRadius: TemplateProp(nameof<ICommandButtonProps>(p => p.BorderRadius)),
            },
            "@ .ms-Button:hover": {
                backgroundColor: Theme.Value(SemanticColor.ButtonBackgroundHovered),
                borderColor: Theme.Value(SemanticColor.ButtonBackgroundHovered),
                color: Theme.Value(SemanticColor.ButtonTextHovered),
            },
            "@ .ms-Button:hover .ms-Button-icon": {
                color: TemplateProp(nameof<ICommandButtonProps>(p => p.IconForeground)),
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
                background: "transparent",
                borderColor: "transparent"
            },
            [Control.DisabledElement("ms-Icon")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText)
            }
        },
        CommandButtonBase.BaseCommandButtonStyle);

    public static SecondaryButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            Foreground: SemanticColor.PrimaryButtonBackground,
            IconForeground: SemanticColor.PrimaryButtonBackground
        },
        {},
        CommandButton.CommandBarButtonStyle);

    public static LargeIconButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            Template: new ControlTemplate((templatedParent: CommandButton) =>
            {
                var isSeparator = templatedParent.BindState({
                    Source: templatedParent.Command,
                    Path: "IsSeparator"
                }) as boolean;
                if (isSeparator)
                {
                    return <Separator Orientation={templatedParent.CommandBarOrientation} />
                }
                else
                {
                    var button = (
                        <StackPanel
                            HorizontalAlignment={templatedParent.HorizontalContentAlignment}
                            Grid={{ Column: templatedParent.IsActiveIndocator ? 1 : 0 }}
                            ClassName="ms-Button"
                            Padding={templatedParent.Padding}
                            ItemSpacing={ThemeLayout.MarginSmallB}
                            MaxWidth={88}
                            Orientation={Orientation.Vertical}>
                            <Glyph
                                HorizontalAlignment={templatedParent.HorizontalContentAlignment}
                                ClassName="ms-Button-icon"
                                FontSize={templatedParent.IconSize}
                                Foreground={templatedParent.IconForeground}
                                Icon={templatedParent.Icon} />
                            <TextBlock
                                MaxLines="3"
                                HorizontalAlignment={templatedParent.HorizontalContentAlignment}
                                ClassName="ms-Button-label"                                
                                Text={templatedParent.Label} />
                        </StackPanel>
                    );
                    if (templatedParent.IsActiveIndocator)
                    {
                        return (
                            <Grid ColumnDefinitions={[Grid.ColumnDefinition(2), Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}>
                                {
                                    templatedParent.IsActive &&
                                    <Panel
                                        Background={templatedParent.IconForeground} />
                                }
                                {button}
                                {
                                    (templatedParent.ContextMenuCommands ||
                                        templatedParent.ForceShowDropdownButton) &&
                                    <Glyph
                                        Grid={{ Column: 1 }}
                                        Icon={"CaretSolidRight"}
                                        FontSize={FontStyle.GlyphPt75x}
                                        HorizontalAlignment={HorizontalAlignment.Right}
                                        Opacity={0.5}
                                        VerticalAlignment={VerticalAlignment.Center}
                                        Foreground={templatedParent.IconForeground}
                                    />
                                }
                            </Grid>)
                    }
                    else
                    {
                        return button;
                    }
                }
            }
            ),
            IconSize: FontStyle.Glyph1pt25x,
            BorderThickness: "0px",
            Padding: ThemeLayout.MarginSmall,
            IconForeground: SemanticColor.InputIcon,
            FontSize: FontStyle.Small,
            HorizontalContentAlignment: HorizontalAlignment.Center
        },
        {
            "@": {
                cursor: "pointer"
            },
            "@ .ms-Button-icon": {
                margin: "0px",
            },
            "@ .ms-Button-label": {
                textAlign: 'center',
                fontWeight: "normal",
                textTransform: "none"
            },
            [Control.DisabledElement("ms-Button")]: {
                background: "transparent",
                border: "transparent",
                borderWidth: "0px",
                borderStyle: "solid"
            },
            [Control.DisabledElement("ms-Button-icon") + " > i"]: {
                opacity: 0.5,
            },            
            //"@ .ms-Button:hover": {
            //    background: "unset",
            //    borderColor: "unset",
            //    color: "unset"
            //},
            //"@:hover": {
            //    background: Theme.Value(ThemeColor.NeutralLight),
            //    borderColor: Theme.Value(ThemeColor.NeutralLight),
            //    color: Theme.Value(SemanticColor.ButtonTextHovered),
            //},
        },
        CommandButtonBase.BaseCommandButtonStyle);

    public static IconButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            Padding: "8px 5px 8px 5px",
            Background: "transparent",
            BorderBrush: "transparent",
            IconForeground: SemanticColor.InputIcon,
            HideDropdownButton: true,
            ToolTip: new Binding({ Path: "ToolTipOrName", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
            Template: new ControlTemplate((templatedParent: CommandButton) =>
            {
                return (
                    <IconButton
                        autoFocus={false}
                        onRenderMenuIcon={templatedParent.OnRenderMenuIcon}
                        styles={{
                            root: {
                                background: templatedParent.Background,
                                color: templatedParent.IconForeground,
                                width: "fit-content",
                                padding: templatedParent.Padding,
                                height: "fit-content",
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
                            menuIcon: {
                                display: templatedParent.HideDropdownButton ? "none" : undefined
                            }
                        }}
                        //onClick={(e) => templatedParent.OnClick(e as any)}
                        iconProps={{
                            iconName: CommandButton.ModelIconConverter(templatedParent.Icon),
                            styles: {
                                root: {
                                    lineHeight: "normal"
                                }
                            }
                        }}
                        disabled={!templatedParent.IsEnabled}>
                    </IconButton>
                );
            }),
        },
        {
            "@ .ms-Button-icon": {
                margin: "0px",
                height: "fit-content",
                fontSize: TemplateProp(nameof<ICommandButtonProps>(p => p.IconSize)),
                color: 'unset'
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

    public static IconButtonTightStyle = new WebStyle<ICommandButtonProps>(
        {
            Padding: ThemeLayout.MarginSmallLTRB
        },
        undefined,
        this.IconButtonStyle);

    public static IconButtonDocToolbarStyle = new WebStyle<ICommandButtonProps>(
        {
            Padding: ThemeLayout.MarginSmallLTRB,
            //IconSize: FontStyle.Glyph1pt25x
        },
        undefined,
        this.IconButtonStyle);

    public static PrimaryButtonTightStyle = new WebStyle<ICommandButtonProps>(
        {
            FontSize: FontStyle.Small,
            Padding: ThemeLayout.StandardBorder
        },
        {
            "@ .ms-Button": {
                minWidth: "30px"
            }
        },
        this.PrimaryButtonStyle);

    public static ContentButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            Padding: "0px",
            OnClick: (e, target) => (target as ButtonBase).OnClick(e),
            ToolTip: new Binding({ Path: "ToolTipOrName", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
            TeachingBubbleParams: new Binding({ Path: "Tip", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
            IsVisible: new Binding({ Path: "Visibility", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command", FallbackValue: true }),
            IsEnabled: new Binding({ Path: "IsEnabled", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command", FallbackValue: true }),
            Template: new ControlTemplate(
                (templatedParent: CommandButton) =>
                (
                    <Panel
                        ClassName="PART_Container"
                        //OnClick={(e) => templatedParent.OnClick(e)}
                    >
                        {templatedParent.props.children}
                    </Panel>
                ))
        },
        {
            "@": {
                cursor: "pointer"
            },
            [`@ .PART_Container`]: {
                background: TemplateProp(nameof<IControlProps>(c => c.Background))
            },
            [Control.DisabledElement()]: {
                opacity: "50%",
            }
        });

    public static ContentButtonWithHoverStyle = new WebStyle<ICommandButtonProps>(
        {
        },
        {
            "@:hover .PART_Container": {
                background: Theme.Value(SemanticColor.ButtonBackgroundHovered),
                transition: Theme.Value(ThemeEffect.HoverTransitionTime),
            },
        },
        CommandButton.ContentButtonStyle
    );

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

    public static LinkButtonStyle = new WebStyle<ICommandButtonProps>(
        {
            Background: "transparent",
            BorderBrush: "transparent",
            Foreground: SemanticColor.Link,
            VerticalAlignment: VerticalAlignment.Center,
            AllCapsLabel: false,
            FontWeight: "normal",
            FontSize: FontStyle.SmallPlus,
            IconSize: FontStyle.Glyph1x,
            Margin: "0 4px 0 0",
            Template: new ControlTemplate((templatedParent: CommandButton) =>
            (
                <ActionButton
                    tabIndex={templatedParent.state.TabIndex}
                    autoFocus={false}
                    //onClick={(e) => { templatedParent.OnClick(e as any); e.stopPropagation(); } }
                    iconProps={{
                        iconName: CommandButton.ModelIconConverter(templatedParent.Icon)
                    }}
                    disabled={templatedParent.IsEnabled === false}
                    text={templatedParent.Label}
                />
            ))
        },
        {
            "@ .ms-Button": {
                color: Theme.Value(SemanticColor.Link),
                height: "unset",
                padding: 0
            },
            "@ .ms-Button-label": {
                color: TemplateProp(nameof<ICommandButtonProps>(p => p.Foreground)),
                fontSize: TemplateProp(nameof<ICommandButtonProps>(p => p.FontSize)),
                fontFamily: TemplateProp(nameof<ICommandButtonProps>(p => p.FontFamily)),
                fontWeight: TemplateProp(nameof<ICommandButtonProps>(p => p.FontWeight)),
                fontStyle: TemplateProp(nameof<ICommandButtonProps>(p => p.FontStyle)),
                margin: "0",
                textAlign: "left"
            },
            "@ .ms-Icon": {
                color: TemplateProp(nameof<ICommandButtonProps>(p => p.Foreground)),
                fontSize: TemplateProp(nameof<ICommandButtonProps>(p => p.IconSize)),
                fontFamily: TemplateProp(nameof<ICommandButtonProps>(p => p.FontFamily)),
                fontWeight: "normal",
                margin: Theme.Value(ThemeLayout.MarginSmallR)
            },
            [`@.${CommandButtonBase.CLASS_NoIcon} .ms-Icon`]: {
                margin: "0"
            },
            "@ .ms-Button:hover, @:hover .ms-Icon, @:hover .ms-Button-label": {
                color: Theme.Value(SemanticColor.LinkHovered),
                backgroundColor: 'transparent',
                borderColor: 'transparent'
            },
            "@ .ms-Button:active": {
                color: Theme.Value(SemanticColor.LinkHovered)
            },
            [Control.DisabledElement("ms-Button")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText),
                backgroundColor: 'transparent'
            },
            [Control.DisabledElement("ms-Icon")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText)
            }
        },
        CommandButtonBase.BaseCommandButtonStyle
    );

    public static DefaultStyle = CommandButton.PrimaryButtonStyle;

    public static ModelIconConverter(icon: string | number | undefined, fontSize?: any): string | undefined
    {
        if (typeof (icon) == "string")
            return icon;
        else if (typeof (icon) === "number")
        {
            if (icon === 0)
                return undefined;
            if (fontSize === undefined)
                return (icon as number).toString(16);
            var altNumber = Glyph.GetAltSize(fontSize, icon as number);
            if (altNumber !== undefined)
                return altNumber.toString(16);
            return (icon as number).toString(16);
        }
        return undefined;
    }    
}

export class IconCommandButton extends CommandButtonBase<ICommandButtonProps, ICommandButtonState> {
    public static DefaultStyle = CommandButton.IconButtonStyle;
}