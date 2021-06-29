import * as React from "react";
import { FrameworkElement } from "../FrameworkElement";
import { Point, Rect } from "../Foundation";
import { IStackPanelProps, IStackPanelState, StackPanel, StackPanelBase } from "../Controls/StackPanel";
import { DocumentPagePresenter } from "./DocumentPagePresenter";

interface IDocumentPagesPanelProps extends IStackPanelProps
{
    Scale?: number;
}
interface IDocumentPagesPanelState extends IStackPanelState
{
    Scale?: number;
}

export class DocumentPagesPanel extends StackPanelBase<IDocumentPagesPanelProps, IDocumentPagesPanelState>
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
                touchAction: "pan-y",
                transform: this.state.Scale ? `scale(${this.state.Scale})` : undefined,
                transformOrigin: this.ActualScale < 1 ? "0px 0px" : "50% 0px"
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
        this._maxWidth = Math.max(
            this._maxWidth,
            (this.Container?.clientWidth || 0));
        this.Container.style.width = `${this._maxWidth * this.ActualScale}px`;

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
            //console.log(`Setting scroll to ${this._desiredScroll.X}, ${this._desiredScroll.Y}`);
            this._scroller.scrollLeft = this._desiredScroll.X;
            this._scroller.scrollTop = this._desiredScroll.Y;
            this._desiredScroll = undefined;
            //console.log(`Actual scroll now ${this._scroller.scrollLeft}, ${this._scroller.scrollTop}`);
        }

        this.UpdatePagesOnScroll();
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
        var visibleUpperLeft = FrameworkElement.TranslatePoint(boundedUpperLeft, this.Scroller, page.CurrentCanvas);
        var visibleBottomRight = FrameworkElement.TranslatePoint(boundedBottomRight, this.Scroller, page.CurrentCanvas);
        if (visibleBottomRight.X <= visibleUpperLeft.X ||
            visibleBottomRight.Y <= visibleUpperLeft.Y)
            return null;

        return new Rect(
            Math.floor(visibleUpperLeft.X),
            Math.floor(visibleUpperLeft.Y),
            Math.ceil(visibleBottomRight.X - visibleUpperLeft.X),
            Math.ceil(visibleBottomRight.Y - visibleUpperLeft.Y));
    }

    /**
     * Updates all realized pages by recomputing their visible viewports
     * for high resolution rendering.
     **/
    public UpdatePagesOnScroll()
    {
        if (!this._realizedPages)
            return;
        for (const page of this._realizedPages)
            this.UpdatePageInView(page);
    }

    public UpdatePageInView(page: DocumentPagePresenter)
    {
        var rc = this.IsPageInView(page);
        if (rc)
            page.SetCurrentViewportWindow(
                rc,
                this.ActualScale * ((this.state.Transform?.AbsoluteScale as number) || 1));
    }

    public OnPageRealized(page: DocumentPagePresenter)
    {
        this._realizedPages.add(page);
    }

    public OnPageDerealized(page: DocumentPagePresenter)
    {
        this._realizedPages.delete(page);
    }

    /* override */ OnPropertyChanged(property: string, value: any, oldValue: any)
    {
    }

    private get ActualScale(): number
    {
        return ((this.state.Scale as number) || 1);
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



