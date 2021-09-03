import { Binding, BindingMode } from "@antimatterjs/react";
import { CommandButton, DocumentViewer, Grid, HorizontalAlignment, IDocument, Orientation, Panel, PDFJSDocument, PinnablePanel, ScrollBarVisibility, Side, StackPanel, TextBlock, TextBox, VerticalAlignment, View } from "@antimatterjs/positron";
import React from "react";
import { DefaultEffects } from "@fluentui/react";

export default class PinnablePanelTest extends View
{
    Template(): JSX.Element
    {
        return (
            <Grid ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}>

                <PinnablePanel                    
                    IsPinned={true}
                    Side={Side.Left}
                    Grid={{ Column: 0 }}>
                    <TextBlock Text="Pinned Content" />
                </PinnablePanel>
                <StackPanel
                    Grid={{ Column: 1 }}
                    VerticalScrollBarVisibility={ScrollBarVisibility.Auto}>
                    <TextBlock Text="Some Content"/>
                </StackPanel>


            </Grid>);
    }
}