import * as React from 'react';
import { CSSClasses } from '../CSSClasses';
import { TemplateProp, WebStyle } from '../Style';
import { ThemeLayout } from '../Theme';

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
    public static DefaultStyle = new WebStyle(
        {
            ItemSpacing: ThemeLayout.ControlSpacing,
        },
        {
            [`@  .amx-ptn-wrap-panel > .${CSSClasses.Base}`]: {
                marginTop: `${TemplateProp(nameof<IWrapPanelProps>(p => p.ItemSpacing))}`,
                marginLeft: `${TemplateProp(nameof<IWrapPanelProps>(p => p.ItemSpacing))}`,
            }
        });

    /* override */ renderElement(): JSX.Element
    {       
        return (
            <div
                className="amx-ptn-wrap-panel amx-ptn-hstretch amx-ptn-vstretch"
                style={{
                    marginLeft: `calc(0px - ${this.ItemSpacing})`,
                    marginTop: `calc(0px - ${this.ItemSpacing})`
                }}

            >
                {this.ChildRender()}
            </div>);        
    }

    private ChildRender(): JSX.Element
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