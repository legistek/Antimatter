import { Bind, Binding, BindingMode } from "@antimatterjs/react";
import * as Model from '../model/Model';
import
{
    CommandButton,
    TextBlock,
    StackPanel, TextBox, View, FileDropTarget, VerticalAlignment, HorizontalAlignment, SemanticColor, Panel, ProgressRing
} from "@antimatterjs/positron";
import React from "react";
import { DefaultEffects } from "@fluentui/react";

export default class Files extends View
{
    View(): JSX.Element
    {
        return (
            <StackPanel>
                <TextBox IsReadOnly={true} Text={Bind("SelectedFile.Name")} />

                <CommandButton ContextMenuCommands={new Binding("FileCommands")} Label="Menu" />
                <TextBlock Text="or" />
                <FileDropTarget
                    FilesDroppedCommand={Bind("DropFilesCommand")}
                    Background={SemanticColor.BodyStandoutBackground}
                    Width={150} Height={150}
                    DragOverTemplate={this.DropTargetOver}>
                    <TextBlock
                        VerticalAlignment={VerticalAlignment.Center}
                        HorizontalAlignment={HorizontalAlignment.Center}
                        Text="Drag File(s) Here" />
                </FileDropTarget>


                <CommandButton Command={Bind("LoadFileCommand")} />
                <TextBlock Text="File Contents:" FontWeight="bold" />
                <TextBlock Text={Bind("FileContents")} MaxLines={"5"} />

                <ProgressRing IsVisible={Bind("IsLoading")}
                    HorizontalAlignment={HorizontalAlignment.Center}
                    VerticalAlignment={VerticalAlignment.Center}/>

            </StackPanel>);
    }

    private DropTargetOver(parent: any): JSX.Element
    {
        return (
            <Panel Background="#A0A0FF" IsHitTestVisible={false}>
                <TextBlock Text="Drop me!!" VerticalAlignment={VerticalAlignment.Center} HorizontalAlignment={HorizontalAlignment.Center} />
            </Panel>
        )
    }

}