import * as React from 'react';
import
    {
        Point,
        PrimaryButton,
        Target,


        IButtonProps,
        TeachingBubble as FluentTeachingBubble,
        IStyle,
        ITeachingBubbleStyles
    } from '@fluentui/react';
import { Binding, BindingMode, ModelObjectReference, RelativeSourceMode } from '@antimatterjs/react';
import { Orientation } from '@antimatterjs/positron/src/Enums';
import { FrameworkElement } from '@antimatterjs/positron/src/FrameworkElement';
import { ControlTemplate } from '@antimatterjs/positron/src/FrameworkTemplate';
import { Style } from '@antimatterjs/positron/src/Style';
import { ButtonBase } from '@antimatterjs/positron/src/Controls/Primitives/ButtonBase';
import { Control, IControlProps, IControlState } from '@antimatterjs/positron/src/Controls/Control';
import { StackPanel } from '@antimatterjs/positron/src/Controls/StackPanel';
import { CommandButton, CommandButtonWithProps, ICommandButtonProps, ICommandButtonState }
    from '@antimatterjs/positron/src/Controls/CommandButton';

export interface ITeachingBubbleProps extends IControlProps
{
    Params?: ModelObjectReference | Binding,
    IsOpen?: boolean | Binding,
    Target?: HTMLElement | (() => FrameworkElement | undefined | null) | null,
    HeaderText?: string | Binding,
    MessageText?: string | Binding,
    ShowCloseButton?: boolean | Binding,
    PrimaryCommand?: ModelObjectReference | Binding,
    ShowSecondaryButton?: boolean | Binding,
    CustomSecondaryCommand?: ModelObjectReference | Binding,
    SecondaryButtonText?: string | Binding
}
interface ITeachingBubbleState extends IControlState
{
    Params?: ModelObjectReference,
    IsOpen?: boolean,
    Target?: HTMLElement | (() => FrameworkElement | undefined | null) | null,
    HeaderText?: string,
    MessageText?: string,
    ShowCloseButton?: boolean,
    PrimaryCommand?: ModelObjectReference,
    ShowSecondaryButton?: boolean,
    CustomSecondaryCommand?: ModelObjectReference,
    SecondaryButtonText?: string
}

export class TeachingBubble extends Control<ITeachingBubbleProps, ITeachingBubbleState>
{
    //Used to allow this to be rendered by Control.tsx w/o an import declaration (which'd cause a circular ref error)
    public static PortableConstructor = (props: ITeachingBubbleProps) =>
    {
        return React.createElement(TeachingBubble, props);
    };

    public static DefaultBindings = {
        IsOpen: {
            Mode: BindingMode.TwoWay,
            FallbackValue: false
        }
    };

    public static BaseControlProps: ITeachingBubbleProps = {
        HeaderText: new Binding({
            Path: "HeaderText", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Params"
        }),
        MessageText: new Binding({
            Path: "MessageText", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Params"
        }),
        ShowCloseButton: new Binding({
            Path: "ShowCloseButton", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Params"
        }),
        PrimaryCommand: new Binding({
            Path: "PrimaryCommand", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Params"
        }),
        ShowSecondaryButton: new Binding({
            Path: "ShowSecondaryButton", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Params"
        }),
        CustomSecondaryCommand: new Binding({
            Path: "CustomSecondaryCommand", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Params"
        }),
        SecondaryButtonText: new Binding({
            Path: "SecondaryButtonText", RelativeSourceMode: RelativeSourceMode.Self, RelativeSource: "Params"
        })
    }

    static DefaultStyle: Style<ITeachingBubbleProps> = new Style<ITeachingBubbleProps>(
        Object.assign(
            Object.assign(TeachingBubble.BaseControlProps),
            {
                Template: new ControlTemplate((templatedParent: TeachingBubble) => templatedParent.Template)
            }
        )
    );

    private get Template(): JSX.Element
    {
        if (!this.state.IsOpen)
            return <></>;

        //Adjust buttons in the custom footer to look the same as the standard built-in buttons would (e.g., R-aligned)
        const footerStyle: IStyle =
        {
            justifyContent: 'flex-end'
        };
        //const fluentStyle : ITeachingBubbleStyles =
        const fluentStyle =
        {
            footer: footerStyle
        };

        const bubble: JSX.Element = (
            <FluentTeachingBubble
                target={this.FluentTarget}
                headline={this.state.HeaderText}
                footerContent={this.Footer}
                onDismiss={() => this.Close()}
                hasCloseButton={this.state.ShowCloseButton}
                styles={fluentStyle}
            >
                {this.state.MessageText}
            </FluentTeachingBubble>
        );
        return bubble;
    }

    private Close(): void
    {
        this.SetValue(nameof(this.state.IsOpen), false);
    }

    //Renders entire footer to use framework's button components in place of the buttons built into the fluent control
    private get Footer(): JSX.Element
    {
        return (
            <StackPanel Orientation={Orientation.Horizontal}>
                {this.SecondaryButton}
                {this.PrimaryButton}
            </StackPanel>
        );
    }

    private get PrimaryButton(): JSX.Element | null
    {
        if (!this.state.PrimaryCommand)
            return null;
        return (
            <CommandButtonWithProps
                Command={this.state.PrimaryCommand}
                Style={CommandButton.DialogButtonStyle}
            />
        );
    }

    private get SecondaryButton(): JSX.Element | null
    {
        if (!this.state.ShowSecondaryButton)
            return null;

        const style: Style<ICommandButtonProps> = CommandButton.PrimaryButtonStyle;
        if (this.state.CustomSecondaryCommand)
        {
            return (
                <CommandButtonWithProps
                    Command={this.state.CustomSecondaryCommand}
                    Style={style}
                />
            );
        }

        //Construct the default secondary button that dismisses the bubble
        return (
            <UnboundButton
                OnClickOverride={() => this.Close()}
                Label={this.state.SecondaryButtonText}
                Style={style}
            />
        );
    }

    private get FluentTarget(): Target
    {
        if (!this.state.Target)
            return null;
        if (this.state.Target instanceof HTMLElement)
            return this.state.Target as Target;
        else
            return this.state.Target()?.Container as Target;
    }
}

//Give Control class access to TeachingBubble on startup w/o causing any inscrutable circular reference errors
Control.TeachingBubbleConstructor = TeachingBubble.PortableConstructor;


interface IUnboundButtonProps extends ICommandButtonProps
{
    OnClickOverride?: () => void;
}
//CommandButton framework element modified to be compatible w/ client-side logic rather than bound commands
class UnboundButton extends CommandButton<IUnboundButtonProps, ICommandButtonState>
{
    public static DefaultBindings = {
        IsEnabled: {
            FallbackValue: true
        }
    };

    /* override */ OnClick(e?: MouseEvent): void
    {
        ButtonBase.LastMouseEvent = e;
        this.props.OnClickOverride?.call(this);
    }
}

export class TeachingBubbleParams
{

}