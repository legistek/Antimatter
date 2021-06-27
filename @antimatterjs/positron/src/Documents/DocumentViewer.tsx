import * as React from "react";
import { DefaultEffects } from "@fluentui/react";
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
import { IStackPanelProps, IStackPanelState, StackPanel, StackPanelBase } from "../Controls/StackPanel";
import { IVirtualizingItemsControlProps, IVirtualizingItemsControlState, VirtualizingItemsControl, VirtualizingItemsControlBase } from "../Controls/VirtualizingItemsControl";
import { IVirtualizedPanelProps, IVirtualizedPanelState, VirtualizedPanelBase } from "../Controls/VirtualizedPanel";
import { LoadingShimmer } from "../Controls/LoadingShimmer";

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
                    //Margin: "25px",
                    //BorderBrush: "#D0D0D0",
                    //BorderThickness: "1px",
                    //BoxShadow: DefaultEffects.elevation8,
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

interface IDocumentPagesPanelProps extends IStackPanelProps
{
    Scale?: number;    
}
interface IDocumentPagesPanelState extends IStackPanelState
{
    Scale?: number;    
}

class DocumentPagesPanel extends StackPanelBase<IDocumentPagesPanelProps, IDocumentPagesPanelState>
{
    public ScrollingUp: boolean = false;

    public get Scroller(): HTMLElement | null
    {
        return this._scroller;
    }

    /* override */ renderElement(): JSX.Element
    {
        return (
            <div style={{
                transform: this.state.Scale ? `scale(${this.state.Scale})` : undefined,
                transformOrigin: "50% 0px"
            }}>  
                {super.renderElement()}
            </div>
            );
    }

    /** Must be called by a DocumentPagePresenter any time it may have changed 
     * dimensions base size due to realization or any other reason. */
    public RecomputeDimensions(preserveScroll: boolean)
    {
        if (!this.Container || !this._scroller)
            return;

        // Preserve hscroll and vscroll during the re-calc
        let hscroll: number = this._scroller.scrollLeft;
        let vscroll: number = this._scroller.scrollTop;

        // Measure desired width of the panel by changing the style to
        // "fit-content", then setting it explicitly depending on scale
        this.Container.style.width = "fit-content";
        this._maxWidth = Math.max(this._maxWidth, this.Container?.clientWidth || 0);

        // For some reason with scales < 1 we DON'T want to apply a scale
        // to the panel width.
        this.Container.style.width = `${this._maxWidth * Math.max(this.ActualScale, 1)}px`;

        // Basically do the same thing with height but only 
        // if the scale changed; 

        var priorHeight = this.Container.clientHeight;
        this.Container.style.height = "auto";
        this.Container.style.height = `${this.Container.clientHeight * this.ActualScale}px`;
       
        this._scroller.scrollLeft = hscroll;
        if (this.ScrollingUp && preserveScroll)
        {
            this._scroller.scrollTop = vscroll +
                (this.Container.clientHeight - priorHeight);
        }

        //// Restore hscroll
        ////if (preserveScroll)
        //{
        //    this._scroller.scrollLeft = hscroll;
        //    this._scroller.scrollTop = vscroll;
        //}

        //if (!preserveScroll && this.ScrollingUp && scrollAdj)
        //{
        //    this._scroller.scrollBy({
        //        behavior: "auto",
        //        left: 0,
        //        top: scrollAdj * this.ActualScale
        //    });
        //}
    }

    /* override */ componentDidMount()
    {
        var root = this.FindScroller();
        if (!root)
            return;
        this._scroller = root;
    }

    /* override */ componentDidUpdate(prevProps)
    {
        if (!this._scroller)
            return;

        this.RecomputeDimensions(false);

        if (this._desiredScroll)
        {
            console.log(`Setting scroll to ${this._desiredScroll.X}, ${this._desiredScroll.Y}`);
            this._scroller.scrollLeft = this._desiredScroll.X;
            this._scroller.scrollTop = this._desiredScroll.Y;
            this._desiredScroll = undefined;
            console.log(`Actual scroll now ${this._scroller.scrollLeft}, ${this._scroller.scrollTop}`);
        }
    }

    /**
     * Sets the desired scroll position for the VirtualizingPanel. 
     * @param pt A Point with the x and y scroll coordinates. The 
     * actual scroll position does not change immediately but rather
     * is updated once the component re-renders. This can be called
     * at the conclusion of a manipulation gesture, for example, to
     * set the scroll position to match the transform.
     */
    public SetDesiredScroll(pt: Point)
    {
        this._desiredScroll = pt;
        console.log("SetDesiredScroll");
        //this.InvalidateRender();
    }

    /**
     * Determines if a given page is in the scrollable view and if so returns
     * the visible bounds. The DocumentPagePresenter can/should call this 
     * when realized and periodically thereafter to render a high resolution
     * overlay apporpriate for the viewport.
     * @param page The DocumentPagePresenter
     */
    public IsPageInView(page: DocumentPagePresenter): Rect|null
    {
        if (!this.Scroller || !page.CurrentCanvas || !page.state.IsRealized)
            return null;
        const viewRenderWidth = this.Scroller.clientWidth;
        const viewRenderHeight = this.Scroller.clientHeight;

        // Upper left corner of canvas relative to scroller
        var upperLeft = FrameworkElement.TranslatePoint(
            new Point(),
            page.CurrentCanvas,
            this.Scroller);
        // Bottom right corner of canvas relative to scroller
        var bottomRight = FrameworkElement.TranslatePoint(
            new Point(
                page.CurrentCanvas.getBoundingClientRect().width,
                page.CurrentCanvas.getBoundingClientRect().height),
            page.CurrentCanvas,
            this.Scroller);

        // Derive the bounds of the visible portion of the canvas
        // relative to the scroller
        var boundedUpperLeft = new Point(
            Math.max(0, Math.min(viewRenderWidth, upperLeft.X)),
            Math.max(0, Math.min(viewRenderHeight, upperLeft.Y))
        );
        var boundedBottomRight = new Point(
            Math.min(viewRenderWidth, Math.max(0, bottomRight.X)),
            Math.min(viewRenderHeight, Math.max(0, bottomRight.Y))
        );

        // Translate the visible bounds back to canvas coordinates
        var visibleUpperLeft = FrameworkElement.TranslatePoint(boundedUpperLeft, this.Scroller, page.CurrentCanvas);
        var visibleBottomRight = FrameworkElement.TranslatePoint(boundedBottomRight, this.Scroller, page.CurrentCanvas);
        if (visibleBottomRight.X <= visibleUpperLeft.X ||
            visibleBottomRight.Y <= visibleUpperLeft.Y)
            return null;

        return new Rect(
            visibleUpperLeft.X,
            visibleUpperLeft.Y,
            visibleBottomRight.X - visibleUpperLeft.X,
            visibleBottomRight.Y - visibleUpperLeft.Y);
    }

    /**
     * Updates all realized pages by recomputing their visible viewports
     * for high resolution rendering.
     **/
    public UpdatePagesOnScroll()
    {
        for (const page of this._realizedPages)
        {
            var rc = this.IsPageInView(page);
            if (rc)
                page.SetCurrentViewportWindow(rc, this.state.Scale || 1);
        }
    }

    public OnPageRealized(page: DocumentPagePresenter)
    {
        this._realizedPages.add(page);
    }

    public OnPageDerealized(page: DocumentPagePresenter)
    {
        this._realizedPages.delete(page);
    }

    private get ActualScale(): number
    {
        return (this.state.Scale as number) || 1;
    }

    private FindScroller(): HTMLElement | null | undefined
    {
        var elem = this.Container;
        while (elem && elem?.style.overflowY !== "auto")
            elem = elem.parentElement;
        return elem;
    }

    private _maxWidth: number = 0;
    private _desiredScroll?: Point;
    private _scroller: HTMLElement | null = null;
    private _realizedPages: Set<DocumentPagePresenter> = new Set<DocumentPagePresenter>();
}

interface IDocumentPagePresenterCommon
{
    Document?: IDocument | null,
    PageIndex?: number,
    PagePadding?: number
}

interface IDocumentPagePresenterProps extends IVirtualizedPanelProps, IDocumentPagePresenterCommon
{
}
interface IDocumentPagePresenterState extends IVirtualizedPanelState, IDocumentPagePresenterCommon
{
}
class DocumentPagePresenterBase<
    P extends IDocumentPagePresenterProps = {},
    S extends IDocumentPagePresenterState = {}>
    extends VirtualizedPanelBase<P, S>
{
    public get CurrentCanvas(): HTMLCanvasElement|null
    {
        return this._currentCanvas;        
    }

    public SetCurrentViewportWindow(rc: Rect, scale: number)
    {
        console.log(`Page ${this.state.PageIndex} Current Viewport - X: ${rc.X}, Y: ${rc.Y}, Width: ${rc.Width}, Height: ${rc.Height}, Scale: ${scale} `);
    }

    /* override */ RenderRealizedElement(): JSX.Element
    {
        return (
            <>
                <div className="amx-ptn-fe amx-ptn-ha-center"
                    style={{
                        background: "white",
                        overflow: "visible",
                        margin: this.state.PagePadding,
                        width: ((this._page?.Width || 612) as number),
                        height: ((this._page?.Height || 792) as number),
                        boxShadow: DefaultEffects.elevation4
                    }}>
                    <canvas
                        style={{
                            width: this._page?.Width || 612,
                            height: this._page?.Height || 792
                        }}
                        ref={r => this.RenderCanvas(r)}
                    />
                    {this._smallImage === null ? (<LoadingShimmer Overlaps={true} Lines={20} LineHeight={8} />) : (<></>)}
                </div>

            </>
        );        
    }

    /* override */ componentDidUpdate(prevProps)
    {
        if (!this._hasRendered)
        {
            this._lastWidth = this.Container?.clientWidth || 0;
            this._lastHeight = this.Container?.clientHeight || 0;
            this._hasRendered = true;
        }
    }

    protected /* override */ async OnRealization()
    {
        this._isDirty = true;
        this.PagesPanel?.OnPageRealized(this);
    }

    protected /* override */ OnDerealization()
    {
        this._isDirty = false;
        this.PagesPanel?.OnPageDerealized(this);
    }

    /* override */ getCSSStyles(): React.CSSProperties
    {
        var styles = {
            //width: "max-content"
            //background: "white",
            width: ((this._page?.Width || 612) as number) + (this.state.PagePadding as number || 0) * 2,
            height: ((this._page?.Height || 792) as number) + (this.state.PagePadding as number || 0) * 2,
        };
        return Object.assign(super.getCSSStyles(), styles);
    }

    /* override */ OnPropertyChanged(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.state.Document) || property === nameof(this.state.PageIndex))
            this.InvalidatePage();
    }

    private get PagesPanel(): DocumentPagesPanel
    {
        return (this.state.VirtualizingItemsParent?.ItemsPanelInstance as DocumentPagesPanel);
    }

    private async RenderSmallImageAsync(): Promise<boolean>
    {
        if (!this.state.Document)
            return false;
        if (!this._smallImage)
            this._smallImage = document.createElement('canvas');
        if (!this._page)
        {
            this._page = await this.state.Document.GetPageAsync((this.state.PageIndex || 0) as number);
            if (!this._page)
                return false;
        }

        console.log(`Rendering PDF page small image ${this.state.PageIndex}`);
        await this._page.RenderAsync(this._smallImage, 1);
        this.InvalidateRender();
        return true;
    }

    private async RenderCanvas(canvas: HTMLCanvasElement | null)
    {
        if (canvas === null || !this._isDirty || !this.state.Document)
            return;

        this._currentCanvas = canvas;

        if (!this._smallImage)
        {
            // Even though we're realized, wait a bit to make sure
            // we're STILL dirty. We don't want fast scrolls, etc., to result
            // in unneeded rendering
            await Utilities.SleepAsync(50);
            if (!this._isDirty)
                return;

            this._isDirty = false;

            if (!await this.RenderSmallImageAsync() || !this._smallImage)
                return;
        }
        else
        {
            this._isDirty = false;
        }

        //var tempCanvas = document.createElement('canvas');
        //tempCanvas.width = viewport.width;
        //tempCanvas.height = viewport.height;
        //var tempContext = tempCanvas.getContext("2d");
        //await this._page.render({
        //    canvasContext: tempContext,
        //    viewport: viewport
        //}).promise;

        console.log(`Painting PDF page small image ${this.state.PageIndex}`);

        var ctx = canvas.getContext("2d");
        canvas.width = this._smallImage?.width || 0;
        canvas.height = this._smallImage?.height || 0;
        ctx?.drawImage(this._smallImage, 0, 0);

        this.InvalidateMeasure();        
    }

    private InvalidatePage()
    {
        this._page = null;
        this._isDirty = true;
        this._hasRendered = false;
        this.InvalidateRender();
    }

    private InvalidateMeasure()
    {
        if (!this.Container ||
            this._lastWidth === this.Container.clientWidth &&
                this._lastHeight === this.Container.clientHeight)
            return;

        // Adjust vscroll if the newly re-sized item is coming into view above us
        //if ((resizedChild.Container?.getBoundingClientRect()?.top || 0) <
        //this._scroller.getBoundingClientRect().top)

        this.PagesPanel?.RecomputeDimensions(true);
        
        this._lastWidth = this.Container?.clientWidth || 0;
        this._lastHeight = this.Container?.clientHeight || 0;
    }

    private _currentCanvas: HTMLCanvasElement | null = null;
    private _lastWidth: number = 0;
    private _lastHeight: number = 0;
    private _isDirty: boolean = false;
    private _page?: IDocumentPage | null;
    private _smallImage: HTMLCanvasElement | null = null;
    private _hasRendered: boolean = false;
}
class DocumentPagePresenter extends DocumentPagePresenterBase<IDocumentPagePresenterProps, IDocumentPagePresenterState>
{
}