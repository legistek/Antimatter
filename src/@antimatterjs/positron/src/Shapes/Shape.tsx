import { Binding } from "@antimatterjs/react";
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from "../FrameworkElement";
import { SemanticColor, ThemeColor } from "../Theme";

export interface IShapeProps extends IFrameworkElementProps
{
    Fill?: string | Binding | SemanticColor | ThemeColor,
    Stroke?: string | Binding | SemanticColor | ThemeColor,
    StrokeThickness?: number | Binding,
    Width?: number | Binding,
    Height?: number | Binding
}
export interface IShapeState extends IFrameworkElementState
{
    Stroke?: string,
    StrokeThickness?: number,
    Width?: number,
    Height?: number
}

export abstract class Shape<P extends IShapeProps = {},
    S extends IShapeState = {}>
    extends FrameworkElement<P,S>
{
    public get Fill(): string | undefined
    {
        return this.GetValue(nameof(this.props.Fill));
    }

    public get Stroke(): string | undefined
    {
        return this.GetValue(nameof(this.props.Stroke));
    }
}