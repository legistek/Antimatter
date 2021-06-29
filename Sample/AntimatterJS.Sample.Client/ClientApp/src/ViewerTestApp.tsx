import { Component } from 'react';
import * as React from 'react';
import { DialogBox, DocumentViewer, Panel, FrameworkElement, Grid, HorizontalAlignment, IDocument, MultitouchTransform, Orientation, PDFJSDocument, ResizePanel, Side, StackPanel, TextBlock, TreeView, Window, WindowLayout, TextBox } from '@antimatterjs/positron';
import { Binding, BindingMode } from '@antimatterjs/react';


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
                <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                    <StackPanel Orientation={Orientation.Horizontal}>
                        <TextBox Label="Page" Text={new Binding({
                            Mode: BindingMode.TwoWay,
                            Path: "Company.DocPage",
                            Converter: (p: number) => p + 1,
                            ConverterBack: (p: number) => p - 1
                        })} />
                        <TextBox Label="Scale" Text={new Binding("Company.DocScale")} />
                    </StackPanel>
                    <DocumentViewer Document={this._pdfDoc}
                        Page={new Binding("Company.DocPage")}
                        Scale={new Binding("Company.DocScale")} />
                </Grid>
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