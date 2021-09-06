import * as React from 'react';
import { Binding, RelativeSourceMode } from '@antimatterjs/react';
import { Checkbox as FluentCheckBox, DefaultButton, CommandButton as FluentCommandButton, PrimaryButton, CommandBarButton, IconButton, ICommandBarItemProps } from '@fluentui/react'

import { Style } from '../Style';
import { ButtonBase, IButtonBaseProps, IButtonBaseState } from './Primitives/ButtonBase';
import { ControlTemplate } from '../FrameworkTemplate';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';
import { Ellipse } from '../Shapes/Ellipse';
import { Panel } from './Panel';
import { Glyph } from './Glyph';

export interface ICommandButtonProps extends IButtonBaseProps
{
    Icon?: number | string | Binding,
    Label?: string | Binding,
    IsDefault?: boolean | Binding
}
export interface ICommandButtonState extends IButtonBaseState
{
    Icon?: number | string,
    Label?: string,
    IsDefault?: boolean
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
                            disabled={!templatedParent.state.IsEnabled}>
                            {templatedParent.state.Label}
                        </PrimaryButton>)
                        : (<DefaultButton
                            style={{ minWidth: "90px" }}
                            onClick={(e) => templatedParent.OnClick(e.nativeEvent)}
                            disabled={!templatedParent.state.IsEnabled}>
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
                        disabled={!templatedParent.state.IsEnabled}>
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
                        disabled={!templatedParent.state.IsEnabled}>

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
                        }}
                        onClick={(e) =>
                            templatedParent.OnClick(e.nativeEvent)}
                        iconProps={{
                            iconName: CommandButton.ModelIconConverter(templatedParent.state.Icon)
                        }}
                        disabled={templatedParent.state.IsEnabled === false}>
                    </IconButton>
                )),
            }
        ));

    public static CircleButtonStyle = new Style<ICommandButtonProps>(
        Object.assign(
            Object.assign({}, CommandButton.BaseCommandButtonProps),
            {                
                Template: new ControlTemplate((templatedParent: CommandButton) =>
                {
                    return (
                        <Panel>
                            <Ellipse
                                HorizontalAlignment={HorizontalAlignment.Center}
                                    VerticalAlignment={VerticalAlignment.Center}
                                    Fill={templatedParent.state.Background}
                                Width={40} Height={40} />
                            <Glyph
                                HorizontalAlignment={HorizontalAlignment.Center}
                                VerticalAlignment={VerticalAlignment.Center}
                                    Overlaps={true}
                                    FontSize={templatedParent.state.FontSize}
                                    Foreground={templatedParent.state.Foreground}
                                    Icon={templatedParent.state.Icon} />
                        </Panel>);
                }),
                Foreground: "white"
            }
        ),
        {
            Rules: {
                cursor: "pointer"
            }
        }
    );

    public static DefaultStyle = CommandButton.PrimaryButtonStyle;

    public static ModelIconConverter(icon: string | number | undefined): string | undefined
    {
        if (typeof (icon) == "string")
            return icon;
        return (!icon) ? undefined : icon.toString(16);
    }
}