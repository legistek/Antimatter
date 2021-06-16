import * as React from "react";
import { Antimatter, Binding, Utilities } from "@antimatterjs/react";
import { Panel, IPanelProps, IPanelState } from "../Controls/Panel";
import { IDocument, IDocumentPage } from "./IDocument";

interface IDocumentPagePresenterCommon
{
    Document?: IDocument|null,
    PageIndex?: number    
}

export interface IDocumentPagePresenterProps extends IPanelProps, IDocumentPagePresenterCommon
{
    Scale?: number | Binding
}

export interface IDocumentPagePresenterState extends IPanelState, IDocumentPagePresenterCommon
{
    Scale?: number,
    Width?: number,
    Height?: number 
}

export class DocumentPagePresenter extends Panel<IDocumentPagePresenterProps, IDocumentPagePresenterState>
{
    _isDirty: boolean = false;
    _page?: IDocumentPage|null;

    constructor(props)
    {
        super(props);
        this.FetchPageAsync();
    }

    /* override */ renderElement() : JSX.Element | null
    {
        return (
            <canvas
                ref={r => this.RenderCanvas(r)}
                width={this.state.Width}
                height={this.state.Height}/>
        );
    }

    /* override */ getCSSStyles(): React.CSSProperties
    {
        var styles = {
            width: (this.state.Width || 0) * (this.state.Scale || 1),
            height: (this.state.Height || 0) * (this.state.Scale || 1)
        };
        return Object.assign(super.getCSSStyles(), styles);
    }

    /* override */ OnPropertyChanged(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.state.Document) || property === nameof(this.state.PageIndex))
            this.FetchPageAsync();
        if (property == nameof(this.state.Scale))
            this._isDirty = true;
    }
    
    private async FetchPageAsync()
    {
        if (!this.state.Document)
            return;
        this._page = await this.state.Document.GetPageAsync(this.state.PageIndex || 0);
        this._isDirty = true;
        this.setState(
            {
                Width: (this._page?.Width || 0) * (this.state.Scale || 1),
                Height: (this._page?.Height || 0) * (this.state.Scale || 1),
            });
    }

    private async RenderCanvas(canvas: HTMLCanvasElement|null)
    {
        if (canvas === null || !this._isDirty || !this._page)
            return;
        this._isDirty = false;
        await this._page.RenderAsync(canvas, this.state.Scale || 1);        
    }
}