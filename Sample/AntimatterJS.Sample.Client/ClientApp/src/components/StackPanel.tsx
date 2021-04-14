import { Component } from 'react';
import * as React from 'react';

export enum Orientation
{
    Horizontal = 1,
    Vertical = 2
}

export class StackPanel extends Component<{ Orientation?: Orientation, style?: React.CSSProperties}>
{
    render()
    {
        return (
            <div className={"amx-panel " + this.CSSClass} style={this.props.style}>
                {this.props.children}
            </div>
        );
    }

    private get CSSClass(): string
    {
        var actualOrientation = this.props.Orientation || Orientation.Vertical;
        return actualOrientation === Orientation.Vertical
            ? "amx-stack-panel"
            : "amx-stack-panel horizontal";
    }
}