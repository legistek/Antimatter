import { Rect } from "@antimatterjs/react";

export interface IDocument
{
    Pages: number;
    GetPageAsync(pageIndex: number): Promise<IDocumentPage | null>;
    LastError: string | undefined;
    Dispose(): Promise<void>;
}

export interface IDocumentPage
{
    LastError: string | undefined;
    Width: number;  // Points at 1x scale
    Height: number; // Points at 1x scale
    RenderAsync(canvas: HTMLCanvasElement, srcBounds: Rect, scale: number, textLayerContainer?: HTMLDivElement): Promise<boolean>;
    RenderTextAsync(container: HTMLDivElement): Promise<boolean>;
}

export interface DocumentPosition
{
    scale?: number,
    page?: number,
    x?: number,
    y?: number
}