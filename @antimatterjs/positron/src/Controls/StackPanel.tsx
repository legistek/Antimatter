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

export class StackPanelBase<P extends IStackPanelProps = {}, S extends IStackPanelState = {}>
    extends Panel<P, S>
{
    /* override */ constructClasses(): string
    {        
        return "amx-ptn-stack-panel "
            + (this.state.Orientation === Orientation.Horizontal ? "horizontal " : "")
            + super.constructClasses();
    }

    /* override */ renderElement(): JSX.Element
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

export class StackPanel extends StackPanelBase<IStackPanelProps, IStackPanelState>
{
}