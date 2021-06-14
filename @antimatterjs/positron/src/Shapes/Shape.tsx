import { Binding } from "@antimatterjs/react";
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from "../FrameworkElement";

export interface IShapeProps extends IFrameworkElementProps
{
    Fill?: string | Binding,
    Stroke?: string | Binding,
    StrokeThickness?: number | Binding,
    Width?: number | Binding,
    Height?: number | Binding
}
export interface IShapeState extends IFrameworkElementState
{
    Fill?: string,
    Stroke?: string,
    StrokeThickness?: number,
    Width?: number,
    Height?: number
}

export abstract class Shape<P extends IShapeProps = {},
    S extends IShapeState = {}>
    extends FrameworkElement<P,S>
{
}