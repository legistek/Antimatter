import { Utilities, Rect } from '@antimatterjs/react';
import { IDocument, IDocumentPage } from './IDocument';


declare global
{
    class TextLayer
    {
        constructor(params: any);
        render(): Promise<any>;
    }
}

export class PDFJSDocument implements IDocument
{
    private static _pdfjsTries: number = 5;
    private _pages: number = 0;
    private _pdf: any;
    private _lastError: string | undefined;
    private _loadingTask: any;

    public get LastError(): string|undefined
    {
        return this._lastError;
    }
    
    public static async EnsureLibraryAsync() : Promise<any>
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

        return pdfjsLib;
    }

    public static async CreateAsync(url: string): Promise<PDFJSDocument|null>
    {
        var pdfjsLib = await PDFJSDocument.EnsureLibraryAsync();
        let pdf: any;
        let pdfTask: any;

        try
        {
            pdfTask = pdfjsLib.getDocument({
                url: url,
                cMapUrl: "/v4/pdf/cmaps/",
                disableAutoFetch: true,
                disableStream: true,
                withCredentials: true,
                rangeChunkSize: 512 * 1024,
            });
            pdf = await pdfTask.promise;
            if (!pdf)
                return null;
        }
        catch (e) 
        {            
            return null;
        }

        var pdfDoc = new PDFJSDocument();
        pdfDoc._pdf = pdf;
        pdfDoc._pages = pdf.numPages;
        pdfDoc._loadingTask = pdfTask;
        return pdfDoc;
    }

    public async Dispose(): Promise<void>
    {
        await this._loadingTask.destroy();
    }

    public get Pages(): number
    {
        return this._pages;
    }

    public async GetPageAsync(index: number): Promise<IDocumentPage|null> 
    {
        let page: any;
        try
        {
            page = await this._pdf.getPage(index + 1);
            if (!page)
                return null;
        }
        catch (e)
        {
            if (typeof (e) === "string")
                this._lastError = e;
            return null;
        }

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
    private _lastError?: string;

    public get LastError(): string | undefined
    {
        return this._lastError;
    }

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

    public async RenderTextAsync(container: HTMLDivElement): Promise<boolean>
    {
        container.style?.setProperty("--scale-factor", "1");

        let pdfjsLib: any = (window as any).pdfjsLib;

        var viewport = this._page.getViewport({ scale: 1 });

        var translate = Math.abs(viewport.width - viewport.height) / 2;
        if (viewport.rotation === 270)
        {
            container.style.width = `${viewport.height}px`;
            container.style.height = `${viewport.width}px`;
            container.style.transform = `rotate(${viewport.rotation}deg) translate(${translate}px, ${translate}px)`;
        }
        else if (viewport.rotation === 90)
        {
            container.style.width = `${viewport.height}px`;
            container.style.height = `${viewport.width}px`;
            container.style.transform = `rotate(${viewport.rotation}deg) translate(-${translate}px, -${translate}px)`;
        }
        else if (viewport.rotation === 180)
        {
            container.style.width = `${viewport.width}px`;
            container.style.height = `${viewport.height}px`;
            container.style.transform = `rotate(${viewport.rotation}deg)`;
        }
        else
        {
            container.style.width = `${viewport.width}px`;
            container.style.height = `${viewport.height}px`;
        }

        var params = {
            textContentSource: this._page.streamTextContent(),
            viewport: viewport,
            container: container,
        };
        
        var layer = new (await PDFJSDocument.EnsureLibraryAsync()).TextLayer(params);
        var task = layer.render();  

        try
        {
            await task.promise;
            return true;
        }
        catch (e)
        {
            if (typeof (e) === "string")
                this._lastError = e;
            return false;
        }
    }

    public async RenderAsync(canvas: HTMLCanvasElement, srcBounds: Rect, scale: number): Promise<boolean>
    {        
        if (!canvas)
        {
            this._lastError = "Undefined canvas";
            return false;
        }
        var viewport = this._page.getViewport(
            {
                scale: scale,
                offsetX: Math.floor(-srcBounds.Left * scale),
                offsetY: Math.floor(-srcBounds.Top * scale)
            }
        );
        
        var ctx = canvas.getContext("2d");
        if (!ctx)
        {
            this._lastError = "Unable to obtain 2d canvas context";
            return false;
        }

        try
        {
            await this._page.render({
                canvasContext: ctx,
                viewport: viewport,
                background: "white"
            }).promise;
            return true;
        }
        catch (e)
        {
            if (typeof (e) === "string")
                this._lastError = e;
            return false;
        }
    }
}