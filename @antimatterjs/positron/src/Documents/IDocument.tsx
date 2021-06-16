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