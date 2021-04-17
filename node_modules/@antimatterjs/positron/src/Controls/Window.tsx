import * as React from 'react';
import { IPanelProps, IPanelState, Panel } from './Panel';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';

export interface IWindowProps extends IPanelProps
{
}

export interface IWindowState extends IPanelState
{
}

export class Window<P extends IWindowProps = {}, S extends IWindowState = {}> extends Panel<IWindowProps, IWindowState>
{
    constructor(props)
    {
        super(props);
        (this.state as any)["HorizontalAlignment"] = HorizontalAlignment.Stretch;
        (this.state as any)["VerticalAlignment"] = VerticalAlignment.Stretch;
    }

    protected /* override */ constructClasses() : string
    {
        return super.constructClasses() + "amx-ptn-root ";
    }
}