import * as React from 'react';
import { Binding, BindingMode, BindingParameters, ModelObjectReference } from '@antimatterjs/react';

import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { WindowLayoutContext } from './Window';
import { WindowLayout } from '../Enums';
import { ControlTemplate } from '../FrameworkTemplate';

interface IControlCommon
{
    FontWeight?: undefined | "bold" | "normal",
    Padding?: string,
    Template?: ControlTemplate | ((templatedParent: any) => JSX.Element),
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
    TeachingBubbleIsOpen?: BindingParameters
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
    TeachingBubbleIsOpen?: BindingParameters
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
                        if (typeof (this.state.Template) === "function")
                        {
                            var vt = (this.state.Template as ((templatedParent: Control) => JSX.Element));
                            return vt(this);
                        }
                        else
                        {
                            return this.state.Template.GetVisualTree(layout)(this);
                        }
                    }
                }
            </WindowLayoutContext.Consumer>
        );

        const bubblefiedElem: JSX.Element = (
            <>
                {baseElem}
                {Control.RenderTeachingBubble(this)}
            </>
        );
        return bubblefiedElem;
    }

    // Hideous ridiculous hack necessitated by Javascript stupidity
    // in being unable to allow a base class to reference a subclass
    static RenderTeachingBubble(
        control: Control<IControlProps, IControlState>): JSX.Element | null
    {
        return null;
    }
}