import * as React from "react";
import { FrameworkElement } from "../FrameworkElement";
import { Point, Rect } from "../Foundation";
import { IStackPanelProps, IStackPanelState, StackPanelBase } from "../Controls/StackPanel";
import { DocumentPagePresenter } from "./DocumentPagePresenter";
import { DocumentViewer, IDocumentViewerProps } from "./DocumentViewer";
import { MultitouchTransform } from "../Media/MultitouchTransform";

interface IDocumentPagesPanelProps extends IStackPanelProps
{
    Scale?: number;
}

interface IDocumentPagesPanelState extends IStackPanelState
{
    Scale?: number;
}

export class DocumentPagesPanel extends
    StackPanelBase<IDocumentPagesPanelProps, IDocumentPagesPanelState>
{
    private _innerDiv: HTMLElement | null = null;

    public ScrollingUp: boolean = false;

    public get Scroller(): HTMLElement | null
    {
        return this._scroller;
    }

    /* override */ renderElement(): JSX.Element
    {        
        return (
            <div ref={r => this._innerDiv = r}
                style={{
                    touchAction: "pan-y",
                    transform: this.ActualScale ? `scale(${this.ActualScale})` : undefined,
                    transformOrigin: this.ActualScale < 1 ? "0px 0px" : "50% 0px"
                }}>
                {super.renderElement()}
            </div>
        );
    }




    public AdjustDimensionsOnChildRealization(newWidth: number, newHeight: number, deltaX: number, deltaY: number)
    {
        if (!this.Container || !this._scroller || !this._innerDiv)
            return;

        let hscroll: number = this._scroller.scrollLeft;
        let vscroll: number = this._scroller.scrollTop;

        this._maxWidth = Math.max(
            this._maxWidth,
            newWidth / Math.max(this.ActualScale, 1));
        this.Container.style.width = `${this._maxWidth * this.ActualScale}px`;
        if (this.ActualScale < 1)
            this._innerDiv.style.width = `${this._maxWidth}px`;
        else
            this._innerDiv.style.width = "auto";
        this._lastHeight += deltaY;        
        this.Container.style.height = `${this._lastHeight * this.ActualScale}px`;

        this._scroller.scrollLeft = hscroll;
        this._scroller.scrollTop = vscroll + (this.ScrollingUp ? (deltaY * this.ActualScale) : 0);
    }

    /** Must be called any time the dimensions of the panel may have changed.
     * @param childChanged true if being called because a child page changed 
     * dimensions due to first realization or otherwise. */
    public RecomputeDimensions(childChanged: boolean)
    {
        if (!this.Container || !this._scroller || !this._innerDiv)
            return;

        // Preserve hscroll and vscroll during the re-calc
        let hscroll: number = this._scroller.scrollLeft;
        let vscroll: number = this._scroller.scrollTop;

        // Measure desired width of the panel by changing the style to
        // "fit-content", then setting it explicitly depending on scale
        this.Container.style.width = "fit-content";
        this._innerDiv.style.width = "unset";
        this._maxWidth = Math.max(
            this._maxWidth,
            (this.Container?.clientWidth || 0));
        this.Container.style.width = `${this._maxWidth * this.ActualScale}px`;
        if (this.ActualScale < 1)
            this._innerDiv.style.width = `${this._maxWidth}px`;

        // Basically do the same thing with height but only 
        // if the scale changed; 
        
        var priorHeight = this.Container.clientHeight;        
        this.Container.style.height = "auto";
        var newHeight = this.Container.clientHeight * this.ActualScale;
        var diff = newHeight - priorHeight;
        this.Container.style.height = `${newHeight}px`;

        this._scroller.scrollLeft = hscroll;
        if (this.ScrollingUp && childChanged)
        {
            console.log(`Scrolling up preserving scroll position (diff: ${diff})`);
            this._scroller.scrollTop = vscroll + diff;
        }
        else
        {
            this._scroller.scrollTop = vscroll;
        }
    }

    /* override */ componentDidMount()
    {
        var root = this.FindScroller();
        if (!root)
            return;
        this._scroller = root;

        this.Container?.addEventListener("wheel", (e) =>
        {
            if (!e.ctrlKey)
                return;
            this.OnWheelScaling(e);            
        });
    }

    /* override */ componentDidUpdate(prevProps)
    {
        if (!this._scroller || !this._innerDiv)
            return;

        this._innerDiv.style.touchAction = "pan-y";
        this._innerDiv.style.transform = this.ActualScale ? `scale(${this.ActualScale})` : '';
        this._innerDiv.style.transformOrigin = this.ActualScale < 1 ? "0px 0px" : "50% 0px";


        //this.RecomputeDimensions(false);

        this._lastHeight = this._innerDiv.clientHeight;

        // TODO - Why does it get too wide sometimes???
        this.AdjustDimensionsOnChildRealization(0, 0, 0, 0);

        if (this._desiredScroll)
        {
            //console.log(`Setting scroll to ${this._desiredScroll.X}, ${this._desiredScroll.Y}`);
            this._scroller.scrollLeft = this._desiredScroll.X;
            this._scroller.scrollTop = this._desiredScroll.Y;
            this._desiredScroll = undefined;
            //console.log(`Actual scroll now ${this._scroller.scrollLeft}, ${this._scroller.scrollTop}`);
        }

        this.UpdatePagesOnScroll();
    }

    /** Sets the desired scroll position for the VirtualizingPanel. 
     * @param pt A Point with the x and y scroll coordinates. The 
     * actual scroll position does not change immediately but rather
     * is updated once the component re-renders. This can be called
     * at the conclusion of a manipulation gesture, for example, to
     * set the scroll position to match the transform. Note this does
     * not itself invalidate the render of this panel. */
    public SetDesiredScroll(pt: Point)
    {        
        this._desiredScroll = pt;        
        this.componentDidUpdate(null);
    }

    /**
     * Determines if a given page is in the scrollable view and if so returns
     * the visible bounds. The DocumentPagePresenter can/should call this 
     * when realized and periodically thereafter to render a high resolution
     * overlay apporpriate for the viewport.
     * @param page The page presenter
     */
    public IsPageInView(page: DocumentPagePresenter): Rect | null
    {
        if (!this.Scroller || !page.CurrentCanvas)
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
        var visibleUpperLeft = FrameworkElement.TranslatePoint(
            boundedUpperLeft,
            this.Scroller,
            page.CurrentCanvas);
        var visibleBottomRight = FrameworkElement.TranslatePoint(
            boundedBottomRight,
            this.Scroller,
            page.CurrentCanvas);
        if (visibleBottomRight.X <= visibleUpperLeft.X ||
            visibleBottomRight.Y <= visibleUpperLeft.Y)
            return null;

        return new Rect(
            Math.floor(visibleUpperLeft.X),
            Math.floor(visibleUpperLeft.Y),
            Math.ceil(visibleBottomRight.X - visibleUpperLeft.X),
            Math.ceil(visibleBottomRight.Y - visibleUpperLeft.Y));
    }

    /** Updates all realized pages by recomputing their visible viewports
     * for high resolution rendering and flagging the page as ready to
     * be repainted. Also updates the parent viewer with the current 
     * "dominant" page (the page that occupies the most space in the viewport). */
    public UpdatePagesOnScroll()
    {
        if (!this._realizedPages)
            return;

        let maxHeight: number = 0;
        let maxHeightContender: DocumentPagePresenter | undefined = undefined;

        for (const page of this._realizedPages)
        {            
            var rc = this.UpdatePageInView(page);
            if (!rc)
                continue;
            if (rc.Height > maxHeight ||
                rc.Height === maxHeight &&
                    maxHeightContender &&
                    (page.state.PageIndex as number || 0) < (maxHeightContender.state.PageIndex as number ||0))
            {
                maxHeight = rc.Height;
                maxHeightContender = page;
            }
        }

        // Update the current page with one with the dominant height in the scroller
        this.state.ItemsParent?.SetValue(
            nameof<IDocumentViewerProps>(p => p.Page),
            maxHeightContender?.state.PageIndex,
            false);
    }

    /**
     * Updates the high-res render viewport for a specific realized page 
     * @param page The page presenter */
    public UpdatePageInView(page: DocumentPagePresenter): Rect|null
    {
        var rc = this.IsPageInView(page);
        if (rc)
            page.SetCurrentViewportWindow(
                rc,
                this.ActualScale * ((this.state.Transform?.AbsoluteScale as number) || 1));
        return rc;
    }

    /**
     * Called by the page presenter on realization so this panel can track the currently realized pages.
     * @param page the page presenter
     */
    public OnPageRealized(page: DocumentPagePresenter)
    {
        console.log(`Page ${page.state.PageIndex} realized`);
        this._realizedPages.add(page);        
    }

    /**
     * Called by the page presenter on de-realization so this panel can track the currently realized pages.
     * @param page the page presenter
     */
    public OnPageDerealized(page: DocumentPagePresenter)
    {
        this._realizedPages.delete(page);
    }

    /* override */ OnPropertyChanged(property: string, value: any, oldValue: any)
    {
    }

    public get ActualScale(): number
    {
        //return ((this.state.Scale as number) || 1);
        return ((this.state.ItemsParent as DocumentViewer)?.state?.Scale as number) || 1;
    }

    private FindScroller(): HTMLElement | null | undefined
    {
        var elem = this.Container;
        while (elem && elem?.style.overflowY !== "auto")
            elem = elem.parentElement;
        return elem;
    }

    private OnWheelScaling(e: WheelEvent)
    {
        var center = FrameworkElement.TranslatePoint(
            {
                X: e.clientX,
                Y: e.clientY
            },
            undefined,
            this);

        // turn the deltaY into something usable as a scale; -100 = 2x, +100 = 1/2x
        var scaleFactor = -1.5 * (e.deltaY / 100);
        if (scaleFactor < 0)
            scaleFactor = -1 / scaleFactor;

        (this.state.ItemsParent as DocumentViewer)?.ScaleAboutPoint(scaleFactor, center);
    }

    private _maxWidth: number = 0;      // the UNSCALED maximum width of all children
    private _lastHeight: number = 0;    // the UNSCALED last measured height of the entire panel
    private _desiredScroll?: Point;
    private _scroller: HTMLElement | null = null;
    private _realizedPages: Set<DocumentPagePresenter> = new Set<DocumentPagePresenter>();
}