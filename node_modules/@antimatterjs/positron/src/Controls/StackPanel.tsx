import * as React from 'react';

import { Panel, IPanelProps, IPanelState } from './Panel';
import { Orientation } from '../Enums';

export interface IStackPanelProps extends IPanelProps
{
    Orientation?: Orientation
}

export interface IStackPanelState extends IPanelState
{
    Orientation?: Orientation
}

export class StackPanel<P extends IStackPanelProps = {}, S extends IStackPanelState = {}>
    extends Panel<P, S>
{
    protected /* override */ constructClasses(): string
    {        
        return "amx-ptn-stack-panel amx-ptn-panel "
            + (this.state.Orientation === Orientation.Horizontal ? "horizontal " : "")
            + super.constructClasses();
    }

    protected /* override */ renderElement(): JSX.Element
    {
        if (this.state.ItemsParent)
        {
            var list = this.state.ItemsParent?.state?.ItemsSource?.map(item =>
            {
                return this.state.ItemsParent?.OnRenderItem(item);
            });
            return (<>{list}</>);
        }
        else
        {
            return (<>{ this.props.children }</>);
        }
    }
}