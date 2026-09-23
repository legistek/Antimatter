import * as React from "react";
import { FrameworkElement, IFrameworkElementState } from "../FrameworkElement";
import { IStackPanelProps, StackPanelBase } from "../Controls/StackPanel";
import { DocumentPagePresenter } from "./DocumentPagePresenter";
import { DocumentViewer, DocumentViewerBase, IDocumentViewerProps } from "./DocumentViewer";
import { MultitouchTransform } from "../Media/MultitouchTransform";
import { Utilities, Point, Rect, Size, Binding, Span, Thickness } from "@antimatterjs/react";
import { IVirtualizingPanelProps, RenderWindowInfo, VirtualizingPanel } from "../Controls/VirtualizingPanel";

interface IDocumentPagesPanelProps extends IVirtualizingPanelProps
{
    Scale?: number;
    Heights?: number[] | Binding,
    Widths?: number[] | Binding,
}

export class DocumentPagesPanel extends VirtualizingPanel 
    <IDocumentPagesPanelProps, IFrameworkElementState>
{       
    public get Scroller(): HTMLElement | null
    {
        return this._scroller;
    }

    public get Heights(): number[] | undefined
    {
        return this.GetValue(nameof(this.props.Heights));
    }

    public get Widths(): number[] | undefined
    {
        return this.GetValue(nameof(this.props.Widths));
    }

    public GetContentBounds(index: number, rotated: boolean): Span | undefined
    {
        return this.GetItemBoundsPrivate(index, rotated, true);
    }

    /**
     * Returns a Span (start and end y-coordinate boundaries) for the item
     * by its index. Sub-classes must implement this item according to their 
     * specific needs.
     * @param itemIndex The 0-based index of the item.
     */
    protected override GetItemExpanseBounds(itemIndex: number): Span
    {
        return this.GetItemBoundsPrivate(itemIndex, this.ViewRotation === 90 || this.ViewRotation === 270);
    }

    private get ViewRotation(): number
    {
        return (this.ItemsParent as DocumentViewerBase)?.ViewRotation || 0;
    }

    private readonly _placeholderSize: number = 400;

    private GetItemBoundsPrivate(itemIndex: number, rotated: boolean, contentOnly?: boolean): Span
    {
        let top = 0, bottom = 0;
        let margin = (this.ItemsParent as DocumentViewerBase)?.SheetMargins || 0;

        if (!rotated)
        {
            for (let i = 0; i < itemIndex; i++)
            {
                var sz = this.LastKnownSizes[i];
                if (sz)
                    top += sz.Height;
                else if (this.Heights)
                    top += this.Heights[i] + 2 * margin;
                else
                {
                    this.LastKnownSizes[i] = new Size(this._placeholderSize, this._placeholderSize);
                    top += this._placeholderSize;
                }
            }
            var lastSz = this.LastKnownSizes[itemIndex];
            if (lastSz)
                bottom = top + lastSz.Height;
            else if (this.Heights)
                bottom = top + this.Heights[itemIndex] + 2 * margin;
            else
                bottom = top + this._placeholderSize;
        }
        else
        {
            for (let i = 0; i < itemIndex; i++)
            {
                var sz = this.LastKnownSizes[i];
                if (sz)
                    top += sz.Width;
                else if (this.Widths)
                    top += this.Widths[i] + 2 * margin;
                else
                {
                    this.LastKnownSizes[i] = new Size(this._placeholderSize, this._placeholderSize);
                    top += this._placeholderSize;
                }
            }
            var lastSz = this.LastKnownSizes[itemIndex];
            if (lastSz)
                bottom = top + lastSz.Width;
            else if (this.Widths)
                bottom = top + this.Widths[itemIndex] + 2 * margin;
            else
                bottom = top + this._placeholderSize;
        }

        if (contentOnly)
        {
            var padding = this.LastKnownPaddings[itemIndex];
            if (padding)
            {
                top += padding.Top;
                bottom += padding.Top;
                bottom -= padding.Bottom;
            }
        }

        return {
            Start: top * this.ActualScale,
            End: bottom * this.ActualScale
        };
    }

    public /* virtual */ ComputeRenderWindow(windowTop: number, windowBottom: number): RenderWindowInfo
    {
        return super.ComputeRenderWindow(windowTop, windowBottom);
    }

    override getCSSStyles()
    {
        var styles = super.getCSSStyles();
        styles.overflow = "hidden";
        // styles.width = "max-content";
        return styles;
    }
    
    override OnComponentMount()
    {
        var root = this.FindScroller();
        if (!root)
            return;
        this._scroller = root as HTMLElement;

        this.Container?.addEventListener("wheel", (e) =>
        {
            if (!(e as WheelEvent).ctrlKey)
                return;
            this.OnWheelScaling(e as WheelEvent);            
        });        
        super.OnComponentMount();
    }

    override constructClasses(): string
    {
        return super.constructClasses() + " amx-ptn-viewer-pagespanel ";
    }

    /* override */ componentDidUpdate(prevProps)
    {
        this.OnViewportChange();
    }

    private OnViewportChange(scale?: number)
    {
        if (!this._scroller)
            return;
        
        if (this._desiredScroll)
        {
            //console.log(`Setting scroll to ${this._desiredScroll.X}, ${this._desiredScroll.Y}`);
            this._scroller.scrollLeft = this._desiredScroll.X;
            this._scroller.scrollTop = this._desiredScroll.Y;
            this._desiredScroll = undefined;
            //console.log(`Actual scroll now ${this._scroller.scrollLeft}, ${this._scroller.scrollTop}`);
        }

        this.UpdatePagesOnScroll(scale);
    }

    /** Sets the desired scroll position for the VirtualizingPanel. 
     * @param pt A Point with the x and y scroll coordinates. The 
     * actual scroll position does not change immediately but rather
     * is updated once the component re-renders. This can be called
     * at the conclusion of a manipulation gesture, for example, to
     * set the scroll position to match the transform. Note this does
     * not itself invalidate the render of this panel. */
    public SetDesiredScroll(pt: Point, scale?: number)
    {        
        this._desiredScroll = pt;      

        this.OnViewportChange(scale);

        // Force immediate re-render (don't wait for loop)
        for (const page of this._realizedPages)
            page.OnViewportChanged();                
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
    public UpdatePagesOnScroll(scale?: number)
    {
        if (!this._realizedPages)
            return;
        
        let maxHeight: number = 0;
        let maxHeightContender: DocumentPagePresenter | undefined = undefined;
        let dominantRect: Rect | undefined = undefined;        

        for (const page of this._realizedPages)
        {            
            var rc = this.UpdatePageInView(page, scale);
            if (!rc)
                continue;
            if (rc.Height > maxHeight ||
                rc.Height === maxHeight &&
                    maxHeightContender &&
                    (page.PageIndex as number || 0) < (maxHeightContender.PageIndex as number ||0))
            {
                maxHeight = rc.Height;
                maxHeightContender = page;
                dominantRect = rc;
            }
        }

        if (!dominantRect)
            return; // shouldn't be possible

        var dominantRC = maxHeightContender?.Container?.getBoundingClientRect();
        var panelRC = this.Scroller?.getBoundingClientRect();
        if (!dominantRC || !panelRC)
            return;

        (this.ItemsParent as DocumentViewerBase)?.UpdateReportedPosition(
            maxHeightContender?.PageIndex || 0,
            scale || this.ActualScale,
            (panelRC.y - dominantRC.y) / dominantRC.height);        
    }

    /**
     * Updates the high-res render viewport for a specific realized page 
     * @param page The page presenter */
    public UpdatePageInView(page: DocumentPagePresenter, scale?: number): Rect|null
    {
        var rc = this.IsPageInView(page);
        if (rc)
            page.SetCurrentViewportWindow(
                rc,
                scale || this.ActualScale
                * (((this.state.Transform as MultitouchTransform)?.AbsoluteScale as number) || 1)

            );
        return rc;
    }

    private _hasRealizedFirstPage: boolean = false;

    /**
     * Called by the page presenter on realization so this panel can track the currently realized pages.
     * @param page the page presenter
     */
    public OnPageRealized(page: DocumentPagePresenter)
    {
        // console.log(`Page ${page.PageIndex} realized`);

        if (!this._hasRealizedFirstPage)
            (this.ItemsParent as DocumentViewer).ApplyPosition(
                (this.ItemsParent as DocumentViewer).Position,
                undefined);

        this._hasRealizedFirstPage = true;
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

    public override OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
    }

    public get ActualScale(): number
    {
        //return ((this.state.Scale as number) || 1);
        return ((this.ItemsParent as DocumentViewer)?.ActualScale as number) || 1;
    }

    public readonly LastKnownPaddings: Thickness[] = [];
    public readonly LastKnownSizes: Size[] = [];

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
        var scaleFactor = 1 + Math.abs(e.deltaY) / 400;
        if (e.deltaY > 0)
            scaleFactor = 1 / scaleFactor;

        (this.ItemsParent as DocumentViewer)?.ScaleAboutPoint(
            this.ActualScale * scaleFactor,
            this.ActualScale,
            center);
    }
    
    private _desiredScroll?: Point;
    //protected _scroller: HTMLElement | null = null;
    private _realizedPages: Set<DocumentPagePresenter> = new Set<DocumentPagePresenter>();
}