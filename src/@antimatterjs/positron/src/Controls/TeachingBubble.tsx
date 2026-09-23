import * as React from 'react';
import { Target, TeachingBubble as FluentTeachingBubble, IStyle, DirectionalHint, ICalloutProps } from '@fluentui/react';
import { Binding, BindingMode, ModelObjectReference, RelativeSourceMode, Utilities } from '@antimatterjs/react';

import { FrameworkElement } from '../FrameworkElement';
import { WebStyle } from '../Style';
import { ControlTemplate } from '../FrameworkTemplate';
import { StackPanel } from './StackPanel';
import { HorizontalAlignment, Orientation, VerticalAlignment } from '../Enums';
import { CommandButton, ICommandButtonProps } from './CommandButton';
import { Control, IControlProps, IControlState } from './Control';
import { Theme, ThemeColor, ThemeLayout } from '../Theme';
import { Grid } from './Grid';


export const BubblePosition = DirectionalHint;

export interface ITeachingBubbleProps extends IControlProps
{
    Params?: ModelObjectReference | string | Binding,
    //IsOpen?: boolean | Binding,
    Target?: HTMLElement | (() => FrameworkElement | undefined | null) | null,
    HeaderText?: string | Binding,
    MessageText?: string | Binding,
    ShowCloseButton?: boolean | Binding,
    PrimaryCommand?: ModelObjectReference | Binding,
    ShowSecondaryButton?: boolean | Binding,
    CustomSecondaryCommand?: ModelObjectReference | Binding,
    SecondaryButtonText?: string | Binding,
    Delay?: number | Binding,
    Position?: DirectionalHint
}
interface ITeachingBubbleState extends IControlState
{
    Params?: ModelObjectReference | string,
    //IsOpen?: boolean,
    Target?: HTMLElement | (() => FrameworkElement | undefined | null) | null,
    HeaderText?: string,
    MessageText?: string,
    ShowCloseButton?: boolean,
    PrimaryCommand?: ModelObjectReference,
    ShowSecondaryButton?: boolean,
    CustomSecondaryCommand?: ModelObjectReference,
    SecondaryButtonText?: string,
    Delay?: number
}
const props: ITeachingBubbleProps = {};

export class TeachingBubble extends Control<ITeachingBubbleProps, ITeachingBubbleState>
{
    private _delayComplete: boolean = false;

    public static DefaultBindings = {
        IsOpen: {
            Mode: BindingMode.TwoWay,
            FallbackValue: false
        }
    };

    public static BaseControlProps: ITeachingBubbleProps = {
        Background: ThemeColor.ThemeDark,
        Overlaps: true,
        HorizontalAlignment: HorizontalAlignment.Left,
        VerticalAlignment: VerticalAlignment.Top,
        HeaderText: new Binding({
            Path: nameof(props.HeaderText),
            RelativeSourceMode: RelativeSourceMode.Self,
            RelativeSource: nameof(props.Params)
        }),
        MessageText: new Binding({
            Path: nameof(props.MessageText),
            RelativeSourceMode: RelativeSourceMode.Self,
            RelativeSource: nameof(props.Params)
        }),
        ShowCloseButton: new Binding({
            Path: nameof(props.ShowCloseButton),
            RelativeSourceMode: RelativeSourceMode.Self,
            RelativeSource: nameof(props.Params)
        }),
        PrimaryCommand: new Binding({
            Path: nameof(props.PrimaryCommand),
            RelativeSourceMode: RelativeSourceMode.Self,
            RelativeSource: nameof(props.Params)
        }),
        ShowSecondaryButton: new Binding({
            Path: nameof(props.ShowSecondaryButton),
            RelativeSourceMode: RelativeSourceMode.Self,
            RelativeSource: nameof(props.Params)
        }),
        CustomSecondaryCommand: new Binding({
            Path: nameof(props.CustomSecondaryCommand),
            RelativeSourceMode: RelativeSourceMode.Self,
            RelativeSource: nameof(props.Params)
        }),
        SecondaryButtonText: new Binding({
            Path: nameof(props.SecondaryButtonText),
            RelativeSourceMode: RelativeSourceMode.Self,
            RelativeSource: nameof(props.Params)
        }),
        Delay: new Binding({
            Path: nameof(props.Delay),
            RelativeSourceMode: RelativeSourceMode.Self,
            RelativeSource: nameof(props.Params)
        })
    }

    public get MessageText(): string | undefined
    {
        if (typeof (this.Params) === "string")
            return this.Params;
        return this.GetValue(nameof(this.props.MessageText), undefined);
    }
    public get Position(): DirectionalHint | undefined
    {
        return this.GetValue(nameof(this.props.Position), undefined);
    }
    public get Params(): ModelObjectReference | string | undefined
    {
        return this.GetValue(nameof(this.props.Params), undefined);
    }
    public get Delay(): number | undefined
    {
        return this.GetValue(nameof(this.props.Delay), undefined);
    }

    static DefaultStyle: WebStyle<ITeachingBubbleProps> = new WebStyle<ITeachingBubbleProps>(
        Object.assign(
            Object.assign(TeachingBubble.BaseControlProps),
            {
                Template: new ControlTemplate((templatedParent: TeachingBubble) => templatedParent.TemplateElem)
            }
        )
    );

    private get TemplateElem(): JSX.Element | null
    {
        var isOpen = this.BindState({
            Source: this.Params,
            Path: "IsOpen",
            Mode: BindingMode.TwoWay,
        }, "TeachingBubbleIsOpen") as boolean;

        if (!isOpen)
            return null;

        //if (this.Delay && !this._delayComplete)
        //{
        //    this.SetDisplayTimer();
        //    return null;
        //}

        //Adjust buttons in the custom footer to look the same as the standard built-in buttons would (e.g., R-aligned)
        const footerStyle: IStyle =
        {
            justifyContent: 'stretch'
        };
        const bodyStyle: IStyle =
        {
            marginBottom: 0,
            selectors: {
                ":not(:last-child)": {
                    marginBottom: 0
                }
            }
        };
        const calloutProps: ICalloutProps =
        {
            styles: {
                calloutMain: {
                    background: this.Background,
                },
                beak: {
                    background: this.Background,
                }
            },
            preventDismissOnResize: true,
            preventDismissOnScroll: true,
            preventDismissOnLostFocus: true,
            backgroundColor: this.Background,
            color: this.Background,
            directionalHint: this.Position,
            setInitialFocus: false  //Prevent focus interruptions on open (also requries focusTrapZoneProps)
        }

        const bubble: JSX.Element = (
            <FluentTeachingBubble
                target={this.FluentTarget}
                headline={this.state.HeaderText}
                footerContent={this.Footer}
                onDismiss={() => this.Close()}
                hasCloseButton={this.state.ShowCloseButton}
                calloutProps={calloutProps}
                styles={{
                    body: bodyStyle,
                    footer: footerStyle,
                    root: {
                        background: this.Background,
                    }
                }}
                focusTrapZoneProps={{
                    disabled: true  //Prevent default focus stealing on open (also requires callout's setInitialFocus)
                }}
            >
                {this.MessageText}
            </FluentTeachingBubble>
        );
        return bubble;
    }

    private async SetDisplayTimer(): Promise<void>
    {
        await Utilities.SleepAsync(this.Delay);
        this._delayComplete = true;
        this.InvalidateRender();
    }

    private Close(): void
    {
        this.SetValue("TeachingBubbleIsOpen", false, true);
    }

    //Renders entire footer to use framework's button components in place of the buttons built into the fluent control
    private get Footer(): JSX.Element | undefined
    {
        if (!this.PrimaryButton && !this.SecondaryButton)
            return undefined;

        return (
            <Grid
                ColumnDefinitions={[Grid.ColumnDefinition(1,true), Grid.ColumnDefinition()]}
                Margin={ThemeLayout.MarginStandardT}>
                {this.SecondaryButton}
                {this.PrimaryButton}
            </Grid>
        );
    }

    private get PrimaryButton(): JSX.Element | null
    {
        if (!this.state.PrimaryCommand)
            return null;
        return (
            <CommandButton
                Grid={{Column: 1}}
                Command={this.state.PrimaryCommand}
                Style={CommandButton.DialogButtonStyle}
            />
        );
    }

    private get SecondaryButton(): JSX.Element | null
    {
        if (!this.state.ShowSecondaryButton)
            return null;

        const style: WebStyle<ICommandButtonProps> = CommandButton.PrimaryButtonStyle;
        if (this.state.CustomSecondaryCommand)
        {
            return (
                <CommandButton
                    Grid={{ Column: 0 }}
                    Padding={ThemeLayout.MarginStandardTB}
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
    if (!control.TeachingBubbleParams)
        return null;

    return (<TeachingBubble
        Params={control.TeachingBubbleParams}
        Target={() => control} />);
};

// Not sure what this is for
export class TeachingBubbleParams
{
}