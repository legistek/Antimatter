import { Component } from 'react';
import * as React from 'react';
import { DialogBox, DocumentViewer, FrameworkElement, Grid, HorizontalAlignment, IDocument, MultitouchTransform, Orientation, PDFJSDocument, ResizePanel, Side, StackPanel, TextBlock, TreeView, Window, WindowLayout } from '@antimatterjs/positron';

export default class ViewerTestApp extends FrameworkElement
{
    constructor(props)
    {
        super(props);
        this.LoadPDFAsync();
    }

    renderElement()
    {
        return (
            <Window>
                <DocumentViewer Document={this._pdfDoc} />
            </Window>
        );
    }

    private _pdfDoc?: IDocument | null;

    private async LoadPDFAsync()
    {
        this._pdfDoc = await PDFJSDocument.CreateAsync(
            "/data"
            //            "https://dev.limine.com/limineapi/webapi/matters/e41023f9-cd18-11eb-943f-0022484432a8/documents/c821b11c-cec4-11eb-943f-0022484432a8/pdf"
        );
        this.InvalidateRender();
    }
}