import * as React from 'react';
import { Binding, BindingMode, BindingParameters, ModelObjectReference } from '@antimatterjs/react';

import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState, TemplatedParentContext } from '../FrameworkElement';
import { WindowLayout } from '../Enums';
import { ControlTemplate } from '../FrameworkTemplate';
import { FontStyle, ThemeColor, SemanticColor, ThemeLayout } from '../Theme';
import { WebStyle } from '../Style';
import { WindowLayoutContext } from './Window';
import { CSSClasses } from '../CSSClasses';

export interface IControlProps extends IFrameworkElementProps
{
    Template?: ControlTemplate | ((templatedParent: any) => JSX.Element),
    Padding?: string | ThemeLayout,
    FontWeight?: undefined | "bold" | "normal",
    Foreground?: string | Binding | ThemeColor | SemanticColor,
    Background?: string | Binding | ThemeColor | SemanticColor,
    BorderBrush?: string | Binding | ThemeColor | SemanticColor,
    BorderThickness?: string | Binding | ThemeLayout,
    FontFamily?: string | Binding | FontStyle,
    FontSize?: string | Binding | FontStyle,
    BoxShadow?: string | Binding,
    InfoTip?: Binding | string,
    TeachingBubbleParams?: ModelObjectReference | Binding,
    TeachingBubbleIsOpen?: BindingParameters,
    ValidationError?: string,
}

export interface IControlState extends IFrameworkElementState
{
}

export class Control<P extends IControlProps = {}, S extends IControlState = {}>
    extends FrameworkElement<P, S>
{
    public static DefaultBindings: any = {
        TeachingBubbleIsOpen: {
            Mode: BindingMode.TwoWay,
            FallbackValue: false
        },
        FontSize: {
            Converter: (size) => typeof (size) === "number" ? `${size}px` : size
        }
    };

    private _layout?: WindowLayout;
    public get Layout(): WindowLayout
    {
        return this._layout || WindowLayout.Default;
    }
    public set Layout(value: WindowLayout)
    {
        this._layout = value;
    }

    public get ValidationError(): string | undefined
    {
        return this.GetValue(nameof(this.props.ValidationError));
    }

    public get IsInvalid(): boolean
    {
        return this.ValidationError !== undefined;
    }

    public get Template(): ControlTemplate | ((templatedParent: any) => JSX.Element) | undefined
    {
        return this.GetValue(nameof(this.props.Template));
    }

    public get InfoTip(): string | undefined
    {
        return this.GetValue(nameof(this.props.InfoTip));
    }
    
    public get TeachingBubbleIsOpen(): BindingParameters | undefined
    {
        return this.GetValue(nameof(this.props.TeachingBubbleIsOpen));
    }

    public get TeachingBubbleParams(): ModelObjectReference|undefined
    {
        return this.GetValue(nameof(this.props.TeachingBubbleParams));
    }

    public get Padding(): string | undefined
    {
        return this.GetValue(nameof(this.props.Padding));
    }

    public get BoxShadow(): string | undefined
    {
        return this.GetValue(nameof(this.props.BoxShadow));
    }

    public get Foreground(): string | undefined
    {
        return this.GetValue(nameof(this.props.Foreground));
    }

    public get Background(): string | undefined
    {
        return this.GetValue(nameof(this.props.Background));
    }

    public get BorderBrush(): string | undefined
    {
        return this.GetValue(nameof(this.props.BorderBrush));
    }

    public get BorderThickness(): string | undefined
    {
        return this.GetValue(nameof(this.props.BorderThickness));
    }

    public get FontFamily(): string | undefined
    {
        return this.GetValue(nameof(this.props.FontFamily));
    }

    public get FontSize(): number | string | undefined
    {
        return this.GetValue(nameof(this.props.FontSize));
    }

    public get FontWeight(): "bold" | "normal" | undefined
    {
        return this.GetValue(nameof(this.props.FontWeight));
    }

    override OnComponentMount()
    {
        if (this.state.Style instanceof WebStyle)
            (this.state.Style as WebStyle<any>).TemplateHasRendered = true;
    }

    protected static DisabledElement(elementClass: string, root?: string): string
    {
        root = root || "@";
        return `${root}.amx-ptn-disabled .${elementClass},.amx-ptn-disabled ${root} .${elementClass}`;
    }

    protected /* override */ renderElement(): JSX.Element | null
    {
        const baseElem: JSX.Element = (
            <TemplatedParentContext.Provider value={this}>
                <WindowLayoutContext.Consumer>
                {
                    (layout) =>
                    {
                        if (!this.Template)
                            return null;
                        this.Layout = layout;
                        if (typeof (this.Template) === "function")
                        {
                            var vt = (this.Template as ((templatedParent: Control) => JSX.Element));
                            return vt(this);
                        }
                        else
                        {
                            return this.Template.GetVisualTree(layout)(this);
                        }
                    }
                }
                </WindowLayoutContext.Consumer>
            </TemplatedParentContext.Provider>
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

    override constructClasses()
    {
        return super.constructClasses()
            + (this.IsInvalid ? ` ${Control.STATE_ValidationError} ` : "");
    }

    NotifyValidationError(error?: string)
    {
        let actualError: string | undefined = undefined;
        if (error && error.length > 0)
            actualError = error;
        if (this.ValidationError !== error)
            this.SetValue(
                nameof(this.props.ValidationError),
                actualError,
                true,
                true);
    }

    // Hideous ridiculous hack necessitated by Javascript stupidity
    // in being unable to allow a base class to reference a subclass
    static RenderTeachingBubble(
        control: Control<IControlProps, IControlState>): JSX.Element | null
    {
        return null;
    }

    protected static readonly STATE_ValidationError: string = "ctrl-valerr"; 
}