import * as React from 'react';
import { IList, List, ScrollToMode } from '@fluentui/react';
import { Binding, ModelObjectReference } from '@antimatterjs/react';

import { IPanelProps, IPanelState, Panel, PanelBase } from '../Controls/Panel';
import { MultitouchTransform } from '../Media/MultitouchTransform';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';
import { DocumentViewer } from './DocumentViewer';

export interface IDocumentPagesPanelProps extends IPanelProps
{
}
export interface IDocumentPagesPanelState extends IPanelState
{
}

export class DocumentPagesPanel extends PanelBase<IDocumentPagesPanelProps, IDocumentPagesPanelState>
{
    _version: any = {};
    _list: IList | null = null;

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
                    //this._tr.TranslateX = e.CumulativeX;
                    //this._tr.TranslateY = e.CumulativeY;
                    this._tr.ScaleX = e.CumulativeScale;
                    this._tr.ScaleY = e.CumulativeScale;
                }}
                OnManipulationCompleted={(e) =>
                {
                    this._tr.Reset();
                    (this.state.ItemsParent as DocumentViewer)?.Scale(e.CumulativeScale);
                    //if (!this.Container)
                    //    return;
                    //var newX = this.Container.offsetLeft - e.CumulativeX;
                    //var newY = this.Container.offsetTop - e.CumulativeY;
                    //this.Container?.scrollTo(
                    //    newX,
                    //    newY);
                }}
                Transform={this._tr}>
                <List
                    componentRef={r => this._list = r}
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

    /* override */ getCSSStyles(): React.CSSProperties
    {
        var styles = {
            display: "block",
            height: "100%",
            touchAction: "pan-x pan-y"
        };
        return Object.assign(super.getCSSStyles(), styles);
    }

    /* override */ OnInvalidateRender()
    {
        this._version = {};
    }

    public ScrollTo(page: number, y: number)
    {
        if (!this._list)
            return;
        this._list.scrollToIndex(page, undefined, ScrollToMode.center);
    }
}