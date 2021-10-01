import { Binding, BindingMode } from "@antimatterjs/react";
import * as Model from '../model/Model';
import
    {
        CommandButton,
        DataTemplate,
        TextBlock,
        DataGrid, DocumentViewer, Grid, HorizontalAlignment, IDocument, Orientation, Panel, PDFJSDocument, StackPanel, TextBox, VerticalAlignment, View, DataTemplateValue
    } from "@antimatterjs/positron";
import React from "react";
import { DefaultEffects } from "@fluentui/react";

export default class DataGridTest extends View
{
    _firstNameTemplate: DataTemplateValue = (item) => (
        <TextBlock Text={new Binding("FirstName")} VerticalAlignment={VerticalAlignment.Center} />
    );
    _lastNameTemplate: DataTemplateValue = (item) => (
        <TextBlock Text={new Binding("LastName")} VerticalAlignment={VerticalAlignment.Center} />
    );
    _ageTemplate: DataTemplateValue = (item) => (
        <TextBlock Text={new Binding("Age")} VerticalAlignment={VerticalAlignment.Center} />
    );

    View(): JSX.Element
    {
        return (
            <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                <StackPanel
                    Grid={{Row:0}}
                    Orientation={Orientation.Horizontal}>
                    <TextBlock
                        Text="Employee Count:"
                        VerticalAlignment={VerticalAlignment.Center}/>
                    <TextBlock
                        Text={new Binding("Employees.Count")}
                        VerticalAlignment={VerticalAlignment.Center} />
                    <CommandButton
                        Command={new Binding(nameof<Model.Company>(c => c.NewEmployeeCommand))}
                        Style={CommandButton.CommandBarButtonStyle} />
                    <CommandButton
                        Command={new Binding("DeleteSelectedEmployeesCommand")}
                        Style={CommandButton.CommandBarButtonStyle} />
                </StackPanel>                
                <DataGrid
                    Grid={{ Row: 1 }}
                    CanDragRows={true}
                    RowDragTemplate={(item) => <TextBlock Text={new Binding({Source: item, Path: "FullName"}) }/>}
                    ItemsSource={new Binding(nameof<Model.Company>(c => c.Employees))}
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
                        }]} />
            </Grid>
        );
    }

}