import * as React from "react";
import { Binding, Utilities } from "@antimatterjs/react";

import { Panel } from "../Controls/Panel";
import { DocumentPosition, IDocument, IDocumentPage } from "./IDocument";
import { Style } from "../Style";
import { ItemsStackPanel } from "../Controls/ItemsStackPanel";
import { FrameworkElement } from "../FrameworkElement";
import { HorizontalAlignment, ScrollBarVisibility, VerticalAlignment } from "../Enums";
import { ControlTemplate } from "../FrameworkTemplate";
import { MultitouchTransform } from "../Media/MultitouchTransform";
import { Point, Rect } from "../Foundation";
import { IVirtualizingItemsControlProps, IVirtualizingItemsControlState, VirtualizingItemsControl, VirtualizingItemsControlBase } from "../Controls/VirtualizingItemsControl";
import { DocumentPagesPanel } from "./DocumentPagesPanel";
import { DocumentPagePresenterBase, IDocumentPagePresenterProps } from "./DocumentPagePresenter";

interface IDocumentViewerCommon
{
    Document?: IDocument|null
}
export interface IDocumentViewerProps extends IVirtualizingItemsControlProps, IDocumentViewerCommon
{
    Position?: DocumentPosition | Binding,
    Scale?: number|Binding,
}
export interface IDocumentViewerState extends IVirtualizingItemsControlState, IDocumentViewerCommon
{
    Position?: DocumentPosition,
    Scale?: number,
}

export class DocumentViewerBase<
    P extends IDocumentViewerProps = {},
    S extends IDocumentViewerState = {}>
    extends VirtualizingItemsControlBase<P, S>
{    
    private _scroller: Panel | null = null;
    private _scrollOrigin: Point = new Point();
    private _sizeFaker: HTMLElement | null = null;
    private _tr = new MultitouchTransform();
    private _pagesPanel: DocumentPagesPanel | null = null;
    private _lastScrollY: number = 0;

    constructor(props)
    {
        super(props);
    }

    private Template(): JSX.Element
    {
        return (
            <Panel
                ref={r => this._scroller = r}
                Background={this.state.Background}
                OnScroll={(e) =>
                {
                    if (!this._pagesPanel || !this._scroller?.Container)
                        return;
                    this._pagesPanel.ScrollingUp = this._scroller.Container.scrollTop < this._lastScrollY;
                    this._lastScrollY = this._scroller.Container.scrollTop;
                    this._pagesPanel.UpdatePagesOnScroll();
                }}
                VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                HorizontalScrollBarVisibility={ScrollBarVisibility.Auto}>
                <DocumentPagesPanel
                    ref={r => this._pagesPanel = r}
                    Scale={this.state.Scale}
                    HorizontalAlignment={HorizontalAlignment.Center}
                    VerticalAlignment={VerticalAlignment.Top}
                    ItemsParent={this}
                    OnManipulationStarted={((e) =>
                    {
                        var pagesPanel = this._pagesPanel?.Container;
                        var scroller = this._scroller?.Container;
                        if (!this._pagesPanel || !pagesPanel || !scroller)
                            return;

                        this._tr.CenterX = e.CenterX;
                        this._tr.CenterY = e.CenterY;
                        this._scrollOrigin = {
                            X: pagesPanel.getBoundingClientRect().x - (pagesPanel.parentElement?.getBoundingClientRect()?.x || 0),
                            Y: scroller.scrollTop,
                        };
                    }).bind(this)}
                    OnManipulationDelta={((e) =>
                    {
                        var vsp = this._pagesPanel?.Container;
                        var scroller = this._scroller?.Container;
                        if (!vsp || !scroller || !this._sizeFaker)
                            return;
                        this._tr.TranslateX = e.CumulativeX;
                        this._tr.TranslateY = e.CumulativeY;
                        this._tr.ScaleX = e.CumulativeScale;
                        this._tr.ScaleY = e.CumulativeScale;                        

                        if (this._tr.ScaleX !== 1)
                        {
                            scroller.style.overflowX = "hidden";
                            this._sizeFaker.style.width = '9999999px';
                        }

                        this._pagesPanel?.UpdatePagesOnScroll();
                    }).bind(this)}
                    OnManipulationCompleted={((e) =>
                    {
                        var vsp = this._pagesPanel;
                        var scroller = this._scroller?.Container;
                        if (!vsp || !scroller || !vsp.Container || !this._sizeFaker)
                            return;

                        this.SetValue(nameof(this.state.Scale), (this.state.Scale as number || 1) * this._tr?.AbsoluteScale || 1, true);

                        this._sizeFaker.style.width = '0px';
                        scroller.style.overflowX = "auto";

                        var ds = {
                            X: (vsp?.Container?.parentElement?.getBoundingClientRect()?.x || 0) -
                                (vsp?.Container?.getBoundingClientRect().x || 0),
                            Y: this._scrollOrigin.Y - ((this._tr?.AbsoluteY || 0) / 1)
                        }

                        vsp.SetDesiredScroll(ds);
                        this._tr.Reset();

                        this.InvalidateRender();
                    }).bind(this)}
                    Transform={this._tr}
                >
                </DocumentPagesPanel>
                <div
                    ref={r => this._sizeFaker = r}
                    style={{ height: 1, position: 'absolute' }} >
                </div>
            </Panel>);
    }

    public static DefaultStyle: Style<IDocumentViewerProps> = new Style<IDocumentViewerProps>(
        {
            ItemsPanel: ItemsStackPanel,
            Background: "#E0E0E0",
            HorizontalScrollBarVisibility: ScrollBarVisibility.Auto,
            VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
            ItemContainerStyle: new Style<IDocumentPagePresenterProps>(
                {
                    PagePadding: 5,
                    HorizontalAlignment: HorizontalAlignment.Center
                }),
            Template: new ControlTemplate((templatedParent: DocumentViewer) => templatedParent.Template())
        }
    );

    /* override */ OnPropertyChanged(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.state.Document))
        {
            var doc = value as IDocument;
            this.SetValue(
                nameof(this.state.ItemsSource),
                this.ConstructPageArray(doc?.Pages || 0),
                true);
            this.ItemsPanelInstance?.OnItemSourceChange();
        }
        else if (property === nameof(this.state.Position))
        {
            var pos = value as DocumentPosition;
            var oldPos = oldValue as DocumentPosition;
            if (pos?.scale !== oldPos?.scale)
                this.ItemsPanelInstance?.InvalidateRender();
            //this._pagesPanel?.SetDesiredScroll({ X: 0, Y: 792 * (pos.page + pos.y) * pos.scale });            
        }
    }

    public /* override */ OnRenderItem(item: any, props?: any): JSX.Element | null
    {                
        const pageProps = Object.assign(props || {}, 
        {
            VirtualizingItemsParent: this,
            PageIndex: item as number,
            Document: this.state.Document,            
            //Scale: this.state.Position?.scale || 1
        });
        return super.OnRenderItem(item, pageProps);
    }

    public Scale(scale: number)
    {
        this.SetValue(nameof(this.state.Position),
            {
                x: 0,
                y: 0,
                scale: scale * (this.state.Position?.scale || 1),
            });
        this.ItemsPanelInstance?.InvalidateRender();
    }

    /* protected virtual */ GetContainerForItemOverride(): typeof FrameworkElement
    {
        return DocumentPagePresenterBase;
    }

    private ConstructPageArray(pages: number): number[]
    {
        let arr: number[] = new Array(pages);
        for (let i = 0; i < pages; i++)
            arr[i] = i;
        return arr;
    }
}
export class DocumentViewer extends DocumentViewerBase<IDocumentViewerProps, IDocumentViewerState>
{
}
