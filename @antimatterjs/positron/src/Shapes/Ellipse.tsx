import * as React from 'react';
import { IShapeProps, IShapeState, Shape } from './Shape';

export class Ellipse extends Shape<IShapeProps, IShapeState>
{    
    public /* override */ getCSSStyles(): React.CSSProperties
    {
        var styles: React.CSSProperties = {
            background: this.Fill,
            borderWidth: this.state.StrokeThickness,
            borderColor: this.Stroke,
            width: this.state.Width,
            height: this.state.Height,
            borderStyle: "solid",
            userSelect: "none",
            borderRadius: "50%"
        };

        return Object.assign(super.getCSSStyles(), styles);
    }
}