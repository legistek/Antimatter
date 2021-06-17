import * as React from 'react';
import { divProperties, List } from '@fluentui/react';
import { Binding, ModelObjectReference } from '@antimatterjs/react';

import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { MultitouchTransform } from '../Media/MultitouchTransform';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';

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

    private _tr = new MultitouchTransform();

    renderElement()
    {
        return (
            <Panel
                HorizontalAlignment={HorizontalAlignment.Center}
                VerticalAlignment={VerticalAlignment.Top}
                OnManipulationStarted={(e) =>
                {
                    this._tr.CenterX = e.CenterX;
                    this._tr.CenterY = e.CenterY;
                }}
                OnManipulationDelta={(e) =>
                {
                    this._tr.TranslateX = e.CumulativeX;
                    this._tr.TranslateY = e.CumulativeY;
                    this._tr.ScaleX = e.CumulativeScale;
                    this._tr.ScaleY = e.CumulativeScale;
                }}
                OnManipulationCompleted={(e) =>
                {
                    this._tr.Reset();
                }}
                Transform={this._tr}
            >
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
            </Panel>
        );
    }

    /* override */ getCSSStyles() : React.CSSProperties
    {
        var styles = {
            display: "block",
            height: "100%",
            touchAction: "none"
        };
        return Object.assign(super.getCSSStyles(), styles);
    }

    /* override */ OnInvalidateRender()
    {
        this._version = {};
    }
}

