import * as React from 'react';

import { PanelBase, IPanelProps, IPanelState } from './Panel';
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
    extends PanelBase<P, S>
{
    /* override */ constructClasses(): string
    {        
        return (this.state.Orientation === Orientation.Horizontal ? "amx-ptn-hstack " : "amx-ptn-vstack ")
            + super.constructClasses();
    }

    /* override */ renderElement(): JSX.Element
    {
        if (this.state.ItemsParent)
        {
            let i = 0;
            var list = this.state.ItemsParent?.state?.ItemsSource?.map(item =>
            {
                return this.state.ItemsParent?.OnRenderItem(item, i++);
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