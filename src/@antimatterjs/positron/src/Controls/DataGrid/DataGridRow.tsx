import * as React from "react";
import { Binding, DataContext, Utilities } from "@antimatterjs/react";
import { TemplateProp, WebStyle } from "../../Style";
import { ThemeColor } from "../../Theme";
import { ISelectableItemControlProps, ISelectableItemControlState, SelectableItemControlBase } from "../Primitives/SelectableItemControl";
import { DataGridBase } from "./DataGrid";
import { DataGridCell } from "./DataGridCell";
import { CSSClasses } from "../../CSSClasses";
import { DragDropPanel, DropAcceptance } from "../DragPanel";

export interface IDataGridRowProps extends ISelectableItemControlProps
{
    DataGrid?: DataGridBase,
    Item?: any
}
export class DataGridRowBase<P extends IDataGridRowProps = {},
    S extends ISelectableItemControlState = {}> extends SelectableItemControlBase<P, S>
{
    public static DefaultStyle: WebStyle<IDataGridRowProps> = new WebStyle<IDataGridRowProps>(
        {
            Template: (templatedParent: DataGridRow) => <>{
                templatedParent.DataGrid?.CanDragRows ||
                templatedParent.DataGrid?.RowDropAcceptance !== DropAcceptance.None                
                    ? (
                        <DragDropPanel
                            IsTop={templatedParent.ItemIndex === 0}
                            CanDrag={templatedParent.DataGrid?.CanDragRows}
                            Accepts={templatedParent.DataGrid?.RowDropAcceptance}                            
                            DragOverPosition={
                                templatedParent.DataGrid?.RowDropPosition
                                    ? new Binding({
                                        Path: templatedParent.DataGrid.RowDropPosition.Path,
                                        Source: templatedParent.Item
                                    })
                                    : undefined
                            }
                            DropContent={
                                templatedParent.DataGrid?.RowDropContent
                                    ? new Binding({
                                        Path: templatedParent.DataGrid.RowDropContent.Path,
                                        Source: templatedParent.Item
                                    })
                                    : undefined}
                            DropCommands={
                                templatedParent.DataGrid?.RowDropCommands
                                    ? new Binding({
                                        Path: templatedParent.DataGrid.RowDropCommands.Path,
                                        Source: templatedParent.Item
                                    })
                                    : undefined}
                            DropTemplate={templatedParent.DataGrid?.RowDropTemplate}
                            DragSourceContent={() =>
                            {
                                var sel = templatedParent.DataGrid?.SelectedItems;
                                if (templatedParent.DataGrid?.IsSelectAll)
                                    return templatedParent.DataGrid.ItemsSource;
                                else if (sel && sel.length > 0)
                                    return sel;
                                else
                                    return [templatedParent.Item];
                            }}
                            ClassName={CSSClasses.DataGridRow}
                            DragTemplate={templatedParent.DataGrid?.RowDragTemplate}>
                            {templatedParent.RenderCells()}
                        </DragDropPanel>
                    )
                    : templatedParent.RenderCells() 
            }</>,
            SelectedBackground: ThemeColor.ThemeLighter,
            TabIndex: -1,
        },
        {
            "@": {
                background: "transparent",
                //animation: "ptxfadein 0.5s linear 0s 1 normal",                
            },
            "@.selected": {
                background: TemplateProp(nameof<ISelectableItemControlProps>(p => p.SelectedBackground))
            },
            [`@.selected .${CSSClasses.DataGridCellFrozenFirst}`]: {
                background: TemplateProp(nameof<ISelectableItemControlProps>(p => p.SelectedBackground))
            },
            [`@.selected .${DataGridCell.STATE_FrozenLast}`]: {
                background: TemplateProp(nameof<ISelectableItemControlProps>(p => p.SelectedBackground))
            }
        }
    );

    public get Cells(): DataGridCell[]
    {
        return this._cells;
    }

    protected SetCells(cells: DataGridCell[])
    {
        this._cells = cells;
    }

    public get DataGrid(): DataGridBase | undefined
    {
        return this.GetValue(nameof(this.props.DataGrid));
    }

    public get Item(): any
    {
        return this.GetValue(nameof(this.props.Item));
    }    

    public override constructClasses(): string
    {
        if (this.DataGrid?.CanDragRows ||
            this.DataGrid?.RowDropAcceptance !== DropAcceptance.None)
            // If D&D is enabled the child panel gets our grid responsibilities
            return super.constructClasses() + ` ${CSSClasses.DataGridRowDropParent} `;
        return super.constructClasses() + ` ${CSSClasses.DataGridRow} `;      
    }

    override getCSSStyles()
    {
        var styles = super.getCSSStyles();        
        if (this.IsSelected && this.SelectedBackground)
            styles.background = this.SelectedBackground;
        else if (this.Background)
            styles.background = this.Background;
        styles.overflow = "visible";    // for decorators
        return styles;
    }   

    protected /* virtual */ RenderCells(): JSX.Element[]
    {
        if (!this.DataGrid)
            return [];
        let cells: JSX.Element[] = [];

        this.SetCells(new Array(this.DataGrid.Columns.length));

        let i = 0, c = -1;
        for (let col of this.DataGrid.Columns)
        {
            c++;
            cells.push(
                (<DataGridCell
                    ref={r =>
                    {
                        if (!r)
                            return;                        
                        this._cells[r.ColumnIndex] = r;
                    }}
                    key={col.Key}
                    Row={this}                    
                    CanEdit={!col.IsFrozen && col.CanEditPath ? new Binding({
                        Source: this.Item,
                        Path: col.CanEditPath,
                    }) : undefined}
                    Style={this.DataGrid?.CellStyle}
                    Content={this.Item}
                    DataGrid={this.DataGrid}
                    ItemIndex={this.ItemIndex}
                    ColumnIndex={c}
                    Column={col}
                    IsSelected={col.IsSelector ? this.IsSelected : undefined}
                    Grid={{ Column: (col.IsFrozen && i == this.DataGrid.Columns.length - 1 ? ++i : i++)}} />)
            );
        }
        return cells;
    }

    override OnContainerMounted(container: HTMLElement)
    {
        (container as any).AMXDataGridRowIndex = this.ItemIndex;
    }

    private _cells: DataGridCell[] = [];
}
export class DataGridRow extends DataGridRowBase<IDataGridRowProps, ISelectableItemControlState> { }