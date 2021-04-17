import { Panel, IPanelProps, IPanelState } from './Panel';
import * as React from 'react';

import { Orientation } from '../Enums';

export interface IStackPanelProps extends IPanelProps
{
    Orientation?: Orientation
}

export interface IStackPanelState extends IPanelState
{
}

export class StackPanel<P extends IStackPanelProps = {}, S extends IStackPanelState = {}>
    extends Panel<IStackPanelProps, IStackPanelState>
{
    protected /* override */ constructClasses(): string
    {
        return "amx-ptn-stack-panel amx-ptn-panel "
            + (this.props.Orientation === Orientation.Horizontal ? "horizontal " : "")
            + super.constructClasses();
    }
}