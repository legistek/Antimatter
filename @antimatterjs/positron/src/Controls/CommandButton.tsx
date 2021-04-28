import * as React from 'react';
import { Binding, RelativeSourceMode } from '@antimatterjs/react';
import { Checkbox as FluentCheckBox, DefaultButton, CommandButton as FluentCommandButton, PrimaryButton, CommandBarButton, IconButton } from '@fluentui/react'

import { Style } from '../Style';
import { ButtonBase, IButtonBaseProps, IButtonBaseState } from './Primitives/ButtonBase';
import { HorizontalAlignment } from '@antimatterjs/positron/src/Enums';

interface ICommandButtonCommon
{
}
export interface ICommandButtonProps extends IButtonBaseProps, ICommandButtonCommon
{
    Icon?: number | Binding,
    Label?: string | Binding,
    IsDefault?: boolean | Binding
}
export interface ICommandButtonState extends IButtonBaseState, ICommandButtonCommon
{
    Icon?: number,
    Label?: string,
    IsDefault?: boolean
}

export class CommandButton<P extends ICommandButtonProps = {}, S extends ICommandButtonState = {}>
    extends ButtonBase<P, S>
{
    private static BaseCommandButtonProps: ICommandButtonProps = {
        HorizontalAlignment: HorizontalAlignment.Left,
        Margin: "5px",
        ToolTip: new Binding({ Path: "ToolTip", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
        IsEnabled: new Binding({ Path: "IsEnabled", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
        Icon: new Binding({ Path: "Icon", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
        Label: new Binding({ Path: "Name", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" })        
    };

    public static DialogButtonStyle = new Style<ICommandButtonProps>(
        Object.assign(
            Object.assign({}, CommandButton.BaseCommandButtonProps),
            {
                IsDefault: new Binding({ Path: "IsDefault", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Command" }),
                Template: (templatedParent: CommandButton<ICommandButtonProps, ICommandButtonState>) =>
                    templatedParent.state.IsDefault
                        ? (<PrimaryButton
                            style={{ minWidth: "90px" }}
                            onClick={(e) => templatedParent.OnClick()}
                            disabled={!templatedParent.state.IsEnabled}>
                            {templatedParent.state.Label}
                          </PrimaryButton>)
                        : (<DefaultButton
                            style={{ minWidth: "90px" }}
                            onClick={(e) => templatedParent.OnClick()}
                            disabled={!templatedParent.state.IsEnabled}>
                            {templatedParent.state.Label}
                        </DefaultButton>)
            }
        ));
    
    public static PrimaryButtonStyle = new Style<ICommandButtonProps>(
        Object.assign(
            Object.assign({}, CommandButton.BaseCommandButtonProps),
            {
                Template: (templatedParent: CommandButton<ICommandButtonProps, ICommandButtonState>) =>
                (
                    <PrimaryButton
                        onClick={(e) => templatedParent.OnClick()}
                        iconProps={{
                            iconName: CommandButton.ModelIconConverter(templatedParent.state.Icon)
                        }}
                        disabled={!templatedParent.state.IsEnabled}>
                        {templatedParent.state.Label}
                    </PrimaryButton>
                )
            }
        ));

    public static CommandBarButtonStyle = new Style<ICommandButtonProps>(
        Object.assign(
            Object.assign({}, CommandButton.BaseCommandButtonProps),
            {                
                Padding: "8px 0px 8px 0px",
                Template: (templatedParent: CommandButton<ICommandButtonProps, ICommandButtonState>) =>
                (
                    <CommandBarButton
                        style={{
                            padding: templatedParent.state.Padding
                        }}
                        onClick={(e) => templatedParent.OnClick()}
                        iconProps={{
                            iconName: CommandButton.ModelIconConverter(templatedParent.state.Icon)
                        }}
                        text={templatedParent.state.Label}
                        disabled={!templatedParent.state.IsEnabled}>
                        
                    </CommandBarButton>
                ),                
            }
        ));

    public static IconButtonStyle = new Style<ICommandButtonProps>(
        Object.assign(
            Object.assign({}, CommandButton.BaseCommandButtonProps),
            {
                Padding: "8px 0px 8px 0px",
                Template: (templatedParent: CommandButton<ICommandButtonProps, ICommandButtonState>) =>
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
                                margin: "0px"
                            }
                        }}
                        onClick={(e) => templatedParent.OnClick()}
                        iconProps={{
                            iconName: CommandButton.ModelIconConverter(templatedParent.state.Icon)
                        }}
                        disabled={!templatedParent.state.IsEnabled}>
                    </IconButton>
                ),
            }
        ));

    public static DefaultStyle = CommandButton.PrimaryButtonStyle;

    public static ModelIconConverter(icon: number | undefined): string | undefined
    {
        return (!icon) ? undefined : icon.toString(16);
    }
}