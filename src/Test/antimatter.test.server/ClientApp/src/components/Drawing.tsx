import { Bind, Binding, BindingMode } from "@antimatterjs/react";
import * as Model from '../model/Model';
import
{
    CommandButton, Grid,
    TextBlock,
    StackPanel, TextBox, View, FileDropTarget, VerticalAlignment, HorizontalAlignment, SemanticColor, Panel, ProgressRing, DrawingSurface
} from "@antimatterjs/positron";
import React from "react";

export class Drawing extends View
{
    public View()
    {


        return (
            <Grid>
                <TextBlock Text="What's up hobo?" FontSize={64} />
                <DrawingSurface
                    Overlaps={true}
                    RenderCommand={new Binding("RenderCommand")} />

            </Grid>
                );
    }
}