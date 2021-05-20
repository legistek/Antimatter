import * as React from 'react';

import { Panel, IPanelProps, IPanelState } from './Panel';


export interface IWrapPanelProps extends IPanelProps
{
}
export interface IWrapPanelState extends IPanelState
{
}

export class WrapPanelBase<
    P extends IWrapPanelProps = {},
    S extends IWrapPanelState = {}>
    extends Panel<P, S>
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
            var list = this.state.ItemsParent?.state?.ItemsSource?.map(item =>
            {
                return this.state.ItemsParent?.OnRenderItem(item);
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