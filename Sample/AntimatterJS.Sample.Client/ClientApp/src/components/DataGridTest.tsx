import { Binding, BindingMode } from "@antimatterjs/react";
import * as Model from '../model/Model';
import
    {
        CommandButton,
        DataTemplate,
        TextBlock,
        DataGrid, DocumentViewer, Grid, HorizontalAlignment, IDocument, Orientation, Panel, PDFJSDocument, StackPanel, TextBox, VerticalAlignment, View
    } from "@antimatterjs/positron";
import React from "react";
import { DefaultEffects } from "@fluentui/react";


export default class DataGridTest extends View
{
    _firstNameTemplate: DataTemplate = new DataTemplate((item) => (
        <TextBlock Text={new Binding("FirstName")} VerticalAlignment={VerticalAlignment.Center} />
    ));
    _lastNameTemplate: DataTemplate = new DataTemplate((item) => (
        <TextBlock Text={new Binding("LastName")} VerticalAlignment={VerticalAlignment.Center} />
    ));
    _ageTemplate: DataTemplate = new DataTemplate((item) => (
        <TextBlock Text={new Binding("Age")} VerticalAlignment={VerticalAlignment.Center} />
    ));

    Template(): JSX.Element
    {
        return (<DataGrid ItemsSource={new Binding(nameof<Model.Company>(c => c.Employees))}
            RowHeight={44}
            SelectedItems={new Binding("SelectedEmployees")}
            IsSelectAll={new Binding("IsAllSelected")}
            Columns={[
                {
                    Header: "First Name",
                    Key: "firstName",
                    Template: this._firstNameTemplate
                },
                {
                    Header: "Last Name",
                    Key: "lastName",
                    Template: this._lastNameTemplate
                },
                {
                    Header: "Age",
                    Key: "age",
                    Template: this._ageTemplate
                }
            ]}
        />);
    }

}