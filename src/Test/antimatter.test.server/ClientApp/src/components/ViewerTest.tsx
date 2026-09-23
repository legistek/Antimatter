import { Binding, BindingMode, HostPlatform, Utilities } from "@antimatterjs/react";
import { CommandButton, DocumentPagePresenter, DocumentPagePresenterBase, DocumentViewer, Grid, HorizontalAlignment, IDocument, IDocumentPagePresenterProps, Orientation, Panel, PDFJSDocument, StackPanel, Style, TextBlock, TextBox, VerticalAlignment, View } from "@antimatterjs/positron";
import React from "react";
import { DefaultEffects } from "@fluentui/react";
import { ppid } from "process";

export default class ViewerTest extends View
{
    constructor(props)
    {
        super(props);
        this.LoadPDFAsync();
    }

    private static _pagePresenterStyle = new Style<IDocumentPagePresenterProps>({
        PagePadding: "15px 20px 20px 5px",
        RenderAnnotations: (pp) =>
        {
            return (<TextBlock
                Text="A Label!"
                VerticalAlignment={VerticalAlignment.Bottom} HorizontalAlignment={HorizontalAlignment.Center} />)
        }
    },
        DocumentPagePresenter.DefaultStyle);

    View(): JSX.Element
    {
        return (
            <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                <DocumentViewer
                    Grid={{ Row: 1 }}
                    Document={this._pdfDoc}
                    CanPan={
                        false//!(Utilities.BestGuessPlatform() & HostPlatform.iOS)
                    }
                    CanSelectText={true}
                    TextSelectedComamnd={(e) =>
                    {

                    }}
                    IsTouchManipulationEnabled={true}
                    ItemContainerStyle={ViewerTest._pagePresenterStyle}
                    ViewRotation={new Binding("Viewer.Rotation")}
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
                        <CommandButton
                            Style={CommandButton.IconButtonStyle}
                            Command={new Binding("Viewer.RotateCommand")} />
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