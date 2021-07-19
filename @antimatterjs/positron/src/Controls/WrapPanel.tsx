import * as React from 'react';

import { PanelBase, IPanelProps, IPanelState } from './Panel';


export interface IWrapPanelProps extends IPanelProps
{
}
export interface IWrapPanelState extends IPanelState
{
}

export class WrapPanelBase<
    P extends IWrapPanelProps = {},
    S extends IWrapPanelState = {}>
    extends PanelBase<P, S>
{
    /* override */ constructClasses(): string
    {
        return "amx-ptn-wrap-panel  "
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
            return (<>{this.props.children}</>);
        }
    }   
}

export class WrapPanel extends WrapPanelBase<IWrapPanelProps, IWrapPanelState>
{
}