import { Binding, BindingMode } from "@antimatterjs/react";
import * as Model from '../model/Model';
import
{
    CommandButton,
    TextBlock,
    StackPanel, TextBox, View
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
            </StackPanel>);
    }
}