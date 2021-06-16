import * as React from "react";
import { Antimatter, Binding, Utilities } from "@antimatterjs/react";
import { PanelBase, IPanelProps, IPanelState } from "../Controls/Panel";
import { IDocument, IDocumentPage } from "./IDocument";
import { IItemsControlProps, IItemsControlState } from "../Controls/ItemsControl";

interface IDocumentPagePresenterCommon
{
    Document?: IDocument | null,
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

export class DocumentPagePresenter<
    P extends IDocumentPagePresenterProps = {},
    S extends IDocumentPagePresenterState = {}>
    extends PanelBase<P, S>
//export class DocumentPagePresenter extends PanelBase<IDocumentPagePresenterProps, IDocumentPagePresenterState>
{
    _isDirty: boolean = false;
    _page?: IDocumentPage | null;

    constructor(props)
    {
        super(props);
        this.FetchPageAsync();
    }

    /* override */ renderElement(): JSX.Element | null
    {
        return (
            <canvas
                ref={r => this.RenderCanvas(r)}
                width={this.state.Width}
                height={this.state.Height} />
        );
    }

    /* override */ getCSSStyles(): React.CSSProperties
    {        
        var styles = {
            width: ((this.state.Width || 0) as number) * ((this.state.Scale || 1) as number),
            height: ((this.state.Height || 0) as number) * ((this.state.Scale || 1) as number)
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
        this._page = await this.state.Document.GetPageAsync((this.state.PageIndex || 0) as number);
        this._isDirty = true;
        this.setState(
            {
                Width: (this._page?.Width || 0),
                Height: (this._page?.Height || 0),
            });
    }

    private async RenderCanvas(canvas: HTMLCanvasElement | null)
    {
        if (canvas === null || !this._isDirty || !this._page)
            return;
        this._isDirty = false;
        await this._page.RenderAsync(canvas, (this.state.Scale || 1) as number);
    }
}

//export class DocumentPagePresenter extends DocumentPagePresenterBase<IDocumentPagePresenterProps, IDocumentPagePresenterState>
//{
//}