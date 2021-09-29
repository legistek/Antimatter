import { Binding, BindingMode } from "@antimatterjs/react";
import * as Model from '../model/Model';
import
{
    CommandButton,
    TextBlock,
    StackPanel, TextBox, View, FileDropTarget, VerticalAlignment, HorizontalAlignment, SemanticColor
} from "@antimatterjs/positron";
import React from "react";
import { DefaultEffects } from "@fluentui/react";

export default class Files extends View
{
    View(): JSX.Element
    {
        return (
            <StackPanel>
                <TextBox IsReadOnly={true} Text={new Binding("SelectedFile.Name")} />

                <CommandButton Command={new Binding("SelectFileCommand")} />

                <CommandButton Command={new Binding("LoadFileCommand")} />

                <TextBlock Text="File Contents:" FontWeight="bold" />

                <TextBlock Text={new Binding("FileContents")} MaxLines={"5"} />

                <FileDropTarget
                    FilesDroppedCommand={new Binding("DropFilesCommand")}
                    Background={SemanticColor.BodyStandoutBackground}
                    Width={500} Height={500} DragOverTemplate={this.DropTargetOver()}>
                    <TextBlock
                        VerticalAlignment={VerticalAlignment.Center}
                        HorizontalAlignment={HorizontalAlignment.Center}
                        Text="Drag File(s) Here"/>
                </FileDropTarget>

            </StackPanel>);
    }

    private DropTargetOver(): JSX.Element
    {
        return (<TextBlock Text="Drop me!!"/>)
    }

}