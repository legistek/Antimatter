export interface IDocument
{
    Pages: number;
    GetPageAsync(pageIndex: number): Promise<IDocumentPage|null>;
}

export interface IDocumentPage
{
    Width: number;  // Points at 1x scale
    Height: number; // Points at 1x scale
    RenderAsync(canvas: HTMLCanvasElement, scale: number): Promise<void>;
}

export interface DocumentPosition
{
    scale: number,
    page: number,
    x: number,
    y: number
}