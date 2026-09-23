import React from "react";
import { Binding, BindingMode } from "@antimatterjs/react";
import * as Model from '../model/Model';
import
    {
        CommandButton,
        TextBlock,
        DataGrid,
        DocumentViewer, Grid, HorizontalAlignment,
        IDocument, Orientation, Panel,
        IDataGridColumn,
        PDFJSDocument, StackPanel, TextBox, VerticalAlignment, View, DataTemplate, Glyph, SelectionMode
    } from "@antimatterjs/positron";
import { DefaultEffects } from "@fluentui/react";


export default class DataGridTest extends View
{
    _firstNameTemplate: DataTemplate = (item) => (
        <TextBlock Text={new Binding("FirstName")} VerticalAlignment={VerticalAlignment.Center} />
    );
    _lastNameTemplate: DataTemplate = (item) => (
        <TextBlock Text={new Binding("LastName")} VerticalAlignment={VerticalAlignment.Center} />
    );
    _ageTemplate: DataTemplate = (item) => (
        <TextBlock Text={new Binding("Age")} VerticalAlignment={VerticalAlignment.Center} />
    );
    _columns: IDataGridColumn[] = [
        {
            Key: "selector",
            IsSelector: true,
            IsFrozen: true,
            Width: 36
        },
        {
            Header: "First Name",
            Key: "firstName",
            CanResize: true,
            CanSort: true,
            Template: this._firstNameTemplate
        },
        {
            Header: "Last Name",
            Key: "lastName",
            CanResize: true,
            CanSort: true,
            Template: this._lastNameTemplate
        },
        {
            Header: "Age",
            Key: "age",
            CanResize: true,
            CanSort: true,
            Template: this._ageTemplate
        },
        {
            Key: "moreCommands",
            IsFrozen: true,
            Width: 35,
            Template: (item) =>
            (<Glyph
                VerticalAlignment={VerticalAlignment.Center}
                Icon="MoreVertical" />)
        }];

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
                    IsCondensedMode={true}
                    CondensedItemTemplate={(item) =>
                        <StackPanel
                            VerticalAlignment={VerticalAlignment.Center}
                            Orientation={Orientation.Horizontal}>
                            <TextBlock Text={new Binding("LastName")} />
                            <TextBlock Text={new Binding("FirstName")} />
                            <TextBlock Text={new Binding("Age")} />
                        </StackPanel>                        
                    }
                    SortColumn={new Binding("SortColumn")}
                    ColumnResizeCommand={new Binding("ColumnResizeCommand")}
                    RowDragTemplate={(item) => <TextBlock Text={
                        //new Binding({ Source: item[0], Path: "FullName" })
                        `${item.length}hobos`
                    } />}
                    ItemsSource={new Binding(nameof<Model.Company>(c => c.Employees))}
                    RowHeight={44}
                    SelectedItems={new Binding("SelectedEmployees")}
                    IsSelectAll={new Binding("IsAllSelected")}
                    Columns={new Binding("Columns")}/>
            </Grid>
        );
    }

}