import * as React from "react";
import { Binding, BindingMode, Utilities } from "@antimatterjs/react";

import { Panel } from "../Controls/Panel";
import { DocumentPosition, IDocument, IDocumentPage } from "./IDocument";
import { WebStyle } from "../Style";
import { FrameworkElement } from "../FrameworkElement";
import { HorizontalAlignment, ScrollBarVisibility, VerticalAlignment } from "../Enums";
import { ControlTemplate } from "../FrameworkTemplate";
import { MultitouchTransform } from "../Media/MultitouchTransform";
import { Point, Rect } from "../Foundation";
import { IVirtualizingItemsControlProps, IVirtualizingItemsControlState, VirtualizingItemsControl, VirtualizingItemsControlBase } from "../Controls/VirtualizingItemsControl";
import { DocumentPagesPanel } from "./DocumentPagesPanel";
import { DocumentPagePresenterBase, IDocumentPagePresenterProps } from "./DocumentPagePresenter";
import { StackPanel } from "../Controls/StackPanel";
import { Grid } from "../Controls/Grid";

interface IDocumentViewerCommon
{
    Document?: IDocument|null
}
export interface IDocumentViewerProps extends IVirtualizingItemsControlProps, IDocumentViewerCommon
{
    Page?: number | Binding,
    Scale?: number | Binding,
    X?: number | Binding,
    Y?: number | Binding
}
export interface IDocumentViewerState extends IVirtualizingItemsControlState, IDocumentViewerCommon
{
    Page?: number,
    Scale?: number,
    X?: number,
    Y?: number
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

    public static DefaultBindings = {
        Scale: {
            Mode: BindingMode.TwoWay
        },
        Page: {
            Mode: BindingMode.TwoWay
        }
    };

    constructor(props)
    {
        super(props);
    }

    private template(): JSX.Element
    {
        return (
            <Grid
                ref={r => this._scroller = r}
                Background={this.Background}
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
                    HorizontalAlignment={HorizontalAlignment.Center}
                    VerticalAlignment={VerticalAlignment.Top}
                    ItemsParent={this}
                    VerticalScrollBarVisibility={ScrollBarVisibility.Hidden}
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
                        this.CommitTransform(this._scrollOrigin);                        
                    }).bind(this)}
                    Transform={this._tr}
                >
                </DocumentPagesPanel>
                <div
                    ref={r => this._sizeFaker = r}
                    style={{ height: 1, position: 'absolute' }} >
                </div>
            </Grid>);
    }

    public CommitTransform(scrollOrigin: Point, updateState: boolean = true)
    {
        var pagesPanel = this._pagesPanel;
        var scroller = this._scroller?.Container;
        if (!pagesPanel || !scroller || !pagesPanel.Container || !this._sizeFaker)
            return;

        if (updateState)
            this.SetValue(
                nameof(this.state.Scale),
                (this.state.Scale as number || 1) * this._tr?.AbsoluteScale || 1,
                false);

        this._sizeFaker.style.width = '0px';
        scroller.style.overflowX = "auto";

        var ds = {
            X: (pagesPanel?.Container?.parentElement?.getBoundingClientRect()?.x || 0) -
                (pagesPanel?.Container?.getBoundingClientRect().x || 0),
            Y: scrollOrigin.Y - ((this._tr?.AbsoluteY || 0) / 1)
        }

        this._tr.Reset();
        pagesPanel.SetDesiredScroll(ds);

        // Do we really have to do this?
        //this.InvalidateRender();
    }

    public static DefaultStyle: WebStyle<IDocumentViewerProps> = new WebStyle<IDocumentViewerProps>(
        {
            Background: "#E0E0E0",
            HorizontalScrollBarVisibility: ScrollBarVisibility.Auto,
            VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
            ItemContainerStyle: new WebStyle<IDocumentPagePresenterProps>(
                {
                    PagePadding: 5,
                    HorizontalAlignment: HorizontalAlignment.Center
                }),
            Template: new ControlTemplate((templatedParent: DocumentViewer) => templatedParent.template())
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
        else if (property === nameof(this.state.Scale))
        {            
            this.ScaleAboutPoint((value as number) / (oldValue as number), undefined, false);
        }
        else if (property === nameof(this.state.Page))
        {
            var page = this.ItemContainers[(this.state.Page as number || 0)];
            if (!page)
                return;
            var offset = (page.Container?.getBoundingClientRect().top || 0) -
                (this._pagesPanel?.Container?.getBoundingClientRect().top || 0);
            this._scroller?.Container?.scrollTo({
                top: offset,
                behavior: "smooth"
            });
        }
    }

    public ScaleAboutPoint(scaleFactor: number, center?: Point, updateState: boolean = true)
    {
        if (!this._scroller?.Container || !this._pagesPanel?.Container)
            return;

        var scrollOrigin = {
            X: this._pagesPanel.Container.getBoundingClientRect().x -
                (this._pagesPanel.Container.parentElement?.getBoundingClientRect()?.x || 0),
            Y: this._scroller?.Container.scrollTop || 0,
        };

        if (!center)
        {
            // Figure out the point on the pages panel that's the
            // center-top of the viewport
            center = FrameworkElement.TranslatePoint(
                {
                    X: this._scroller.Container.clientWidth / 2,
                    Y: 0 //this._scroller.Container.clientHeight / 2
                },
                this._scroller,
                this._pagesPanel);
        }

        this._tr.CenterX = center.X;
        this._tr.CenterY = center.Y;

        this._tr.ScaleX = this._tr.ScaleY = scaleFactor;

        this.CommitTransform(scrollOrigin, updateState);
    }

    public /* override */ OnRenderItem(item: any, index: number, props?: any): JSX.Element | null
    {                
        const pageProps = Object.assign(props || {}, 
        {
            VirtualizingItemsParent: this,
            PageIndex: item as number,
            Document: this.state.Document,            
            //Scale: this.state.Position?.scale || 1
        });
        return super.OnRenderItem(item, index, pageProps);
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
