import * as React from 'react';
import { Binding, BindingMode, ModelObjectReference, RelativeSourceMode } from '@antimatterjs/react';
import { IStyle, MessageBar as FluentMessageBar, MessageBarType as FluentMessageBarType } from '@fluentui/react';
import { Control, IControlProps, IControlState } from './Control';
import { ControlTemplate, DataTemplate, DataTemplateValue, FrameworkTemplate, TemplateFunction } from '../FrameworkTemplate';
import { WebStyle } from '../Style';
import { CommandButton } from './CommandButton';
import { StackPanel } from './StackPanel';
import { HorizontalAlignment, Orientation } from '../Enums';

export import MessageBarType = FluentMessageBarType;

interface IMessageBarProps extends IControlProps
{
    Content?: DataTemplateValue | string | Binding,
    MessageBarType?: MessageBarType | Binding,
    PrimaryCommand?: ModelObjectReference | Binding,
    SecondaryCommand?: ModelObjectReference | Binding,
    ShowCloseButton?: boolean | Binding,
    Duration?: number | Binding,
    Animate?: boolean | Binding
}
interface IMessageBarState extends IControlState
{
    Content?: DataTemplateValue | string,
    MessageBarType?: MessageBarType,
    PrimaryCommand?: ModelObjectReference,
    SecondaryCommand?: ModelObjectReference,
    ShowCloseButton?: boolean,
    Duration?: number,
    Animate?: boolean,
    Expanded?: boolean
}

export class MessageBar extends Control<IMessageBarProps, IMessageBarState>
{
    public static DefaultBindings = {
        IsVisible: {
            Mode: BindingMode.TwoWay,
            FallbackValue: true
        }
    };

    public static DefaultStyle: WebStyle<IMessageBarProps> = new WebStyle<IMessageBarProps>(
        {
            Template: new ControlTemplate((templatedParent: MessageBar) => templatedParent.template)
        }
    );

    private _timeout;

    private get template(): JSX.Element
    {
        if (this.state.Duration && !this._timeout)
        {
            this._timeout = setTimeout(() => this.Close(), this.state.Duration * 1000);
        }

        return ( 
            <FluentMessageBar
                messageBarType={this.state.MessageBarType}
                onDismiss={this.Dismiss}
                actions={this.Commands}
                styles={
                    {
                        root: {
                            padding: this.Padding
                        },
                        content: {
                            
                        },
                        text: {
                            fontFamily: this.FontFamily,
                            color: this.Foreground,
                            fontSize: this.FontSize ?? 16
                        },
                    }}>
                {this.Content}
            </FluentMessageBar>
        );
    }

    private get Content(): JSX.Element|null
    {
        if (!this.state.Content)
            return <></>;
        if (typeof (this.state.Content) === "string")
            return (<>{this.state.Content}</>);
        else
            return FrameworkTemplate.GetRenderer(this.state.Content)(this);
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
        return () => this.Close();
    }

    private Close(): void
    {
        this.SetValue(nameof(this.state.IsVisible), false);
    }

    private _expandTimeout;

    /* override */ constructClasses(): string
    {
        return super.constructClasses();
    }

    /* override */ getCSSStyles(): React.CSSProperties
    {
        const collapse: boolean = (!!this.state.Animate && !this.state.Expanded);
        const maxHeight: number = collapse ? 0 : 200;
        if (collapse && !this._expandTimeout)
            this._expandTimeout = setTimeout(() => this.SetValue(nameof(this.state.Expanded), true), 0);

        var styles: React.CSSProperties = {
            transitionProperty: "max-height",
            transitionTimingFunction: "linear",
            transitionDuration: "0.3s",
            maxHeight: maxHeight
        };
        return Object.assign(super.getCSSStyles(), styles);
    }
}