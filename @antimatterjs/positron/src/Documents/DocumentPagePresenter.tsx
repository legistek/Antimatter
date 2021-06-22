import * as React from "react";
import { Antimatter, Binding, Utilities } from "@antimatterjs/react";
import { PanelBase, IPanelProps, IPanelState } from "../Controls/Panel";
import { IDocument, IDocumentPage } from "./IDocument";
import { IItemsControlProps, IItemsControlState } from "../Controls/ItemsControl";
import { IPage } from "@fluentui/react";
import { LoadingShimmer } from "../Controls/LoadingShimmer";

interface IDocumentPagePresenterCommon
{
    Document?: IDocument | null,
    PageIndex?: number
}

export interface IDocumentPagePresenterProps extends IPanelProps, IDocumentPagePresenterCommon
{
    //Scale?: number | Binding
}

export interface IDocumentPagePresenterState extends IPanelState, IDocumentPagePresenterCommon
{
    //Scale?: number,
    Width?: number,
    Height?: number
}

export class DocumentPagePresenter<
    P extends IDocumentPagePresenterProps = {},
    S extends IDocumentPagePresenterState = {}>
    extends PanelBase<P, S>
//export class DocumentPagePresenter extends PanelBase<IDocumentPagePresenterProps, IDocumentPagePresenterState>
{
    _isDirty: boolean = true;
    _page?: IDocumentPage | null;

    constructor(props)
    {
        super(props);
        console.log('DocumentPagePresenter constructed');
        if (!this.state.Width)
        {
            (this.state as any)["Width"] = 612;
            (this.state as any)["Height"] = 792;
        }
    }

    /* override */ renderElement(): JSX.Element | null
    {
        return (
            <>
                <canvas
                    style={{
                        background: "white",
                        width: 612,
                        height: 792
                    }}
                    ref={r => this.RenderCanvas(r)}
                />
                {this._page === null ? (<LoadingShimmer Overlaps={true} Lines={15} />) : (<></>)}
            </>
        );
    }

    /* override */ getCSSStyles(): React.CSSProperties
    {        
        var styles = {
            width: ((this.state.Width || 0) as number),
            height: ((this.state.Height || 0) as number)
        };
        return Object.assign(super.getCSSStyles(), styles);
    }

    /* override */ OnPropertyChanged(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.state.Document) || property === nameof(this.state.PageIndex))
            this.InvalidatePage();
        //if (property == nameof(this.state.Scale))
        //    this._isDirty = true;
    }

    private async FetchPageAsync(): Promise<IDocumentPage|null|undefined>
    {
        if (!this.state.Document)
            return null;

        if (this._page)
            return this._page;

        this._page = await this.state.Document.GetPageAsync((this.state.PageIndex || 0) as number);
        this.setState(
            {
                Width: (this._page?.Width || 0),
                Height: (this._page?.Height || 0),
            });
        return this._page;
    }

    private async RenderCanvas(canvas: HTMLCanvasElement | null)
    {
        if (canvas === null || !this._isDirty)
            return;
        this._isDirty = false;
        var page = await this.FetchPageAsync();
        if (!page)
            return;        
        await page.RenderAsync(canvas, 3);
    }

    private InvalidatePage()
    {
        this._page = null;
        this._isDirty = true;
    }

    /* override */ OnInvalidateRender()
    {
        this._isDirty = true;
    }
}

//export class DocumentPagePresenter extends DocumentPagePresenterBase<IDocumentPagePresenterProps, IDocumentPagePresenterState>
//{
//}