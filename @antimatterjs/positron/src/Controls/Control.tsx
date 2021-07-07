import * as React from 'react';
import { Binding, BindingMode, ModelObjectReference } from '@antimatterjs/react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { WindowLayoutContext } from './Window';
import { WindowLayout } from '../Enums';
import { ControlTemplate } from '../FrameworkTemplate';


import { TeachingBubble } from '@antimatterjs/positron/src/Controls/TeachingBubble';
import { CommandButtonWithProps } from '@antimatterjs/positron/src/Controls/CommandButton';
import
{
    ITeachingBubbleStyles,
    IStyle,
    Target,
    TeachingBubble as FluentTeachingBubble
} from '@fluentui/react';


interface IControlCommon
{
    FontWeight?: undefined | "bold" | "normal",
    Padding?: string,
    Template?: ControlTemplate,
    Layout?: WindowLayout
}

export interface IControlProps extends IFrameworkElementProps, IControlCommon
{
    IsEnabled?: boolean | Binding,
    Foreground?: string | Binding,
    Background?: string | Binding,
    BorderBrush?: string | Binding,
    BorderThickness?: string | Binding,
    FontFamily?: string | Binding,
    FontSize?: number | Binding,

    TeachingBubbleIsOpen?: boolean | Binding,
    TeachingBubbleHeaderText?: string | Binding,
    TeachingBubbleMessageText?: string | Binding,
    TeachingBubbleCommand?: ModelObjectReference | Binding,
    TeachingBubbleHasDismissButton?: boolean | Binding,
    TeachingBubbleDismissButtonText?: string | Binding
}

export interface IControlState extends IFrameworkElementState, IControlCommon
{
    IsEnabled?: boolean,
    Background?: string,
    Foreground?: string,
    BorderBrush?: string,
    BorderThickness?: string,
    FontFamily?: string,
    FontSize?: number,

    TeachingBubbleIsOpen?: boolean,
    TeachingBubbleHeaderText?: string,
    TeachingBubbleMessageText?: string,
    TeachingBubbleCommand?: ModelObjectReference,
    TeachingBubbleHasDismissButton?: boolean,
    TeachingBubbleDismissButtonText?: string
}

export class Control<P extends IControlProps = {}, S extends IControlState = {}>
    extends FrameworkElement<P,S>
{
    //public static DefaultBindings = {
    //    TeachingBubbleIsOpen: {
    //        Mode: BindingMode.TwoWay,
    //        FallbackValue: false
    //    }
    //};

    /* override sealed */ renderElement(): JSX.Element | null
    {
        const baseElem: JSX.Element = (
            <WindowLayoutContext.Consumer>
                {
                    (layout) =>
                    {
                        if (!this.state.Template)
                            return null;
                        (this.state as any).Layout = layout;
                        return this.state.Template.GetVisualTree(layout)(this);
                    }
                }
            </WindowLayoutContext.Consumer>
        );
        //return baseElem;

        const bubblefiedElem: JSX.Element = (
            <>
                {baseElem}
                {this.TeachingBubbleElem}
            </>
        );
        return bubblefiedElem;
    }

    private get TeachingBubbleElem(): JSX.Element | null
    {
        if (!this.state.TeachingBubbleIsOpen)
            return null;
        //const elem: JSX.Element = (
        //    <TeachingBubble
        //        IsOpen={this.state.TeachingBubbleIsOpen}
        //        HeaderText={this.state.TeachingBubbleHeaderText}
        //        MessageText={this.state.TeachingBubbleMessageText}
        //        PrimaryCommand={this.state.TeachingBubbleCommand}
        //        ShowSecondaryButton={this.state.TeachingBubbleHasDismissButton}
        //        SecondaryButtonText={this.state.TeachingBubbleDismissButtonText}
        //    />
        //);

        const elem: JSX.Element = (
            <FluentTeachingBubble
                target={this.Container as Target}
                headline={this.state.TeachingBubbleHeaderText}
                hasCloseButton={true}
                onDismiss={() => this.CloseBubble()}
                styles={this.FluentBubbleStyle}

                //footerContent={this.TeachingBubbleCommandButton}
            >
                {this.state.TeachingBubbleMessageText}
            </FluentTeachingBubble>
        );

        return elem;
    }

    private CloseBubble(): void
    {
        this.SetValue(nameof(this.state.TeachingBubbleIsOpen), false);
    }


    private get FluentBubbleStyle(): any //Should correspond to ITeachingBubbleStyles type
    {
        //Adjust buttons in the custom footer to look the same as the standard built-in buttons would (e.g., R-aligned)
        const footerStyle: IStyle =
        {
            justifyContent: 'flex-end'
        };
        const fluentStyle =
        {
            footer: footerStyle
        };
        return fluentStyle;
    }


    private get TeachingBubbleCommandButton(): JSX.Element | null
    {
        if (!this.state.TeachingBubbleCommand)
            return null;
        //const button: JSX.Element = (
        //    <CommandButtonWithProps
        //        Command={this.state.TeachingBubbleCommand}
        //        Style={CommandButton.DialogButtonStyle}
        //    />
        //);
        //return button;

        return <></>;
    }
}