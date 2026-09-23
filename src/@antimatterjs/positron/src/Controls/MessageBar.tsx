import * as React from 'react';
import { Binding, BindingMode, ModelObjectReference, RelativeSourceMode } from '@antimatterjs/react';
import { IStyle, MessageBar as FluentMessageBar, MessageBarType as FluentMessageBarType } from '@fluentui/react';
import { Control, IControlProps, IControlState } from './Control';
import { ControlTemplate, DataTemplate, FrameworkTemplate, TemplateFunction } from '../FrameworkTemplate';
import { WebStyle } from '../Style';
import { CommandButton } from './CommandButton';
import { StackPanel } from './StackPanel';
import { HorizontalAlignment, Orientation } from '../Enums';

export import MessageBarType = FluentMessageBarType;
import { TextBlock } from './TextBlock';
import { FontStyle, ThemeLayout } from '../Theme';

interface IMessageBarProps extends IControlProps
{
    Title?: string | Binding,
    Content?: DataTemplate | string | Binding,
    MessageBarType?: MessageBarType | Binding,
    PrimaryCommand?: ModelObjectReference | Binding,
    SecondaryCommand?: ModelObjectReference | Binding,
    ShowCloseButton?: boolean | Binding,
    Duration?: number | Binding,
    Animate?: boolean | Binding,
    MaxWidth?: number | string | Binding
}
interface IMessageBarState extends IControlState
{
    MessageBarType?: MessageBarType,
    PrimaryCommand?: ModelObjectReference,
    SecondaryCommand?: ModelObjectReference,
    ShowCloseButton?: boolean,
    Duration?: number,
    Animate?: boolean,
    MaxWidth?: number | string,
    Expanded?: boolean
}

export class MessageBar extends Control<IMessageBarProps, IMessageBarState>
{
    public get Content(): DataTemplate | string | undefined
    {
        return this.GetValue(nameof(this.props.Content));
    }

    public get Title(): string | undefined
    {
        return this.GetValue(nameof(this.props.Title));
    }

    public get MaxWidth(): string | number | undefined
    {
        return this.GetValue(nameof(this.props.MaxWidth));
    }

    public get MessageBarType(): MessageBarType | undefined
    {
        return this.GetValue(nameof(this.props.MessageBarType));
    }

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
                messageBarType={this.MessageBarType}
                onDismiss={this.Dismiss}
                actions={this.Commands}
                styles={
                    {
                        root: {
                            padding: this.Padding,
                            maxWidth: this.MaxWidth
                        },
                        content: {

                        },
                        text: {
                            fontFamily: this.FontFamily,
                            color: this.Foreground,
                            fontSize: this.FontSize ?? 16,
                        },
                    }}>
                {
                    this.Title &&
                    <TextBlock
                        FontSize={FontStyle.MediumPlus}
                        Text={this.Title} FontWeight="bold" Margin={ThemeLayout.MarginSmallB} />
                }
                <pre style={{ fontFamily: "unset", whiteSpace: "pre-wrap" }}>{this.RenderContent()}</pre>
            </FluentMessageBar>
        );
    }

    private RenderContent(): JSX.Element|null
    {
        var content = this.Content;
        if (!content)
            return <></>;
        if (typeof (content) === "string")
            return (<>{content}</>);
        else
            return FrameworkTemplate.GetRenderer(content)(this);
    }

    private get Commands(): JSX.Element | undefined
    {
        if (!this.state.PrimaryCommand && !this.state.SecondaryCommand)
            return undefined;
        return (
            <StackPanel
                ItemSpacing={0}
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
                Style={CommandButton.CommandBarButtonStyle}
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
        this.SetValue(nameof(this.props.IsVisible), false);
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