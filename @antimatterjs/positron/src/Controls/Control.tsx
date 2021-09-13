import * as React from 'react';
import { Binding, BindingMode, BindingParameters, ModelObjectReference } from '@antimatterjs/react';

import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { WindowLayoutContext } from './Window';
import { WindowLayout } from '../Enums';
import { ControlTemplate } from '../FrameworkTemplate';
import { FontStyle, ThemeColor, SemanticColor } from '../Theme';
import { Style } from '../Style';

interface IControlCommon
{
    FontWeight?: undefined | "bold" | "normal",
    Padding?: string,
    Template?: ControlTemplate | ((templatedParent: any) => JSX.Element),
    Layout?: WindowLayout
}

export interface IControlProps extends IFrameworkElementProps, IControlCommon
{    
    Foreground?: string | Binding | ThemeColor | SemanticColor,
    Background?: string | Binding | ThemeColor | SemanticColor,
    BorderBrush?: string | Binding | ThemeColor | SemanticColor,
    FontFamily?: string | Binding | FontStyle,
    FontSize?: number | Binding | FontStyle,
    BoxShadow?: string | Binding,
    BorderThickness?: string | Binding,    
    TeachingBubbleParams?: ModelObjectReference | Binding,
    TeachingBubbleIsOpen?: BindingParameters
}

export interface IControlState extends IFrameworkElementState, IControlCommon
{    
    BoxShadow?: string,
    BorderThickness?: string,
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

    public get Foreground(): string | undefined
    {
        return this.GetThemableProperty(nameof(this.props.Foreground));
    }

    public get Background(): string | undefined
    {
        return this.GetThemableProperty(nameof(this.props.Background));
    }

    public get BorderBrush(): string | undefined
    {
        return this.GetThemableProperty(nameof(this.props.BorderBrush));
    }

    public get FontFamily(): string | undefined
    {
        return this.GetThemableProperty(nameof(this.props.FontFamily));
    }

    public get FontSize(): number | string | undefined
    {
        return this.GetThemableProperty(nameof(this.props.FontSize));
    }

    protected static DisabledSelector(elementClass: string): string
    {
        return `@.amx-ptn-disabled .${elementClass},.amx-ptn-disabled @ .${elementClass}`;
    }

    protected /* override */ renderElement(): JSX.Element | null
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

    getCSSStyles()
    {
        var styles = super.getCSSStyles();
        if (!this.IsEnabled)
            styles.pointerEvents = "none";
        return styles;
    }

    // Hideous ridiculous hack necessitated by Javascript stupidity
    // in being unable to allow a base class to reference a subclass
    static RenderTeachingBubble(
        control: Control<IControlProps, IControlState>): JSX.Element | null
    {
        return null;
    }
}