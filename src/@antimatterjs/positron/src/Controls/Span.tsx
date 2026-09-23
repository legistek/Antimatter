import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import * as React from 'react';
import { Antimatter, Binding, BindingMode, ModelObjectReference, Utilities } from '@antimatterjs/react';
import { Style, TemplateProp, WebStyle } from '../Style';
import { FontStyle, ThemeColor, SemanticColor, Theme, ThemeLayout } from '../Theme';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { HorizontalAlignment, ScrollBarVisibility, VerticalAlignment } from '../Enums';
import { Grid } from './Grid';
import { CommandButton } from './CommandButton';
import { CSSClasses } from '../CSSClasses';
import { Application } from '../Application';

export interface ISpanProps extends IFrameworkElementProps
{
    children?: React.ReactNode;
    Text?: string | Binding;
    Foreground?: string | Binding | ThemeColor | SemanticColor,
    FontFamily?: string | FontStyle | Binding,
    FontSize?: string | FontStyle | Binding,
    FontWeight?: undefined | "bold" | "normal" | number | Binding,
    FontStyle?: undefined | "italic" | "normal" | "oblique" | Binding,
    Command?: ModelObjectReference | Binding | ((commandParameter: any) => void),
    CommandParameter?:
        Binding | string | number | boolean | ModelObjectReference |
        (() => string | number | boolean | ModelObjectReference),
}

export class SpanBase<P extends ISpanProps = {}, S extends IFrameworkElementState = {}>
    extends FrameworkElement<P, S>
{
    public static DefaultStyle: WebStyle<ISpanProps> = new WebStyle<ISpanProps>(
        {
            Foreground: Theme.Value(SemanticColor.BodyText),
            FontFamily: Theme.Value(FontStyle.FontFamily),
            FontSize: Theme.Value(FontStyle.Medium),
            FontWeight: "normal",
            OnClick: (e, target) => (target as SpanBase).OnClick(e),
        },
        {
            "@": {                                
                fontFamily: TemplateProp(nameof<ISpanProps>(p => p.FontFamily)),
                color: TemplateProp(nameof<ISpanProps>(p => p.Foreground)),
                fontSize: TemplateProp(nameof<ISpanProps>(p => p.FontSize)),
                fontWeight: TemplateProp(nameof<ISpanProps>(p => p.FontWeight)),
                userSelect: "text"
            },
        });

    public get Text(): string | undefined
    {
        return this.GetValue(nameof(this.props.Text));
    }

    public get Command(): ModelObjectReference | ((commandParameter: any) => void) | undefined
    {
        return this.GetValue(nameof(this.props.Command));
    }

    public get CommandParameter(): any
    {
        return this.GetValue(nameof(this.props.CommandParameter));
    }

    protected /* virtual */ get BoundingBoxType(): keyof React.JSX.IntrinsicElements
    {
        return 'span';
    }

    protected /* virtual */ renderElement(): JSX.Element | null
    {
        return <>{this.Text}{this.props.children}</>;
    }

    protected /* virtual */ constructClasses(): string
    {
        return '';
    }

    /* virtual */ OnClick(e?: React.MouseEvent): void
    {
        if (e)
            FrameworkElement.LastMouseEvent = { X: e?.clientX, Y: e?.clientY };

        var cmdParam = this.CommandParameter;

        if (this.Command)
            this.ExecuteCommand(
                this.Command,
                typeof cmdParam === 'function'
                    ? cmdParam()
                    : cmdParam);
        e?.stopPropagation();
    }
}

export class Span extends SpanBase<ISpanProps>
{
}