import * as React from "react";
import { Binding, BindingParameters, Utilities, Point, Rect, Size, Thickness, Antimatter, BindingMode } from "@antimatterjs/react";
import { DocumentPosition, IDocument, IDocumentPage } from "./IDocument";
import { DocumentPagesPanel } from "./DocumentPagesPanel";
import { FrameworkElement } from "../FrameworkElement";
import { CSSClasses } from "../CSSClasses";
import { IPanelProps, IPanelState, Panel, PanelBase } from "../Controls/Panel";
import { DocumentViewer, DocumentViewerBase } from "./DocumentViewer";
import { BusyPanel } from "../Controls/BusyPanel";
import { MultitouchTransform, RotateTransform } from "../Media/MultitouchTransform";
import { TemplateProp, WebStyle } from "../Style";
import { HorizontalAlignment } from "../Enums";

export interface IDocumentPagePresenterProps extends IPanelProps
{
    Document?: IDocument | null,
    Page?: IDocumentPage | Binding,
    PageIndex?: number,
    PagePadding?: number | string | Binding,
    HighRezDelay?: number,
    RenderAnnotations?: ((presenter: DocumentPagePresenterBase) => JSX.Element) | Binding,
    RenderPaddedAnnotations?: ((presenter: DocumentPagePresenterBase) => JSX.Element) | Binding,
    RenderOverTextAnnotations?: ((presenter: DocumentPagePresenterBase) => JSX.Element) | Binding,
}

export class DocumentPagePresenterBase<P extends IDocumentPagePresenterProps = {},
    S extends IPanelState = {}> extends PanelBase<P, S>
{
    public static readonly PART_Paper = Antimatter.Identifier('amx-ptn-viewer-paper');
    public static readonly PART_PaperOverlay = Antimatter.Identifier('amx-ptn-viewer-paper-overlay');
    public static readonly PART_ImageContainer = Antimatter.Identifier('amx-ptn-viewer-imgbox-container');
    public static readonly PART_Rotator = Antimatter.Identifier('amx-ptn-viewer-rotated-imgbox');
    public static readonly PART_LowResImage = Antimatter.Identifier('amx-ptn-viewer-image-lowres');
    public static readonly PART_HiResImage = Antimatter.Identifier('amx-ptn-viewer-image-highres');
    public static readonly PART_ImageOverlay = Antimatter.Identifier('amx-ptn-viewer-image-overlay');
    public static readonly PART_TextLayer = Antimatter.Identifier('amx-ptn-pdf-textlayer');
    public static readonly PART_PagesPanel = Antimatter.Identifier('amx-ptn-pdf-pagespanel');

    public static readonly STATE_Manipulating = Antimatter.Identifier("amx-ptn-manipulating");
    public static readonly STATE_NoSelect = Antimatter.Identifier("amx-ptn-viewer-noselect");
    public static readonly STATE_TextSelected = Antimatter.Identifier("amx-ptn-viewer-text-selected");


    public static readonly VAR_PageImageWidth = Antimatter.Identifier('--amx-ptn-pg-img-wd', true);
    public static readonly VAR_PageImageHeight = Antimatter.Identifier('--amx-ptn-pg-img-ht', true);

    public static readonly c_Z_LowRezImage: number = 100;
    public static readonly c_Z_HiRezImage: number = 200;
    public static readonly c_Z_AnnotationsAndTextLayer: number = 500;


    public static DefaultStyle = new WebStyle<IDocumentPagePresenterProps>(
        {
            HorizontalAlignment: HorizontalAlignment.Center,
            HighRezDelay: 150,
        },
        {
            "@": {
                [DocumentPagePresenterBase.VAR_PageImageWidth]: "612px",
                [DocumentPagePresenterBase.VAR_PageImageHeight]: "792px",
                [`--amx-ptn-unsc-sheet-wd`]: "612px",
                [`--amx-ptn-unsc-sheet-ht`]: "792px",
                height: "calc(var(--amx-ptn-unsc-sheet-ht) * var(--docviewer-scale))",
                width: "calc(var(--amx-ptn-unsc-sheet-wd) * var(--docviewer-scale)) !important",
            } as any,
            ".rotate90 @, .rotate270 @": {
                height: "calc(var(--amx-ptn-unsc-sheet-wd) * var(--docviewer-scale))",
                width: "calc(var(--amx-ptn-unsc-sheet-ht) * var(--docviewer-scale)) !important",
            },
            [`@ .${DocumentPagePresenterBase.PART_Paper}`]: {
                background: "white",
                overflow: "visible",
                margin: `calc(var(--sheet-margins) * var(--docviewer-scale)) 0px`,
                boxShadow: "rgb(0 0 0 / 13%) 0px 1.6px 3.6px 0px, rgb(0 0 0 / 11%) 0px 0.3px 0.9px 0px",
            },
            [`@ .${DocumentPagePresenterBase.PART_ImageContainer}`]: {
                overflow: "visible",
                width: `calc(var(${DocumentPagePresenterBase.VAR_PageImageWidth}) * var(--docviewer-scale))`,
                height: `calc(var(${DocumentPagePresenterBase.VAR_PageImageHeight}) * var(--docviewer-scale))`,
                marginTop: `calc(var(--padding-top) * var(--docviewer-scale))`,
                marginBottom: `calc(var(--padding-bottom) * var(--docviewer-scale))`,
            },
            [`.rotate90 @ .${DocumentPagePresenterBase.PART_ImageContainer}, .rotate270 @ .${DocumentPagePresenterBase.PART_ImageContainer}`]: {
                width: `calc(var(${DocumentPagePresenterBase.VAR_PageImageHeight}) * var(--docviewer-scale))`,
                height: `calc(var(${DocumentPagePresenterBase.VAR_PageImageWidth}) * var(--docviewer-scale))`
            },
            [`@ .${DocumentPagePresenterBase.PART_Rotator}`]: {
                width: "100%",
                height: `calc(var(${DocumentPagePresenterBase.VAR_PageImageHeight}) * var(--docviewer-scale))`,
            },
            [`.rotate90 @ .${DocumentPagePresenterBase.PART_Rotator}`]: {
                transform: "rotate(90deg)"
            },
            [`.rotate180 @ .${DocumentPagePresenterBase.PART_Rotator}`]: {
                transform: "rotate(180deg)"
            },
            [`.rotate270 @ .${DocumentPagePresenterBase.PART_Rotator}`]: {
                transform: "rotate(270deg)",
                width: `calc(var(${DocumentPagePresenterBase.VAR_PageImageWidth}) * var(--docviewer-scale))`,
                height: "100%"
            },
            [`@ .${DocumentPagePresenterBase.PART_LowResImage}`]: {
                position: "absolute",
                width: `calc(var(${DocumentPagePresenterBase.VAR_PageImageWidth}) * var(--docviewer-scale))`,
                height: `calc(var(${DocumentPagePresenterBase.VAR_PageImageHeight}) * var(--docviewer-scale))`,
                zIndex: 100,
                pointerEvents: "none"
            },
            [`@ .${DocumentPagePresenterBase.PART_HiResImage}`]: {
                position: "absolute",
                transformOrigin: "0% 0%",
                pointerEvents: "none",
                zIndex: 200
            },
            [`@ .${DocumentPagePresenterBase.PART_ImageOverlay}`]: {
                zIndex: 500,
                width: `var(${DocumentPagePresenterBase.VAR_PageImageWidth})`,
                height: `var(${DocumentPagePresenterBase.VAR_PageImageHeight})`,
                position: "absolute",
                left: "50%",
                transform: "translate(-50%)",
                scale: "var(--docviewer-scale)",
                transformOrigin: "0% 0%",
                mixBlendMode: "multiply",
                userSelect: "text",
                WebkitUserSelect: "text"
            },
            [`.${DocumentPagePresenterBase.PART_ImageOverlay} > *:not(.${DocumentPagePresenterBase.PART_TextLayer})`]: {
                width: `var(${DocumentPagePresenterBase.VAR_PageImageWidth}) !important`,
                height: `var(${DocumentPagePresenterBase.VAR_PageImageHeight}) !important`
            },
            [`.rotate90 @ .${DocumentPagePresenterBase.PART_ImageOverlay}`]: {
                width: `var(${DocumentPagePresenterBase.VAR_PageImageHeight})`
            },
            [`@ .${DocumentPagePresenterBase.PART_TextLayer}`]: {
                position: "absolute",
                left: "0px",
                top: "0px",
                right: "0px",
                bottom: "0px",
                pointerEvents: "none",          
            },
            [`@ .${DocumentPagePresenterBase.PART_TextLayer} span, br`]: {
                color: "transparent",
                cursor: "unset",
                position: "absolute",
                fontFamily: "monospace",
                whiteSpace: "pre",
                transformOrigin: "0px 0px",
                lineHeight: 1,
                pointerEvents: "all",
                userSelect: "text !important",
                WebkitUserSelect: "text"
            },
            [`.${DocumentPagePresenterBase.STATE_NoSelect} @ .${DocumentPagePresenterBase.PART_TextLayer}`]: {
                display: "none",
                userSelect: "none",
                WebkitUserSelect: "none"
            },
            [`@ .${DocumentPagePresenterBase.PART_TextLayer}:active > span`]: {
                paddingRight: "20px",
                paddingBottom: "20px"
            },
            [`@ .${DocumentPagePresenterBase.PART_TextLayer} span::selection`]: {
                background: "rgba(46, 112, 223, 0.2)",
                color: "transparent"
            },
            [`.${DocumentPagePresenterBase.STATE_Manipulating} @ .${DocumentPagePresenterBase.PART_TextLayer}`]: {
                display: "none"
            },
            [`@ .${DocumentPagePresenterBase.PART_PaperOverlay}`]: {
                scale: "var(--docviewer-scale)",
                width: "calc(100% / var(--docviewer-scale)) !important",
                height: "calc(100% / var(--docviewer-scale)) !important",
                transformOrigin: "0% 0%",
                pointerEvents: "none"
            }
        })

    renderElement(): JSX.Element
    {
        return (
            <div className={`${CSSClasses.Base} ${CSSClasses.HACenter} ${CSSClasses.VACenter} ${DocumentPagePresenterBase.PART_Paper}`}>

                <div className={`${CSSClasses.Base} ${CSSClasses.HALeft} ${CSSClasses.VATop} ${DocumentPagePresenterBase.PART_ImageContainer}`}>

                    <div className={DocumentPagePresenterBase.PART_Rotator}>
                        <canvas
                            className={DocumentPagePresenterBase.PART_LowResImage}
                            ref={r => { this.RenderSmallCanvas(r); } } />
                        <canvas
                            className={DocumentPagePresenterBase.PART_HiResImage}
                            ref={r => this.RenderHighResCanvas(this._lastRenderedHighResViewport, this._currentHighResScale, r)} />

                        {/*User annotations and hidden text*/}
                        <div className={`${CSSClasses.Base} ${DocumentPagePresenterBase.PART_ImageOverlay}`}>
                            {
                                this._smallImage &&
                                this.RenderPaddedAnnotations &&
                                this.RenderPaddedAnnotations(this)
                            }

                            <div className={`${CSSClasses.Base} ${CSSClasses.HAStretch} ${CSSClasses.VAStretch} ${CSSClasses.Overlaps}`}
                                style={{
                                    pointerEvents: "none",
                                    userSelect: "none"
                                }}>                            
                                <div
                                    className={`${DocumentPagePresenterBase.PART_TextLayer}`}
                                    ref={r =>
                                    {
                                        if (!r)
                                            return;
                                        this.RenderText(r);
                                        (r as any).AMXViewerPageIndex = this.PageIndex;
                                    }} />
                            </div>

                            {
                                this._smallImage &&
                                this.RenderOverTextAnnotations &&
                                this.RenderOverTextAnnotations(this)
                            }
                        </div>

                    </div>

                </div>

                {/*labels and things that don't get rotated but do get scaled*/}
                <div className={`${CSSClasses.Base} ${CSSClasses.HAStretch} ${CSSClasses.VAStretch} ${CSSClasses.Overlaps} ${DocumentPagePresenterBase.PART_PaperOverlay}`} >
                    {
                        this._smallImage &&
                        this.RenderAnnotations &&
                        this.RenderAnnotations(this)
                    }
                </div>
                {!this._smallImage ? (
                    <BusyPanel />
                ) : (<></>)}
            </div>
        );
    }

    public static DefaultBindings = {
        PagePadding: {
            AffectsRender: false    // a complete re-render is inefficient but we will handle the change elsewhere
        },
        IsClickFocused: {
            Mode: BindingMode.TwoWay
        }
    };

    public get HighRezDelay(): number
    {
        return this.GetValue(nameof(this.props.HighRezDelay), 0);
    }

    public get PageIndex(): number
    {
        return this.GetValue(nameof(this.props.PageIndex), 0);
    }

    public get Document(): IDocument | undefined
    {
        return this.GetValue(nameof(this.props.Document));
    }

    public get RenderAnnotations(): ((presenter: DocumentPagePresenterBase) => JSX.Element) | undefined
    {
        return this.GetValue(nameof(this.props.RenderAnnotations));
    }

    public get RenderPaddedAnnotations(): ((presenter: DocumentPagePresenterBase) => JSX.Element) | undefined
    {
        return this.GetValue(nameof(this.props.RenderPaddedAnnotations));
    }

    public get RenderOverTextAnnotations(): ((presenter: DocumentPagePresenterBase) => JSX.Element) | undefined
    {
        return this.GetValue(nameof(this.props.RenderOverTextAnnotations));
    }

    public get Page(): IDocumentPage | undefined | null
    {
        return this.GetValue(nameof(this.Page));
    }
    public set Page(value: IDocumentPage | undefined | null)
    {
        this.SetValue(nameof(this.Page), value);
    }

    private _lastPagePaddingState: any = undefined;
    public get PagePadding(): Thickness
    {
        var val = this.GetValue(nameof(this.props.PagePadding), 0);
        if (!this._pagePadding || this._lastPagePaddingState !== val)
        {            
            if (typeof (val) === 'number')
            {
                this._pagePadding = new Thickness(val as number);
            }
            else if (typeof (val) === 'string')
            {
                this._pagePadding = Thickness.FromString(val as string);
            }
            else
            {
                this._pagePadding = new Thickness();
            }
        }
        return this._pagePadding
    }

    public get CurrentCanvas(): HTMLCanvasElement | null
    {
        return this._currentCanvas;
    }

    public get ViewRotation(): number
    {
        var viewer = this.PagesPanel?.ItemsParent;
        if (!viewer || !(viewer instanceof DocumentViewer))
            return 0;
        return viewer.ViewRotation;
    }

    public get PagesPanel(): DocumentPagesPanel | undefined
    {
        return (this.Container?.parentElement as any)?.AMXInstance as DocumentPagesPanel;
    }   

    public SetCurrentViewportWindow(rc: Rect, scale: number)
    {
        //console.log(`Setting high res viewport on page ${this.state.PageIndex} x=${rc.X} y=${rc.Y} width=${rc.Width} height=${rc.Height} scale=${scale}`);
        if (!this.Page)
            return;

        var x = Math.max(0, Math.floor(rc.X / scale) - 1);
        var y = Math.max(0, Math.floor(rc.Y / scale) - 1);
        var width = Math.min(Math.ceil(rc.Width / scale) + 2, (this.RotatedPageWidth || 0) - x);
        var height = Math.min(Math.ceil(rc.Height / scale) + 2, (this.RotatedPageHeight || 0) - y);

        let imageRc: Rect = new Rect(x, y, width, height);
        if (this.ViewRotation !== 0)
        {
            var normRotated = Rect.Normalizel(imageRc, new Size(this.RotatedPageWidth, this.RotatedPageHeight));
            var normUnrotated = Rect.UnrotateNormalPageCoordinates(normRotated, this.ViewRotation);
            imageRc = Rect.Unnormalize(normUnrotated, new Size(this.Page.Width, this.Page.Height));
        }

        this._currentHighResViewport = imageRc;
        this._currentHighResScale = scale;
        this._isHighResViewportDirty = true;
    }

    /** Sub-classes can render any additional content overlaid on the document image here.
     * The DataContext of the element will be the same indexed item in the 
     * ItemsSource array given to the DocumentViewer.
     * */
    public /* virtual */ RenderAnnotationLayers(): JSX.Element | null
    {
        return null;
    }

    public override OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        super.OnBoundPropertyUpdate(property, value, oldValue);

        if (property === nameof(this.PagePadding) && oldValue !== undefined)
        {            
            this.OnUnscaledSizeChange();
            return;
        }

        // Before doing anything else of consequence, 
        // we have to check because during the realization / binding application
        // we'll get notices for all props
        if (this.GetValue(property) === value)
            return;

        if (property === nameof(this.Document) || property === nameof(this.PageIndex))
            this.InvalidatePage();
        if (property === nameof(this.Page))
            this.InvalidatePage(value);
    }

    public OnViewportChanged()
    {
        if (this._currentHighResCanvas)
            this.RenderHighResCanvas(this._lastRenderedHighResViewport, this._currentHighResScale, this._currentHighResCanvas);
    }
  
    /* override */ componentDidUpdate(prevProps)
    {
        this.Container?.style.setProperty("--padding-top", this.PagePadding.Top + "px");
        this.Container?.style.setProperty("--padding-bottom", this.PagePadding.Bottom + "px");
    }

    protected override OnContainerMounted(container: HTMLElement)
    {
        super.OnContainerMounted(container);

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

        this.OnUnscaledSizeChange();
    }

    override OnComponentWillUnmount()
    {        
        this._isDirty = false;
        this._isHighResLoopActive = false;
        this._currentCanvas = null;
        this._currentHighResCanvas = null;
        this._largeImage = null;
        this._smallImage = null;
        this.PagesPanel?.OnPageDerealized(this);

        super.OnComponentWillUnmount();
    }

    private get RotatedPageWidth(): number
    {
        if (this.ViewRotation === 90 || this.ViewRotation === 270)
            return this.Page?.Height || 0;
        return this.Page?.Width || 0;
    }

    private get RotatedPageHeight(): number
    {
        if (this.ViewRotation === 90 || this.ViewRotation === 270)
            return this.Page?.Width || 0;
        return this.Page?.Height || 0;
    }    

    override OnElementRendered()
    {
        this.OnUnscaledSizeChange();
    }

    private OnUnscaledSizeChange()
    {
        if (!this.PagesPanel || !this.Page)
            return;
        var viewer = (this.PagesPanel?.ItemsParent as any as DocumentViewer);
        if (!(viewer instanceof DocumentViewer))
            return;
        
        var sheetMargins = viewer?.SheetMargins || 0;;

        let baseHeight = 0, baseWidth = 0;        
        if (viewer?.BasePageHeights)
            baseHeight = viewer.BasePageHeights[this.PageIndex];
        else if (this.Page)
            baseHeight = this.Page.Height;

        if (viewer?.BasePageWidths)
            baseWidth = viewer.BasePageWidths[this.PageIndex];
        else if (this.Page)
            baseWidth = this.Page.Width;
        
        var lastMeasuredSize = this.PagesPanel?.LastKnownSizes[this.PageIndex];

        let wasPreviouslyMeasured = !!lastMeasuredSize;

        let lastUnscaledHeight = this.ViewRotation === 90 || this.ViewRotation === 270
            ? lastMeasuredSize?.Width
            : lastMeasuredSize?.Height;

        var newSize = new Size(
            baseWidth + sheetMargins * 2 + this.PagePadding.TotalHeight,
            baseHeight + sheetMargins * 2 + this.PagePadding.TotalHeight);
        this.PagesPanel.LastKnownSizes[this.PageIndex] = newSize;
        this.PagesPanel.LastKnownPaddings[this.PageIndex] = this.PagePadding;
                        
        this.Container?.style.setProperty("--padding-top", this.PagePadding.Top + "px");
        this.Container?.style.setProperty("--padding-bottom", this.PagePadding.Bottom + "px");
        this.Container?.style.setProperty("--amx-ptn-unsc-sheet-wd", newSize.Width + "px");
        this.Container?.style.setProperty("--amx-ptn-unsc-sheet-ht", newSize.Height + "px");

        if (!wasPreviouslyMeasured)
            return;

        let finalUnscaledHeight = this.ViewRotation === 90 || this.ViewRotation === 270
            ? newSize.Width
            : newSize.Height;
        let delta = finalUnscaledHeight - lastUnscaledHeight;

        if (delta !== 0 && this.PagesPanel?.Container && this.Container)
        {
            console.log(`** Page ${this.PageIndex} reporting ${delta * this.PagesPanel.ActualScale} height change`);
            (this.PagesPanel?.ItemsParent as DocumentViewer)?.Scroller?.OnScrollableHeightChanged(
                FrameworkElement.TranslatePoint(new Point(0, newSize.Height * this.PagesPanel.ActualScale), this, this.PagesPanel).Y,
                delta * this.PagesPanel.ActualScale,
                this.PageIndex);
        }
    }

    private _renderLoop: number = 0;

    private async BeginHighResRenderLoopAsync(): Promise<void>
    {
        let lastHRC: Rect | null | undefined = null;
        const loop = ++this._renderLoop;
        while (this._isHighResLoopActive && loop === this._renderLoop)
        {
            if (!lastHRC)
                lastHRC = this.PagesPanel?.UpdatePageInView(this);
            if (!lastHRC)
            {
                await Utilities.SleepAsync(100);
                continue;
            }
            if (this._isHighResViewportDirty && loop === this._renderLoop)
                await this.RenderHighResImageAsync();
            if (this.HighRezDelay > 0)
                await Utilities.SleepAsync(this.HighRezDelay);
        }
    }

    private async RenderHighResImageAsync(): Promise<void>
    {
        if (!this.Page)
            return;

        var largeImage = document.createElement('canvas');
        var outputScale = window.devicePixelRatio || 1;

        var viewport = this._currentHighResViewport;
        largeImage.width = Math.floor(viewport.Width * this._currentHighResScale * outputScale);
        largeImage.height = Math.floor(viewport.Height * this._currentHighResScale * outputScale);
        
        this._isHighResViewportDirty = false;
        if (this._currentHighResScale > 1)
            await this.Page.RenderAsync(largeImage, viewport, this._currentHighResScale * outputScale);

        this._largeImage = largeImage;
        this.RenderHighResCanvas(viewport, this._currentHighResScale, null, true);
    }

    private RenderHighResCanvas(viewport: Rect, scale: number, canvas?: HTMLCanvasElement | null, force: boolean = false)
    {
        this._currentHighResCanvas = canvas || this._currentHighResCanvas;
        if (this._currentHighResCanvas === null ||
            this._currentHighResScale <= 1 ||
            !this.Page ||
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

        if (!viewport)
            viewport = this._lastRenderedHighResViewport;
        
        this._currentHighResCanvas.width = this._largeImage.width;
        this._currentHighResCanvas.height = this._largeImage.height;

        var ctx = this._currentHighResCanvas.getContext("2d");
        ctx?.drawImage(this._largeImage, 0, 0);

        var manipulationScale = (this.PagesPanel?.Transform as MultitouchTransform).AbsoluteScale;        

        this._currentHighResCanvas.style.left = `${Math.floor(viewport.X * scale / manipulationScale)}px`;
        this._currentHighResCanvas.style.top = `${Math.floor(viewport.Y * scale / manipulationScale)}px`;

        this._currentHighResCanvas.style.width = `${Math.floor(viewport.Width * scale)}px`;
        this._currentHighResCanvas.style.height = `${Math.floor(viewport.Height * scale)}px`;

        if (manipulationScale !== 1)
            this._currentHighResCanvas.style.transform = `scale(${(1 / manipulationScale)})`;
        else
            this._currentHighResCanvas.style.transform = '';

        this._lastRenderedHighResViewport = viewport;

        //console.log(`Positioning HRCanv at ${this._currentHighResCanvas.style.left}, ${this._currentHighResCanvas.style.top}, scale ${scale}`);
    }

    private async RenderText(textLayer: HTMLDivElement | null)
    {
        if (!textLayer || !this.Page)
            return;
        await this.Page.RenderTextAsync(textLayer);
        for (var i = 0; i < textLayer.children.length; i++)
        {
            var child = textLayer.children[i];
            (child as HTMLElement).oncontextmenu = (e) =>
            {
                e.preventDefault();       // why did we do/need this? Something with touch?
            };
        }
    }

    private async RenderSmallImageAsync(): Promise<boolean>
    {
        if (!this.Page)
        {
            if (!this.Document)
                return false;
            this.Page = await this.Document.GetPageAsync((this.PageIndex || 0) as number);
            if (!this.Page)
                return false;
            (this.PagesPanel?.ItemsParent as DocumentViewer)?.OnPageRetrieved(this.Page);            
        }

        if (this._isRenderingSmallImage)
            return false;

        this.OnUnscaledSizeChange();

        this._isRenderingSmallImage = true;

        var outputScale = window.devicePixelRatio || 1;

        if (!this._smallImage)
            this._smallImage = document.createElement("canvas");
        this._smallImage.width = this.Page.Width * outputScale;
        this._smallImage.height = this.Page.Height * outputScale;
        
        await this.Page.RenderAsync(this._smallImage, new Rect(0, 0, this.Page.Width, this.Page.Height), outputScale);        

        this._isRenderingSmallImage = false;

        return true;
    }

    private async RenderSmallCanvas(canvas: HTMLCanvasElement | null)
    {
        if (canvas === null || !this._isDirty || (!this.Document && !this.Page))
            return;

        this._currentCanvas = canvas;

        // Even though we're realized, wait a bit to make sure
        // we're STILL dirty before actually painting for the first time. 
        // We don't want fast scrolls, etc., to result in unneeded 
        // rendering
        await Utilities.SleepAsync(50);
        if (!this._isDirty)
            return;

        //console.log(`Rendering small canvas for page: ${this.PageIndex}`);

        this._isDirty = false;

        if (!await this.RenderSmallImageAsync())
            return;

        //console.log(`Painting PDF page small image ${this.state.PageIndex}`);

        if (!this._smallImage)
            // Maybe if scroll out / derealization
            // happened during render
            return;
        var ctx = canvas.getContext("2d");

        this.Container?.style.setProperty(DocumentPagePresenter.VAR_PageImageWidth, this.Page?.Width + "px");
        this.Container?.style.setProperty(DocumentPagePresenter.VAR_PageImageHeight, this.Page?.Height + "px");
        canvas.width = this._smallImage.width;
        canvas.height = this._smallImage.height;
        ctx?.drawImage(this._smallImage, 0, 0);

        //this.PagesPanel?.UpdatePageInView(this);

        await Utilities.SleepAsync(1);
        this.InvalidateRender();
    }

    private InvalidatePage(newPage: IDocumentPage | null = null)
    {
        this.Page = newPage;
        this._isDirty = true;
        //this._hasRendered = false;
        this.InvalidateRender();
        if (newPage && this.PagesPanel)
            (this.PagesPanel?.ItemsParent as DocumentViewer)?.OnPageRetrieved(newPage);
        //this.ReportChangedUnscaledSize();
    }

    private _isRenderingSmallImage: boolean = false;
    private _currentHighResCanvas: HTMLCanvasElement | null = null;
    private _currentCanvas: HTMLCanvasElement | null = null;
        
    private _isDirty: boolean = true;
    private _smallImage: HTMLCanvasElement | null = null;
    private _largeImage: HTMLCanvasElement | null = null;
    //private _hasRendered: boolean = false;
    private _currentHighResViewport: Rect = new Rect();
    private _lastRenderedHighResViewport: Rect = new Rect();
    private _currentHighResScale: number = 1;
    private _isHighResViewportDirty: boolean = false;
    private _isHighResLoopActive: boolean = false;
    private _pagePadding: Thickness | undefined;    
}
export class DocumentPagePresenter extends DocumentPagePresenterBase<IDocumentPagePresenterProps>
{
}