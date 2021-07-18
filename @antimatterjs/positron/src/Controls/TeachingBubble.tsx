import * as React from 'react';
import { Target, TeachingBubble as FluentTeachingBubble, IStyle } from '@fluentui/react';
import { Binding, BindingMode, ModelObjectReference, RelativeSourceMode } from '@antimatterjs/react';

import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { Style } from '../Style';
import { ControlTemplate } from '../FrameworkTemplate';
import { StackPanel } from './StackPanel';
import { Orientation } from '../Enums';
import { CommandButton, ICommandButtonProps, ICommandButtonState } from './CommandButton';
import { Control, IControlProps, IControlState } from './Control';

export interface ITeachingBubbleProps extends IFrameworkElementProps
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
interface ITeachingBubbleState extends IFrameworkElementState
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
                styles={fluentStyle}>
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
            <CommandButton
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
                <CommandButton
                    Command={this.state.CustomSecondaryCommand}
                    Style={style}
                />
            );
        }

        //Construct the default secondary button that dismisses the bubble
        return (
            <CommandButton
                Command={() => this.Close()}                
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

// Hideous ridiculous hack necessitated by Javascript stupidity
// in being unable to allow a base class to reference a subclass
Control.RenderTeachingBubble = (control: Control<IControlProps, IControlState>) : JSX.Element|null =>
{
    if (!control.state.TeachingBubbleParams)
        return null;

    return (<TeachingBubble
        Params={control.state.TeachingBubbleParams}
        IsOpen={new Binding(control.state.TeachingBubbleIsOpen)}
        Target={() => control} />);
};

// Not sure what this is for
export class TeachingBubbleParams
{
}