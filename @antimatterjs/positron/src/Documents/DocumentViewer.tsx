import * as React from "react";
import { Binding } from "@antimatterjs/react";
import { Panel } from "../Controls/Panel";
import { DocumentPosition, IDocument } from "./IDocument";
import { IItemsControlProps, IItemsControlState, ItemsControl } from "../Controls/ItemsControl";
import { Style } from "../Style";
import { ItemsStackPanel } from "../Controls/ItemsStackPanel";
import { FrameworkElement } from "../FrameworkElement";
import { DocumentPagePresenter, IDocumentPagePresenterProps } from "./DocumentPagePresenter";
import { HorizontalAlignment, ScrollBarVisibility, VerticalAlignment } from "../Enums";
import { ControlTemplate } from "../FrameworkTemplate";
import { MultitouchTransform } from "../Media/MultitouchTransform";
import { DefaultEffects } from "@fluentui/react";
import { VirtualizingStackPanel } from "../Controls/VirtualizingStackPanel";
import { Point } from "../Foundation";

interface IDocumentViewerCommon
{
    Document?: IDocument|null
}
interface IDocumentViewerProps extends IItemsControlProps, IDocumentViewerCommon
{
    Position?: DocumentPosition|Binding,
}
interface IDocumentViewerState extends IItemsControlState, IDocumentViewerCommon
{
    Position?: DocumentPosition,
}

export class DocumentViewerBase<
    P extends IDocumentViewerProps = {},
    S extends IDocumentViewerState = {}>
    extends ItemsControl<P, S>
{
    private _vsp: VirtualizingStackPanel | null = null;
    private _scroller: Panel | null = null;
    private _scrollOrigin: Point = new Point();
    private _sizeFaker: HTMLElement | null = null;
    private _tr = new MultitouchTransform();
    private _scale: number = 1;

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
                VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                HorizontalScrollBarVisibility={ScrollBarVisibility.Auto}>
                <VirtualizingStackPanel
                    ref={r => this._vsp = r}
                    HorizontalAlignment={HorizontalAlignment.Center}
                    OnManipulationStarted={((e) =>
                    {
                        var vsp = this._vsp?.Container;
                        var scroller = this._scroller?.Container;
                        if (!this._vsp || !vsp || !scroller)
                            return;

                        this._tr.CenterX = e.CenterX;
                        this._tr.CenterY = e.CenterY;
                        this._scrollOrigin = {
                            X: vsp.getBoundingClientRect().x - (vsp.parentElement?.getBoundingClientRect()?.x || 0),
                            Y: scroller.scrollTop,
                        };
                    }).bind(this)}
                    OnManipulationDelta={((e) =>
                    {
                        var vsp = this._vsp?.Container;
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
                    }).bind(this)}
                    OnManipulationCompleted={((e) =>
                    {
                        var vsp = this._vsp;
                        var scroller = this._scroller?.Container;
                        if (!vsp || !scroller || !vsp.Container || !this._sizeFaker)
                            return;

                        this._scale = this._scale * this._tr?.AbsoluteScale || 1;

                        this._sizeFaker.style.width = '0px';
                        scroller.style.overflowX = "auto";

                        var ds = {
                            X: (vsp?.Container?.parentElement?.getBoundingClientRect()?.x || 0) -
                                (vsp?.Container?.getBoundingClientRect().x || 0),
                            Y: this._scrollOrigin.Y * 1 - ((this._tr?.AbsoluteY || 0) / 1)
                        }

                        vsp.SetDesiredScroll(ds);
                        this._tr.Reset();

                        this.InvalidateRender();
                    }).bind(this)}
                    Transform={this._tr}
                    VerticalAlignment={VerticalAlignment.Top}
                    Scale={this._scale}
                    ItemsParent={this}
                    ItemHeight={812}
                />
                <div
                    ref={r => this._sizeFaker = r}
                    style={{ height: 1, position: 'absolute' }} >
                </div>
            </Panel>
            );
    }

    public static DefaultStyle: Style<IDocumentViewerProps> = new Style<IDocumentViewerProps>(
        {
            ItemsPanel: ItemsStackPanel,
            Background: "#E0E0E0",
            HorizontalScrollBarVisibility: ScrollBarVisibility.Auto,
            VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
            ItemContainerStyle: new Style<IDocumentPagePresenterProps>(
                {
                    Margin: "10px",
                    BorderBrush: "#C0C0C0",
                    BorderThickness: "1px",
                    BoxShadow: DefaultEffects.elevation8,
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
            this.ItemsPanelInstance?.InvalidateRender();
        }
        else if (property === nameof(this.state.Position))
        {
            var pos = value as DocumentPosition;
            var oldPos = oldValue as DocumentPosition;
            if (pos?.scale !== oldPos?.scale)
                this.ItemsPanelInstance?.InvalidateRender();
            this._vsp?.SetDesiredScroll({ X: 0, Y: 792 * (pos.page + pos.y) * pos.scale });            
        }
    }

    public /* override */ OnRenderItem(item: any, props?: any): JSX.Element | null
    {                
        const pageProps = Object.assign(props || {}, 
        {
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
        return DocumentPagePresenter;
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