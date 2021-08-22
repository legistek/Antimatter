import { Binding, BindingMode } from "@antimatterjs/react";
import { CommandButton, DocumentViewer, Grid, HorizontalAlignment, IDocument, Orientation, Panel, PDFJSDocument, StackPanel, TextBox, VerticalAlignment, View } from "@antimatterjs/positron";
import React from "react";
import { DefaultEffects } from "@fluentui/react";

export default class ViewerTest extends View
{
    constructor(props)
    {
        super(props);
        this.LoadPDFAsync();
    }

    Template(): JSX.Element
    {
        return (
            <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                <DocumentViewer
                    Grid={{ Row: 1 }}
                    Document={this._pdfDoc}
                    Page={new Binding("Viewer.Page")}
                    Scale={new Binding("Viewer.Scale")} />

                <Panel BoxShadow={DefaultEffects.elevation8}>
                    <StackPanel
                        Orientation={Orientation.Horizontal}
                        HorizontalAlignment={HorizontalAlignment.Stretch}>
                        <CommandButton
                            Style={CommandButton.IconButtonStyle}
                            Command={new Binding("Viewer.PrevPageCommand")} />
                        <TextBox Text={new Binding({
                            Mode: BindingMode.TwoWay,
                            Path: "Viewer.Page",
                            Converter: (p: number) => p + 1,
                            ConverterBack: (p: number) => p - 1
                        })} VerticalAlignment={VerticalAlignment.Center} />
                        <CommandButton
                            Style={CommandButton.IconButtonStyle}
                            Command={new Binding("Viewer.NextPageCommand")} />
                        <CommandButton
                            Style={CommandButton.IconButtonStyle}
                            Command={new Binding("Viewer.ZoomInCommand")} />
                        <CommandButton
                            Style={CommandButton.IconButtonStyle} Icon={0xF029}
                            Command={new Binding("Viewer.ZoomOutCommand")} />
                    </StackPanel>
                </Panel>
            </Grid>
            );
    }

    private _pdfDoc?: IDocument | null;

    private async LoadPDFAsync()
    {
        this._pdfDoc = await PDFJSDocument.CreateAsync("/data");
        this.InvalidateRender();
    }
}