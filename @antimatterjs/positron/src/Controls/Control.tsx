import * as React from 'react';
import { Binding, BindingMode, ModelObjectReference } from '@antimatterjs/react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { WindowLayoutContext } from './Window';
import { WindowLayout } from '../Enums';
import { ControlTemplate } from '../FrameworkTemplate';
import { ITeachingBubbleProps } from '@antimatterjs/positron/src/Controls/TeachingBubble';

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
    TeachingBubbleParams?: ModelObjectReference | Binding,
    TeachingBubbleIsOpen?: boolean | Binding
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
    TeachingBubbleParams?: ModelObjectReference,
    TeachingBubbleIsOpen?: boolean
}

export class Control<P extends IControlProps = {}, S extends IControlState = {}>
    extends FrameworkElement<P,S>
{
    public static DefaultBindings: any = {
        TeachingBubbleIsOpen: {
            Mode: BindingMode.TwoWay,
            FallbackValue: false
        }
    };

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

        const bubblefiedElem: JSX.Element = (
            <>
                {baseElem}
                {this.TeachingBubbleElem}
            </>
        );
        return bubblefiedElem;
    }

    private get TeachingBubbleProps(): ITeachingBubbleProps
    {
        return {
            Params: this.props.TeachingBubbleParams,
            IsOpen: this.props.TeachingBubbleIsOpen,
            Target: this.Container
        }
    };

    private get TeachingBubbleElem(): JSX.Element | null
    {
        if (!this.state.TeachingBubbleParams || this.state.TeachingBubbleIsOpen || !Control.TeachingBubbleConstructor)
            return null;
        return Control.TeachingBubbleConstructor(this.TeachingBubbleProps);
    }

    public static TeachingBubbleConstructor?: (props: any) => JSX.Element;
}