import { Bind, Binding, BindingMode } from "@antimatterjs/react";
import * as Model from '../model/Model';
import
{
    CommandButton,
    TextBlock,
    StackPanel, TextBox, View, FileDropTarget, VerticalAlignment, HorizontalAlignment, SemanticColor, Panel, ProgressRing, DragPanel, DataTemplate, Grid, DropPanel, DataTemplate
} from "@antimatterjs/positron";
import React from "react";
import { DefaultEffects } from "@fluentui/react";

export default class DragDrop extends View
{
    View(): JSX.Element
    {
        return (
            <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                <DragPanel
                    Margin="10px"
                    BorderBrush="black"
                    BorderThickness="1px"
                    Padding="10px"
                    Content={new Binding("Company.CEO")}
                    DragTemplate={DragDrop._dragTemplate}>
                    <TextBlock Text="Drag Me!" />
                </DragPanel>

                <DropPanel
                    DropCommands={new Binding("DropCommands")}
                    DragContent={new Binding("DragContent")}
                    DropTemplate={DragDrop._dropTemplate}
                    Background="#8080FF">
                    <TextBlock
                        Text="Drop Something Here!"
                        VerticalAlignment={VerticalAlignment.Center}
                        HorizontalAlignment={HorizontalAlignment.Center} />
                </DropPanel>
            </Grid>            
        );
    }

    private static _dropTemplate: DataTemplate = (item) => (
        <Panel Background="#FFFFFF">
            <TextBlock
                Text="Drop It Now!!!"
                VerticalAlignment={VerticalAlignment.Center}
                HorizontalAlignment={HorizontalAlignment.Center} />
        </Panel>);

    private static _dragTemplate: DataTemplate = (item) => (
        <TextBlock
            Text="I'm being dragged!"
            Foreground="red" />);
}
