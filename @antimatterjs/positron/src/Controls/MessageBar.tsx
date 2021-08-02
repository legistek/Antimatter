import * as React from 'react';
import { Binding, BindingMode, ModelObjectReference } from '@antimatterjs/react';
import { IStyle, MessageBar as FluentMessageBar, MessageBarType as FluentMessageBarType } from '@fluentui/react';
import { Control, IControlProps, IControlState } from './Control';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { Style } from '../Style';
import { CommandButton } from './CommandButton';
import { StackPanel } from './StackPanel';
import { HorizontalAlignment, Orientation } from '../Enums';

export import MessageBarType = FluentMessageBarType;

interface IMessageBarProps extends IControlProps
{
    Message?: string | Binding,
    Content?: DataTemplate,
    MessageBarType?: MessageBarType | Binding,
    PrimaryCommand?: ModelObjectReference | Binding,
    SecondaryCommand?: ModelObjectReference | Binding,
    ShowCloseButton?: boolean | Binding
}
interface IMessageBarState extends IControlState
{
    Message?: string,
    Content?: DataTemplate,
    MessageBarType?: MessageBarType,
    PrimaryCommand?: ModelObjectReference,
    SecondaryCommand?: ModelObjectReference,
    ShowCloseButton?: boolean
}

export class MessageBar extends Control<IMessageBarProps, IMessageBarState>
{
    public static DefaultBindings = {
        IsVisible: {
            Mode: BindingMode.TwoWay,
            FallbackValue: true
        }
    };

    public static DefaultStyle: Style<IMessageBarProps> = new Style<IMessageBarProps>(
        {
            Template: new ControlTemplate((templatedParent: MessageBar) => templatedParent.Template)
        }
    );

    private get Template(): JSX.Element
    {
        const textStyle: IStyle = {
            fontFamily: this.state.FontFamily,
            color: this.state.Foreground,
            fontSize: this.state.FontSize
        };

        return (
            <FluentMessageBar
                messageBarType={this.state.MessageBarType}
                onDismiss={this.Dismiss}
                actions={this.Commands}
                styles={{ text: textStyle }}
            >
                {this.Content}
            </FluentMessageBar>
        );
    }

    private get Content(): JSX.Element
    {
        if (this.state.Content)
            return this.state.Content.GetVisualTree()(this);
        if (this.state.Message)
            return (<>{this.state.Message}</>);
        return <></>;
    }

    private get Commands(): JSX.Element | undefined
    {
        if (!this.state.PrimaryCommand && !this.state.SecondaryCommand)
            return undefined;
        return (
            <StackPanel
                Orientation={Orientation.Horizontal}
                HorizontalAlignment={HorizontalAlignment.Right}
            >
                {this.CreateButton(this.state.PrimaryCommand)}
                {this.CreateButton(this.state.SecondaryCommand)}
            </StackPanel>
            );
    }

    private CreateButton(ref?: ModelObjectReference): JSX.Element | null
    {
        if (!ref)
            return null;
        return (
            <CommandButton
                Command={ref}
                Style={CommandButton.DialogButtonStyle}
            />
        );
    }

    private get Dismiss(): (() => void) | undefined
    {
        if (!this.state.ShowCloseButton)
            return undefined;
        return () => this.SetValue(nameof(this.state.IsVisible), false);
    }
}