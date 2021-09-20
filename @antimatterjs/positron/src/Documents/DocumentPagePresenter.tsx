import * as React from "react";
import { DefaultEffects } from "@fluentui/react";
import { Binding, Utilities } from "@antimatterjs/react";
import { DocumentPosition, IDocument, IDocumentPage } from "./IDocument";
import { Point, Rect } from "../Foundation";
import { IVirtualizedPanelProps, IVirtualizedPanelState, VirtualizedPanelBase } from "../Controls/VirtualizedPanel";
import { LoadingShimmer } from "../Controls/LoadingShimmer";
import { DocumentPagesPanel } from "./DocumentPagesPanel";
import { FrameworkElement } from "../FrameworkElement";
import { CSSClasses } from "../CSSClasses";

interface IDocumentPagePresenterCommon
{
    Document?: IDocument | null,
    PageIndex?: number,
    PagePadding?: number
}

export interface IDocumentPagePresenterProps extends IVirtualizedPanelProps, IDocumentPagePresenterCommon
{
}

interface IDocumentPagePresenterState extends IVirtualizedPanelState, IDocumentPagePresenterCommon
{
}

export class DocumentPagePresenterBase<
    P extends IDocumentPagePresenterProps = {},
    S extends IDocumentPagePresenterState = {}>
    extends VirtualizedPanelBase<P, S>
{
    public get CurrentCanvas(): HTMLCanvasElement | null
    {
        return this._currentCanvas;
    }

    public SetCurrentViewportWindow(rc: Rect, scale: number)
    {
        //console.log(`Setting high res viewport on page ${this.state.PageIndex} x=${rc.X} y=${rc.Y} width=${rc.Width} height=${rc.Height} scale=${scale}`);

        var x = Math.max(0, Math.floor(rc.X / scale) - 1);
        var y = Math.max(0, Math.floor(rc.Y / scale) - 1);
        var width = Math.min(Math.ceil(rc.Width / scale) + 2, (this._page?.Width || 0) - x);
        var height = Math.min(Math.ceil(rc.Height / scale) + 2, (this._page?.Height || 0) - y);
        this._currentHighResViewport = new Rect(x, y, width, height);
        this._currentHighResScale = scale;
        this._isHighResViewportDirty = true;
    }

    /* override */ RenderRealizedElement(): JSX.Element
    {
        console.log(`Page ${this.state.PageIndex} rendering realized`);
        return (
            <>
                <div className={`${CSSClasses.Base} ${CSSClasses.HACenter}`}
                    ref={r => this._outerDiv = r}
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
                            zIndex: 1,
                            width: this._page?.Width || 612,
                            height: this._page?.Height || 792
                        }}
                        ref={r => this.RenderSmallCanvas(r)} />
                    <canvas
                        style={{
                            zIndex: 2,
                            position: "absolute",
                            transformOrigin: "0 0",
                            //width: 0,
                            //height: 0,
                            //left: 0,
                            //top: 0
                        }}
                        ref={r => this.RenderHighResCanvas(r)} />
                    <div className={`${CSSClasses.Base} ${CSSClasses.HAStretch} ${CSSClasses.VAStretch} ${CSSClasses.Overlaps} amx-ptn-pdf-textlayer`}
                        style={{
                            zIndex: 3,
                        }}
                        ref={r => this.RenderText(r)}>

                    </div>
                    {!this._smallImage ? (<LoadingShimmer Overlaps={true} Lines={20} LineHeight={8} />) : (<></>)}
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
        this.InvalidateMeasure();
    }

    protected /* override */ async OnRealization()
    {
        console.log(`Page ${this.state.PageIndex} realized`);
        this._isDirty = true;
        this._isHighResViewportDirty = true;
        this.PagesPanel?.OnPageRealized(this);
        if (!this._isHighResLoopActive)
        {
            // Guarantee we don't accidentally start a render loop twice for the 
            // same page; unclear exactly how many times the IntersectionObserver
            // might get triggered for the same realization event.
            this._isHighResLoopActive = true;
            this.BeginHighResRenderLoopAsync();
        }
    }

    protected /* override */ OnDerealization()
    {
        console.log(`Page ${this.state.PageIndex} de-realized`);
        this._isDirty = false;
        this._isHighResLoopActive = false;
        this._currentCanvas = null;
        this._currentHighResCanvas = null;
        this._largeImage = null;
        this._smallImage = null;
        this.PagesPanel?.OnPageDerealized(this);
        //console.log(`Page ${this.state.PageIndex} derealized`);
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

    private async BeginHighResRenderLoopAsync(): Promise<void>
    {
        while (this._isHighResLoopActive)
        {
            if (this._isHighResViewportDirty)
            {
                await this.RenderHighResImageAsync();
            }
            await Utilities.SleepAsync(250);
        }
    }

    private async RenderHighResImageAsync(): Promise<void>
    {
        //if (this._isRenderingHighResImage)
        //{
        //    console.log("!!! Already rendering high res image !!!");
        //}
        //if (this._currentHighResScale <= 1)
        //{
        //    console.log("!!! Skipping high res render - scale < 1");
        //}
        //if (!this._page)
        //{
        //    console.log("!!! Skipping high res render - _page undefined");
        //}
        if (!this._page || this._currentHighResScale <= 1 || this._isRenderingHighResImage)
            return;

        var rc = this._currentHighResViewport;
        //console.log(`Rendering high res viewport on page ${this.state.PageIndex} x=${rc.X} y=${rc.Y} width=${rc.Width} height=${rc.Height} scale=${this._currentHighResScale}`);

        this._isRenderingHighResImage = true;

        this._largeImage = document.createElement('canvas');        
        
        this._largeImage.width = Math.ceil(this._currentHighResViewport.Width * this._currentHighResScale);
        this._largeImage.height = Math.ceil(this._currentHighResViewport.Height * this._currentHighResScale);
        this._lastRenderedHighResViewport = this._currentHighResViewport;
        this._isHighResViewportDirty = false;
        await this._page.RenderAsync(this._largeImage, this._currentHighResViewport, this._currentHighResScale);
        
        this.RenderHighResCanvas();
        this._isRenderingHighResImage = false;
        
    }

    private async RenderSmallImageAsync(): Promise<boolean>
    {
        if (!this.state.Document)
            return false;
        if (!this._page)
        {
            this._page = await this.state.Document.GetPageAsync((this.state.PageIndex || 0) as number);
            if (!this._page)
                return false;
        }

        if (this._isRenderingSmallImage)
            return false;
        this._isRenderingSmallImage = true;

        if (!this._smallImage)
            this._smallImage = document.createElement("canvas");
        this._smallImage.width = this._page.Width;
        this._smallImage.height = this._page.Height;

        //console.log(`Rendering PDF page small image ${this.state.PageIndex}`);
        await this._page.RenderAsync(this._smallImage, new Rect(0, 0, this._page.Width, this._page.Height), 1);

        this._isRenderingSmallImage = false;

        return true;
    }

    private RenderHighResCanvas(canvas?: HTMLCanvasElement | null)
    {
        this._currentHighResCanvas = canvas || this._currentHighResCanvas;
        if (this._currentHighResCanvas === null ||
            this._currentHighResScale <= 1 ||
            !this._page ||
            !this._largeImage ||
            this._largeImage.width === 0 ||
            this._largeImage.height === 0)
        {
            if (this._currentHighResCanvas)
            {
                this._currentHighResCanvas.width = 0;
                this._currentHighResCanvas.height = 0;
            }
            return;
        }

        this._currentHighResCanvas.width = this._largeImage.width;
        this._currentHighResCanvas.height = this._largeImage.height;

        var ctx = this._currentHighResCanvas.getContext("2d");
        ctx?.drawImage(this._largeImage, 0, 0);
        this._currentHighResCanvas.style.left = `${Math.round(this._lastRenderedHighResViewport.X  )}px`;
        this._currentHighResCanvas.style.top = `${Math.round(this._lastRenderedHighResViewport.Y)}px`;

        //this._currentHighResCanvas.style.width = `${Math.round(this._lastRenderedHighResViewport.Width)}px`;
        //this._currentHighResCanvas.style.height = `${Math.round(this._lastRenderedHighResViewport.Height)}px`;

        var scale = this._lastRenderedHighResViewport.Width / this._currentHighResCanvas.width
        this._currentHighResCanvas.style.transform = `scale(${(scale)})`;
    }

    private async RenderText(textLayer: HTMLDivElement | null)
    {
        if (!textLayer || !this._page)
            return;
        await this._page.RenderTextAsync(textLayer);
    }

    private async RenderSmallCanvas(canvas: HTMLCanvasElement | null)
    {
        if (canvas === null || !this._isDirty || !this.state.Document)
            return;
        
        this._currentCanvas = canvas;

        // Even though we're realized, wait a bit to make sure
        // we're STILL dirty before actually painting for the first time. 
        // We don't want fast scrolls, etc., to result in unneeded 
        // rendering
        await Utilities.SleepAsync(50);
        if (!this._isDirty)
            return;

        console.log(`Rendering small canvas for page: ${this.state.PageIndex}`);

        this._isDirty = false;

        if (!await this.RenderSmallImageAsync())
            return;

        //console.log(`Painting PDF page small image ${this.state.PageIndex}`);

        if (!this._smallImage)
            // Maybe if scroll out / derealization
            // happened during render
            return;
        var ctx = canvas.getContext("2d");
        canvas.width = this._smallImage.width || 0;
        canvas.height = this._smallImage.height || 0;        
        ctx?.drawImage(this._smallImage, 0, 0);

        this.PagesPanel?.UpdatePageInView(this);
        
        this.InvalidateRender();
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
        if (!this.Container
            //||
            //this._lastWidth === this.Container.clientWidth &&
            //this._lastHeight === this.Container.clientHeight
        )
            return;

        var newWidth = this.Container?.clientWidth || 0;
        var newHeight = this.Container?.clientHeight || 0;

        //console.log(`Invalidating measure for page: ${this.state.PageIndex}, width diff: ${newWidth - this._lastWidth}, ${newHeight - this._lastHeight}`);
        //this.PagesPanel?.RecomputeDimensions(true);
        this.PagesPanel?.AdjustDimensionsOnChildRealization(
            newWidth,
            newHeight,
            newWidth - this._lastWidth,
            newHeight - this._lastHeight);

        this._lastWidth = this.Container?.clientWidth || 0;
        this._lastHeight = this.Container?.clientHeight || 0;
    }

    private _isRenderingSmallImage: boolean = false;
    private _isRenderingHighResImage: boolean = false;
    private _currentHighResCanvas: HTMLCanvasElement | null = null;
    private _currentCanvas: HTMLCanvasElement | null = null;
    private _lastWidth: number = 0;     // the UNSCALED last measured width of the item
    private _lastHeight: number = 0;    // the UNSCALED last measured height of the item
    private _isDirty: boolean = false;
    private _page?: IDocumentPage | null;
    private _smallImage: HTMLCanvasElement | null = null;
    private _largeImage: HTMLCanvasElement | null = null;
    private _hasRendered: boolean = false;
    private _currentHighResViewport: Rect = new Rect();
    private _lastRenderedHighResViewport: Rect = new Rect();
    private _currentHighResScale: number = 1;
    private _isHighResViewportDirty: boolean = false;
    private _isHighResLoopActive: boolean = false;
    private _outerDiv: HTMLDivElement | null = null;
}
export class DocumentPagePresenter extends DocumentPagePresenterBase<IDocumentPagePresenterProps, IDocumentPagePresenterState>
{
}