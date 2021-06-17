import * as React from 'react';
import { divProperties, List } from '@fluentui/react';
import { Binding, ModelObjectReference } from '@antimatterjs/react';

import { IPanelProps, IPanelState, PanelBase } from './Panel';

export interface IItemsStackPanelProps extends IPanelProps
{
}

interface IItemsStackPanelState extends IPanelState
{
    version?: any
}

export class ItemsStackPanel extends PanelBase<IItemsStackPanelProps, IItemsStackPanelState>
{
    _version: any = {};

    renderElement()
    {
        return (
                <List
                    items={this.props.ItemsParent?.state.ItemsSource}
                    getItemCountForPage={(index, rect) => 2}
                style={{
                    width: 'fit-content',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}
                    getKey={item => item?.IsModelObjectReference ? (item as ModelObjectReference).Handle : item?.toString()}
                    onRenderCell={(item, index) =>
                        this.props.ItemsParent?.OnRenderItem(item)}
                    version={this._version}
                    />
        );
    }

    /* override */ getCSSStyles() : React.CSSProperties
    {
        var styles = {
            display: "block",
            height: "100%"    
        };
        return Object.assign(super.getCSSStyles(), styles);
    }

    /* override */ OnInvalidateRender()
    {
        this._version = {};
    }
}

