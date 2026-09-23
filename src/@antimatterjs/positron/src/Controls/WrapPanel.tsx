import * as React from 'react';
import { CSSClasses } from '../CSSClasses';
import { IFrameworkElementState } from '../FrameworkElement';
import { TemplateProp, WebStyle, Style } from '../Style';
import { ThemeLayout } from '../Theme';

import { PanelBase, IPanelProps } from './Panel';

export interface IWrapPanelProps extends IPanelProps
{
}

export class WrapPanelBase<P extends IWrapPanelProps = {}>
    extends PanelBase<P, IFrameworkElementState>
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

    public static UnspacedStyle = new Style<IWrapPanelProps>(
        {
            ItemSpacing: "0px"
        },
        WrapPanelBase.DefaultStyle)

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
        if (this.ItemsParent)
        {
            let i = 0;
            if (this.ItemsParent.ItemsSource?.map)
            {
                var list = this.ItemsParent?.ItemsSource?.map(item =>
                {
                    return this.ItemsParent?.OnRenderItem(item, i++);
                });
                return (<>{list}</>);
            }
            else
            {
                return (<></>);
            }
        }
        else
        {
            return (<>{this.props.children}</>);
        }
    }
}

export class WrapPanel extends WrapPanelBase<IWrapPanelProps>
{
}