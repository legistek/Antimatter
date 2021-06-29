import { Utilities } from '@antimatterjs/react';
import { Rect } from '../Foundation';
import { IDocument, IDocumentPage } from './IDocument';

export class PDFJSDocument implements IDocument
{
    private static _pdfjsTries: number = 5;
    private _pages: number = 0;
    private _pdf: any;

    public static async CreateAsync(url: string): Promise<PDFJSDocument|null>
    {
        let pdfjsLib: any = (window as any).pdfjsLib;

        var tries = 0;
        while (!pdfjsLib && tries++ < PDFJSDocument._pdfjsTries)
        {
            await Utilities.SleepAsync(1000);
            pdfjsLib = (window as any).pdfjsLib;
        }

        if (!pdfjsLib)
            throw "Include a reference to PDF.JS in index.html";

        var pdf = await pdfjsLib.getDocument({
            url: url,
            disableAutoFetch: true,
            disableStream: true,
            withCredentials: true,
            rangeChunkSize: 256 * 1024,
        }).promise;
        if (!pdf)
            return null;

        var pdfDoc = new PDFJSDocument();
        pdfDoc._pdf = pdf;
        pdfDoc._pages = pdf.numPages;
        return pdfDoc;
    }

    public get Pages(): number
    {
        return this._pages;
    }

    public async GetPageAsync(index: number): Promise<IDocumentPage|null> 
    {
        var page = await this._pdf.getPage(index + 1);
        if (!page)
            return null;

        var textContent = await page.getTextContent({
            normalizeWhitespace: true,
            includeMarkedContent: true,
        });

        return new PDFJSPage(page, textContent);
    }       
}

export class PDFJSPage implements IDocumentPage
{
    private _page: any;
    private _textContent: any;
    private _width: number = 0;
    private _height: number = 0;

    constructor(page: any, textContent: any)
    {
        this._page = page;
        var viewport = page.getViewport({ scale: 1 });
        this._width = viewport.width;
        this._height = viewport.height;
        this._textContent = textContent;
    }

    public get Width(): number
    {
        return this._width;
    }

    public get Height(): number
    {
        return this._height;
    }

    public RenderTextAsync(container: HTMLDivElement): Promise<void>
    {
        let pdfjsLib: any = (window as any).pdfjsLib;
        var task = pdfjsLib.renderTextLayer({
            textContent: this._textContent,
            container: container,
            viewport: this._page.getViewport({ scale: 1 }),
            enhanceTextSelection: false
        });
        return task.promise;
    }

    public async RenderAsync(canvas: HTMLCanvasElement, srcBounds: Rect, scale: number): Promise<void>
    {        
        var viewport = this._page.getViewport(
            {
                scale: scale,
                offsetX: Math.floor(-srcBounds.Left * scale),
                offsetY: Math.floor(-srcBounds.Top * scale)
            }
        );
        
        var ctx = canvas.getContext("2d");
        
        await this._page.render({
            canvasContext: ctx,
            viewport: viewport,
            background: "white"
        }).promise;

        //var tempCanvas = document.createElement('canvas');
        //tempCanvas.width = viewport.width;
        //tempCanvas.height = viewport.height;
        //var tempContext = tempCanvas.getContext("2d");
        //await this._page.render({
        //    canvasContext: tempContext,
        //    viewport: viewport
        //}).promise;

        //var ctx = canvas.getContext("2d");
        //canvas.width = viewport.width;
        //canvas.height = viewport.height;
        //ctx?.drawImage(tempCanvas, 0, 0);
    }
}