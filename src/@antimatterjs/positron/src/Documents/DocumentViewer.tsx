import * as React from "react";
import { Binding, BindingMode, BindingParameters, Utilities, Point, Rect, Size, ModelObjectReference, Span, Antimatter, HostPlatform } from "@antimatterjs/react";

import { Panel } from "../Controls/Panel";
import { DocumentPosition, IDocument, IDocumentPage } from "./IDocument";
import { TemplateProp, WebStyle } from "../Style";
import { FrameworkElement } from "../FrameworkElement";
import { HorizontalAlignment, ScrollBarVisibility, VerticalAlignment, WindowLayout } from "../Enums";
import { ControlTemplate } from "../FrameworkTemplate";
import { MultitouchTransform } from "../Media/MultitouchTransform";
import { IVirtualizingItemsControlProps, VirtualizingItemsControlBase } from "../Controls/VirtualizingItemsControl";
import { DocumentPagesPanel } from "./DocumentPagesPanel";
import { DocumentPagePresenterBase, IDocumentPagePresenterProps } from "./DocumentPagePresenter";
import { Grid } from "../Controls/Grid";
import { ManipulationEventArgs } from "../Input/ManipulationEventArgs";
import { ITextSelectionArgs } from "../Input/TextSelectionArgs";
import { CSSClasses } from "../CSSClasses";
import { ThemeColor } from "../Theme";
import { Window } from "../Controls/Window";
import { Application } from "../Application";

export interface IDocumentViewerProps extends IVirtualizingItemsControlProps
{
    Page?: number | Binding,
    Scale?: number | Binding,
    X?: number | Binding,
    Y?: number | Binding,
    Position?: DocumentPosition | Binding,
    Document?: IDocument | null,
    PagePaddingBindingParameters?: BindingParameters,
    PageBindingParameters?: BindingParameters,
    CanSelectText?: boolean | Binding,
    TextSelectedCommand?: ModelObjectReference | Binding | ((e: any) => void),
    ResetZoomCommand?: ModelObjectReference | Binding,
    ViewRotation?: number | Binding,
    CanPan?: boolean | Binding,

    MaxPageWidth?: number | Binding,
    MaxPageHeight?: number | Binding,

    BasePageWidths?: number[] | Binding,
    BasePageHeights?: number[] | Binding,

    // The width that will correspond to a 100% scale. Should generally be
    // the width of the first page of the document.
    NominalWidth?: number | Binding,

    SheetMargins?: number | Binding,
}

export class DocumentViewerBase<P extends IDocumentViewerProps = {}> extends VirtualizingItemsControlBase<P>
{
    private _scroller: Panel | null = null;
    private _manipulationOrigin: Point = new Point();
    private _scrollOrigin: Point = new Point();
    private _sizeFaker: HTMLElement | null = null;
    private _tr = new MultitouchTransform();
    private _pagesPanel: DocumentPagesPanel | null = null;
    private _lastScrollY: number = 0;
    private _position: DocumentPosition = {};
    private _isMouseDown: boolean = false;
    private _autoScrolling: boolean = false;
    private _masterScale: number = 1;
    private _isTextSelected: boolean = false;

    public static readonly PART_Root = Antimatter.Identifier('amx-ptn-viewer-root');

    constructor(props)
    {
        super(props);
        this.OnWindowSelectionChanged = this.OnWindowSelectionChanged.bind(this);
    }

    public static DefaultBindings = {
        Scale: {
            Mode: BindingMode.TwoWay,
            AffectsRender: false    // a complete re-render is inefficient but we will handle the change elsewhere
        },
        Page: {
            AffectsRender: false,       // ditto
            Mode: BindingMode.TwoWay
        },
        Position: {
            Mode: BindingMode.TwoWay,
            AffectsRender: false,
            MarshalValue: true
        },
        ViewRotation: {
            AffectsRender: false,
        },
        CanSelectText: {
            AffectsRender: false,
        }
    };

    public override get IsTouchManipulationEnabled(): boolean
    {
        // We never manipulate directly on the viewer, only the panel
        return false;
    }

    public get MaxPageWidth(): number
    {
        return this.GetValue(nameof(this.props.MaxPageWidth), 612);
    }

    public get MaxPageHeight(): number
    {
        return this.GetValue(nameof(this.props.MaxPageHeight), 792);
    }

    public get SheetMargins(): number
    {
        return this.GetValue(nameof(this.props.SheetMargins), 0);
    }

    public get BasePageWidths(): number[]|undefined
    {
        return this.GetValue(nameof(this.props.BasePageWidths));
    }

    public get BasePageHeights(): number[] | undefined
    {
        return this.GetValue(nameof(this.props.BasePageHeights));
    }

    public get CanPan(): boolean
    {
        return this.GetValue(nameof(this.props.CanPan), false);
    }

    public get ViewRotation(): number
    {
        return this.GetValue(nameof(this.props.ViewRotation), 0);
    }

    public get CanSelectText(): boolean
    {
        return this.GetValue(nameof(this.props.CanSelectText), false);
    }

    public get Position(): DocumentPosition
    {
        return this.GetValue(nameof(this.props.Position), {});
    }

    public get Document(): IDocument | null
    {
        return this.GetValue(nameof(this.props.Document));
    }

    public get Scale(): number
    {
        return this.GetValue(nameof(this.props.Scale), 1);
    }

    public get NominalWidth(): number
    {
        return this.GetValue(nameof(this.props.NominalWidth), 612) || 612;
    }

    public get ActualScale(): number
    {
        return this.Scale * this._masterScale;
    }

    public get Page(): number
    {
        return this.GetValue(nameof(this.props.Page), 0);
    }

    public get PagePaddingBindingParameters(): BindingParameters | undefined
    {
        return this.GetValue(nameof(this.props.PagePaddingBindingParameters));
    }

    public get PageBindingParameters(): BindingParameters | undefined
    {
        return this.GetValue(nameof(this.props.PageBindingParameters));
    }

    public get TextSelectedCommand(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.TextSelectedCommand));
    }

    public get ResetZoomCommand(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.ResetZoomCommand));
    }

    public get Scroller(): Panel | undefined | null
    {
        return this._scroller;
    }

    public override get ObserveResize(): boolean
    {
        return true;
    }

    private _hasCentered: boolean = false;

    protected override get OverrideItemAlignForScroll()
    {
        return false;
    }

    protected override OnResize()
    {
        var oldMS = this._masterScale;

        var widthScale = this.Layout === WindowLayout.Default ? 0.75 : 0.9;
        this._masterScale = widthScale * this.ActualWidth / this.NominalWidth;
        this.ScaleAboutPoint(
            this.Scale * this._masterScale,
            this.Scale * oldMS,
            undefined
        );

        if (this._hasCentered || !this._scroller?.Container)
            return;

        var diff = ((this._scroller.Container.scrollWidth || 0) - this._scroller.ActualWidth) / 2;
        if (diff === 0)
            return;
        this._scroller.SetHorizontalOffset(diff);
        this._hasCentered = true;
    }

    private _previousWidth: number | undefined = undefined;

    //protected /* virtual */ OnResize()
    //{
    //    if (this._previousWidth !== undefined)
    //    {

    //    }

    //    this._previousWidth = this.ActualWidth;
    //}

    public IsScrollingUp: boolean = false;

    private FindTextLayerFromSelectedNode(node: Node): HTMLElement|null|undefined
    {
        if (!node.ELEMENT_NODE)
            return undefined;  // not really an HTMLElement

        var elem = node as HTMLElement;
        return Utilities.FindParentElement(elem, (e) =>
        {
            return e.classList.contains(DocumentPagePresenterBase.PART_TextLayer);
        });
    }

    private OnSelectionChanged()
    {
        //console.log("Selection changed");

        if (!this.TextSelectedCommand || !this.CanSelectText)
            return;
        var sel = window.getSelection();
        if (!sel)
            return;

        var ct = sel.rangeCount;
        for (let i = 0; i < ct; i++)
        {
            let args: ITextSelectionArgs = {
                PageIndex: 0,
                Rects: []
            };

            var range = sel.getRangeAt(i);
            var rcs = range.getClientRects();

            var textLayer = this.FindTextLayerFromSelectedNode(range.startContainer);
            if (textLayer)
            {
                var index = (textLayer as any).AMXViewerPageIndex;
                if (index !== null && index !== undefined)
                {
                    args.PageIndex = index;
                    var textLayerBounds = textLayer.getBoundingClientRect();

                    var lastValue = new Rect();

                    for (let j = 0; j < rcs.length; j++)
                    {
                        var rc = rcs.item(j);
                        if (!rc || rc.width === 0 || rc.height === 0)
                            continue;

                        var normRect = new Rect(
                            (rc.left - textLayerBounds.left) / textLayerBounds.width,
                            (rc.top - textLayerBounds.top) / textLayerBounds.height,
                            rc.width / textLayerBounds.width,
                            rc.height / textLayerBounds.height);

                        if (Math.abs(normRect.Width) < 0.001 ||
                            Math.abs(normRect.Height) < 0.001 ||
                            normRect.Width === 1 || normRect.Height === 1 ||
                            normRect.Top < 0 || normRect.Bottom > 1 ||
                            Rect.DoMostlyOverlap(normRect, lastValue))
                        {
                        }
                        else
                        {
                            args.Rects?.push(normRect);
                        }
                        lastValue = normRect;
                    }
                }
            }

            if (args.Rects?.length !== 0)
            {
                args.SelectedText = sel.toString();
                this._isTextSelected = true;
            }
            else
            {
                this.Container?.classList?.remove(DocumentPagePresenterBase.STATE_TextSelected);
                this._isTextSelected = false;
                if (!this._pendingTextSelectionArgs)
                    return;
            }

            this._pendingTextSelectionArgs = args;
            if (Application.CurrentWindow?.PrefersTouch)
                // For touch send command right away when selection changes
                // because it won't register a pointer up
                this.UpdateModelSelection();
        }
    }

    private UpdateModelSelection()
    {
        if (!this._pendingTextSelectionArgs || !this.CanSelectText || !this.TextSelectedCommand)
            return;
        this.ExecuteCommand(this.TextSelectedCommand, this._pendingTextSelectionArgs);
        this._LastTextSelectionArgs = this._pendingTextSelectionArgs;
        this._pendingTextSelectionArgs = undefined;
    }

    private _pendingTextSelectionArgs?: ITextSelectionArgs;
    private _LastTextSelectionArgs?: ITextSelectionArgs;

    override OnComponentMount()
    {
        super.OnComponentMount();
        if (!this.Container)
            return;
        document.addEventListener("selectionchange", this.OnWindowSelectionChanged);
        this.OnResize();
    }

    override OnComponentWillUnmount()
    {
        document.removeEventListener("selectionchange", this.OnWindowSelectionChanged);
    }

    private _selectionChangeTimer: any = undefined;

    private OnWindowSelectionChanged(e: Event)
    {
        if (!Application.CurrentWindow?.PrefersTouch)
            return;
        if (this._isMouseDown)
            return;
        if (this._selectionChangeTimer)
        {
            window.clearTimeout(this._selectionChangeTimer);
            this._selectionChangeTimer = undefined;
        }
        this._selectionChangeTimer = window.setTimeout(() =>
        {
            this._selectionChangeTimer = undefined;
            this.OnSelectionChanged();
        }, Application.CurrentWindow?.PrefersTouch ? 100 : 10);
    }

    private template(): JSX.Element
    {
        return (
            <Grid
                ref={r => { this._scroller = r; } }
                ClassName={DocumentViewer.PART_Root}
                Background={this.Background}
                OnPointerDown={(e) =>
                {
                    if (Application.CurrentWindow?.PrefersTouch)
                        return;
                    this._pendingTextSelectionArgs = undefined
                }}
                OnDblClick={(e) =>
                {
                    //Disregard 2x-clicks used to select text (equivalently, the ones ending w/ a non-empty selection)
                    if (!this.ResetZoomCommand || this._isTextSelected)
                        return;
                    this.ExecuteCommand(this.ResetZoomCommand);
                }}
                OnPointerUp={(e) =>
                {
                    if (
                        //!this._pendingTextSelectionArgs ||
                        !this.CanSelectText || !this.TextSelectedCommand || Application.CurrentWindow?.PrefersTouch)
                        return;
                    this.OnSelectionChanged();
                    this.UpdateModelSelection();
                }}
                OnScroll={(e) =>
                {
                    if (!this._pagesPanel || !this._scroller?.Container || this._autoScrolling)
                        return;
                    if (this._scroller.Container.scrollTop === 0)
                    {
                        let a = 5;
                    }
                    this.IsScrollingUp = this._scroller.Container.scrollTop < this._lastScrollY;
                    this._lastScrollY = this._scroller.Container.scrollTop;
                    this._pagesPanel.UpdatePagesOnScroll();
                }}
                VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                HorizontalScrollBarVisibility={ScrollBarVisibility.Auto}>
                <DocumentPagesPanel
                    ref={r => { this._pagesPanel = r; } }
                    ClassName={DocumentPagePresenterBase.PART_PagesPanel}
                    HorizontalAlignment={HorizontalAlignment.Center}
                    VerticalAlignment={VerticalAlignment.Top}
                    ItemsParent={this}
                    Heights={this.BasePageHeights}
                    Widths={this.BasePageWidths}
                    ItemSpacing={"0px"}
                    RealizationDelayMs={this.RealizationDelayMs}
                    IsTouchManipulationEnabled={this.GetValue(nameof(this.props.IsTouchManipulationEnabled), false)}
                    OnManipulationStarting={((e) =>
                    {
                        this._killTimer = true;
                        this.IsScrollingUp = false;
                    })}
                    OnManipulationStarted={((e) =>
                    {
                        if (this._isTextSelected && !this.CanPan)
                            return;
                        var pagesPanel = this._pagesPanel?.Container;
                        var scroller = this._scroller?.Container;
                        if (!this._pagesPanel || !pagesPanel || !scroller)
                            return;

                        this._tr.CenterX = e.CenterX;
                        this._tr.CenterY = e.CenterY;
                        this._manipulationOrigin = {
                            X: pagesPanel.getBoundingClientRect().x - (pagesPanel.parentElement?.getBoundingClientRect()?.x || 0),
                            Y: scroller.scrollTop,
                        };
                        this._scrollOrigin = {
                            X: scroller.scrollLeft,
                            Y: scroller.scrollTop
                        }
                    }).bind(this)}
                    OnManipulationDelta={((e: ManipulationEventArgs) =>
                    {
                        if (this._isTextSelected && !this.CanPan)
                            return;
                        var vsp = this._pagesPanel?.Container;
                        var scroller = this._scroller?.Container;
                        if (!vsp || !scroller || !this._sizeFaker)
                            return;

                        // Ensure no manipulation scrolling beyond bounds
                        var scrollableWidth = Math.max(0, vsp.clientWidth - scroller.clientWidth);
                        var translateX = e.CumulativeX;
                        if (this._scrollOrigin.X - translateX <= 0)
                            translateX = this._scrollOrigin.X;
                        else if (this._scrollOrigin.X - translateX >= scrollableWidth)
                            translateX = -(scrollableWidth - this._scrollOrigin.X);

                        var scrollableHeight = Math.max(0, vsp.clientHeight - scroller.clientHeight);
                        var translateY = e.CumulativeY;
                        if (this._scrollOrigin.Y - translateY <= 0)
                            translateY = this._scrollOrigin.Y;
                        else if (this._scrollOrigin.Y - translateY >= scrollableHeight)
                            translateY = -(scrollableHeight - this._scrollOrigin.Y);

                        this.Container?.classList?.add(DocumentPagePresenterBase.STATE_Manipulating);
                        if (e.CumulativeScale !== 1 || !this.CanPan)
                        {
                            this._tr.TranslateX = translateX;
                            this._tr.TranslateY = translateY;
                            this._tr.ScaleX = e.CumulativeScale;
                            this._tr.ScaleY = e.CumulativeScale;
                        }

                        this.IsScrollingUp = e.DeltaY > 0;
                        this._pagesPanel?.UpdatePagesOnScroll();
                    }).bind(this)}
                    OnManipulationCompleted={(async (e: ManipulationEventArgs) =>
                    {
                        if (this._isTextSelected && !this.CanPan)
                            return;
                        var wasScaling = this._tr.ScaleX !== 1;
                        if (wasScaling || !this.CanPan)
                            this.CommitTransform(this._manipulationOrigin, this.ActualScale * this._tr.AbsoluteScale, true);

                        if (!wasScaling)
                            // No sliding during pinch+zoom
                            this.IsScrollingUp = false;

                        this.Container?.classList?.remove(DocumentPagePresenterBase.STATE_Manipulating);
                        this._pagesPanel?.UpdatePagesOnScroll();

                        if (!this.CanPan && !wasScaling)
                            this.ContinueVelocityScrollAsync(-e.VelocityX, -e.VelocityY);
                    }).bind(this)}
                    Transform={this._tr}
                >
                </DocumentPagesPanel>
                <div
                    ref={r => { this._sizeFaker = r; } }
                    style={{ height: 1, position: 'absolute' }} >
                </div>
            </Grid>);
    }

    public OnPanelHeightChanged(deltaY: number)
    {
        if (!this.IsScrollingUp)
            return;
        this._manipulationOrigin = new Point(
            this._manipulationOrigin.X,
            this._manipulationOrigin.Y + deltaY);
    }

    private _killTimer: boolean = false;

    private async ContinueVelocityScrollAsync(velocityX: number, velocityY: number)
    {
        var timeConstant = 16.66667;
        var scaleFactor = 0.5;// / this.ActualScale;
        var amplitudeX = velocityX * scaleFactor;
        var amplitudeY = velocityY * scaleFactor;
        if (Math.abs(amplitudeY) < 200 &&
            Math.abs(amplitudeX) < 200)
            return;
        var intervalMS = 1000.0 / 60.0;

        this._killTimer = false;

        let callback: any;
        callback = () =>
        {
            var deltaX = amplitudeX / timeConstant;
            var deltaY = amplitudeY / timeConstant;
            this._scroller?.Container?.scrollBy(deltaX, deltaY);
            amplitudeX -= deltaX;
            amplitudeY -= deltaY;
            if (this._killTimer ||
                Math.abs(amplitudeY) < 10 &&
                Math.abs(amplitudeX) < 10)
            {
                this._pagesPanel?.UpdatePagesOnScroll();
            }
            else
            {
                window.setTimeout(callback, intervalMS);
            }
        }

        window.setTimeout(callback, intervalMS);
    }

    public SetScale(scale: number, updateBoundValue: boolean)
    {
        if (updateBoundValue)
        {
            this.SetValue(
                nameof(this.props.Scale),
                scale / this._masterScale,
                false);
        }
        //this.Container?.style?.setProperty("--docviewer-scale", 1);
        this._pagesPanel?.InvalidateRender(false);
        this.Container?.style?.setProperty("--docviewer-scale", scale.toString());
    }

    private CommitTransform(scrollOrigin: Point, finalScale: number, updateScaleState: boolean = true)
    {
        var pagesPanel = this._pagesPanel;
        var scroller = this._scroller?.Container;
        if (!pagesPanel || !scroller || !pagesPanel.Container || !this._sizeFaker)
            return;

        this._sizeFaker.style.width = '0px';

        var ds = {
            X: (pagesPanel?.Container?.parentElement?.getBoundingClientRect()?.x || 0) -
                (pagesPanel?.Container?.getBoundingClientRect().x || 0),
            Y: scrollOrigin.Y - ((this._tr?.AbsoluteY || 0) / 1)
        }

        if (updateScaleState)
            this.SetScale(finalScale, true);

        this._tr.Reset();
        pagesPanel.SetDesiredScroll(ds, finalScale);
    }

    public static DefaultStyle: WebStyle<IDocumentViewerProps> = new WebStyle<IDocumentViewerProps>(
        {
            RealizationDelayMs: 250,
            CanPan: true,
            Background: ThemeColor.NeutralLight,
            ItemAsDataContext: true,
            IsTouchManipulationEnabled: true,
            CanSelectText: true,
            HorizontalScrollBarVisibility: ScrollBarVisibility.Auto,
            VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
            NominalWidth: 612,
            SheetMargins: 5,
            Template: new ControlTemplate((templatedParent: DocumentViewer) => templatedParent.template())
        },
        {
            "@": {
                ["--docviewer-scale"]: 1
            } as any,
            [`@:not(.${CSSClasses.PreventPan}) .${DocumentViewerBase.PART_Root}`]: {
                touchAction: "pan-x pan-y"
            },
            [`@ .${DocumentPagePresenterBase.PART_PagesPanel}`]: {
                minWidth: "calc(var(--docviewer-scale) * var(--docviewer-max-pg-width))"
            },
            [`@.rotatte90 .${DocumentPagePresenterBase.PART_PagesPanel}, @.rotatte270 .${DocumentPagePresenterBase.PART_PagesPanel}`]: {
                minWidth: "calc(var(--docviewer-scale) * var(--docviewer-max-pg-height))"
            },
            [`@.${DocumentPagePresenterBase.STATE_Manipulating} .${DocumentViewerBase.PART_Root}`]: {
                msOverflowStyle: "none",
                scrollbarWidth: "none"
            },
            [`@.${DocumentPagePresenterBase.STATE_Manipulating} .${DocumentViewerBase.PART_Root}::-webkit-scrollbar`]: {
                display: "none"
            },
            [`@.${DocumentPagePresenterBase.STATE_TextSelected} .${DocumentViewerBase.PART_Root}`]: {
                pointerEvents: "none"
            },
            //[`@.${DocumentPagePresenterBase.STATE_Manipulating} .${DocumentViewerBase.PART_Root} *`]: {
            //    //pointerEvents: "none",
            //    touchAction: "none"
            //}
        }
    );

    public override async OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.Document))
        {
            if (this.ItemsSource.length === 0)
            {
                // If an explicit ItemsSource was already provided (meaning a model
                // object for every page) there's no need to generate a fake one
                // here.
                var doc = value as IDocument;
                this.SetValue(
                    nameof(this.ItemsSource),
                    this.ConstructPageArray(doc?.Pages || 0),
                    true);
            }
            this.ItemsPanelInstance?.InvalidateRender();
        }
        else if (property === nameof(this.props.Scale))
        {
            this.ScaleAboutPoint(
                (value as number) * this._masterScale,
                (oldValue as number) * this._masterScale,
                undefined
            );
            //this.SetScale(value * this._masterScale, false);
        }
        else if (property === nameof(this.Page))
        {
            var page = this.TryGetItemContainer(this.Page as number || 0);
            if (!page)
                return;
            var offset = (page.Container?.getBoundingClientRect().top || 0) -
                (this._pagesPanel?.Container?.getBoundingClientRect().top || 0);

            this._scroller?.ScrollSmoothlyAsync(offset);
        }
        else if (property === nameof(this.Position))
        {
            var pos = value as DocumentPosition;
            var oldPos = oldValue as DocumentPosition;
            await this.ApplyPosition(pos, oldPos);
        }
        else if (property === nameof(this.ViewRotation))
        {
            if (oldValue !== undefined)
                this.Container?.classList.remove(`rotate${oldValue}`);
            if (value !== undefined)
                this.Container?.classList.add(`rotate${value}`);
            this._pagesPanel?.UpdatePagesOnScroll();
        }
        else if (property === nameof(this.props.NominalWidth) ||
            property === nameof(this.props.MaxPageWidth))
        {
            this.OnResize();
        }
        else if (property === nameof(this.props.BasePageHeights) ||
            property === nameof(this.props.BasePageWidths) ||
            property === nameof(this.props.ItemsSource))
        {
            this._pagesPanel?.InvalidateRender(true);
        }
    }

    private _positionApplied: boolean = false;

    public async ApplyPosition(pos: DocumentPosition, oldPos: DocumentPosition|undefined)
    {
        let instant: boolean = false;
        if (!oldPos)
        {
            oldPos = {
                page: 0,
                scale: 1,
                x: 0,
                y: 0
            };
            instant = true;
        }

        if (!Utilities.AlmostEquals(pos.scale, oldPos.scale))
        {
            this.SetValue(nameof(this.props.Scale), pos.scale || 1, false);
            this.ScaleAboutPoint(
                (pos.scale || 1) * this._masterScale,
                (oldPos.scale || 1) * this._masterScale,
                undefined);
        }

        if (!this._positionApplied ||!oldPos || pos.page !== oldPos.page || !Utilities.AlmostEquals(pos.y || 0, oldPos.y || 0))
        {
            let retry: number = 2;
            while (retry-- > 0)
            {
                var pageSpan = this._pagesPanel?.GetContentBounds(
                    pos.page || 0,
                    this.ViewRotation === 90 || this.ViewRotation === 270);
                if (!pageSpan || !this._scroller)
                {
                    // Wait a small amount and try again
                    if (retry > 0)
                        await Utilities.SleepAsync(250);
                    continue;
                }

                var offset = pageSpan.Start;
                offset += (pos.y || 0) * (pageSpan.End - pageSpan.Start);

                if (!instant)
                {
                    var scrolled = await this._scroller.ScrollSmoothlyAsync(offset, pos.page);
                    if (scrolled)
                    {
                        this._positionApplied = true;
                        retry = 0;
                    }
                    else if (retry > 0)
                    {
                        // Wait a small amount and try again
                        await Utilities.SleepAsync(250);
                    }
                }
                else
                {
                    // First opened; go instantly
                    this._scroller?.Container?.scrollTo({
                        behavior: "auto",
                        top: offset
                    });
                    this._positionApplied = true;
                    retry = 0;
                }                
            }
        }        
    }

    public ScaleAboutPoint(newScale: number, oldScale: number, center?: Point)
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

        this._tr.ScaleX = this._tr.ScaleY = newScale / oldScale;

        this.CommitTransform(scrollOrigin, newScale);
        //this._pagesPanel?.UpdatePagesOnScroll();
    }

    public override OnRenderItem(item: any, index: number, props?: any): JSX.Element | null
    {
        const pageProps = Object.assign(props || {},
            {
                VirtualizingItemsParent: this,
                PageIndex: index,
                //Scale: this.state.Position?.scale || 1
            }) as IDocumentPagePresenterProps;
        if (this.Document)
            pageProps.Document = this.Document;
        else if (this.PageBindingParameters)
            pageProps.Page = new Binding({
                Source: item,
                Path: this.PageBindingParameters.Path,
                Converter: this.PageBindingParameters.Converter
            });

        if (this.PagePaddingBindingParameters)
            pageProps.PagePadding = new Binding({
                Source: item,
                Path: this.PagePaddingBindingParameters.Path,
                Converter: this.PagePaddingBindingParameters.Converter
            });

        //pageProps.PlaceholderHeight = 802;
        //pageProps.RealizationDelay = 100;
        return super.OnRenderItem(item, index, pageProps);
    }

    public OnPageRetrieved(page: IDocumentPage)
    {
        var panelWidth = this.ActualWidth;

        if (this.state[nameof(this.props.Scale)] === undefined &&
            panelWidth !== undefined)
        {
            // we use the first retrieved page to suggest the appropriate initial scale
            var initialScale = 0.9 * panelWidth / page.Width;
            this.SetValue(nameof(this.props.Scale), initialScale, true);
        }
    }

    public UpdateReportedPosition(page: number, scale: number, y: number)
    {
        let changes: boolean = false;
        if (this._position.page !== page)
        {
            this._position.page = page;
            changes = true;
        }

        if (this._position.scale !== scale)
        {
            this._position.scale = scale / this._masterScale;
            changes = true;
        }

        if (this._position.y !== y)
        {
            this._position.y = y;
            changes = true;
        }

        if (!changes)
            return;

        this.SetValue(nameof(this.props.Page), page, false);
        this.SetValue(nameof(this.props.Position), Object.assign({}, this._position), false);
    }

    override getCSSStyles()
    {
        var styles = super.getCSSStyles();
        styles["--sheet-margins"] = this.SheetMargins + "px";
        styles["--docviewer-max-pg-width"] = this.MaxPageWidth + "px";
        styles["--docviewer-max-pg-height"] = this.MaxPageHeight + "px";
        return styles;
    }

    override constructClasses()
    {
        var rotation = this.ViewRotation === 0 ? '' : ` rotate${this.ViewRotation} `;
        return super.constructClasses()
            + (this.IsTouchManipulationEnabled ? " amx-ptn-manipulation " : "")
            + (!this.CanPan ? ` ${CSSClasses.PreventPan} ` : "")
            + rotation
            + ` ${!this.CanSelectText ? ` ${DocumentPagePresenterBase.STATE_NoSelect} ` : ''} `;
    }

    protected override GetContainerForItemOverride(): typeof FrameworkElement
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
export class DocumentViewer extends DocumentViewerBase<IDocumentViewerProps>
{
}
