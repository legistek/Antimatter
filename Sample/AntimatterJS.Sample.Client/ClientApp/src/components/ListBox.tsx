import { Component } from 'react';
import * as React from 'react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent, BindingParameters, BindingMode } from '@antimatterjs/react';
import { CheckboxVisibility, DetailsList, DetailsRow, IColumn, IDetailsListProps, IDetailsRowStyles, Selection, List, PrimaryButton, SelectionMode, MotionAnimations } from '@fluentui/react';
import { ModelValue } from '@antimatterjs/react/src/ModelValue';

export interface IListBoxProps
{
    ItemsSource: any[] | Binding,    
    ItemTemplate: (item?: any) => JSX.Element,
    SelectedItem?: any | undefined | Binding,
}
export interface IListBoxState
{
    ItemsSource: any[]
}

export class ListBox extends AntimatterComponent<IListBoxProps, IListBoxState>
{
    public static DefaultBindings = {
        ItemsSource: {
            NotifyCollectionChanged: true,
            FallbackValue: []
        },
        SelectedItem: {
            Mode: BindingMode.TwoWay
        }
    };
    
    constructor(props)
    {
        super(props);

        this._columns =
            [
                {
                    key: "column",
                    name: "column",
                    minWidth: 100,
                    isPadded: false,
                    //onRender: (item, index, column) =>
                    //{

                    //}
                }
            ];
        
        this._selection = new Selection({
            getKey: (item, index) =>
            {
                return (item as any)?.IsModelObjectReference ? (item as any).Handle.toString() : index;
            },
            onSelectionChanged: (() =>
            {
                if (this._skipSelectionChangeNotification)
                    return;
                var sel = this._selection.getSelection();
                let a: number = 5;
                if (sel && sel.length > 0)
                    this.OnTargetChanged("SelectedItem", sel[0]);
                else
                    this.OnTargetChanged("SelectedItem", null);                
            }).bind(this),
        });
    }

    OnUpdateTargetValue(property: string, value: any)
    {
        if (property == "SelectedItem")
        {
            this._skipSelectionChangeNotification = true;
            if (value?.IsModelObjectReference)
                this._selection.setKeySelected(value.Handle, true, false);
            this._skipSelectionChangeNotification = false;
            //this._selection.selectToKey(value.Handle);
        }
        else if (property == "ItemsSource")
        {
            this._selection.setItems(value, !value);
        }
    }

    render()
    {
        return (
            <div className="amx-standard-control amx-listbox"
                style={{
                    display: "block",
                    overflowY: "auto"
                }}>
                <DetailsList
                    items={this.state.ItemsSource || []}
                    isHeaderVisible={false}
                    cellStyleProps={{
                        cellExtraRightPadding: 0,
                        cellLeftPadding: 5,
                        cellRightPadding: 5
                    }}
                    checkboxVisibility={CheckboxVisibility.hidden}
                    columns={this._columns}
                    onRenderRow={this._onRenderRow}
                    compact={true}
                    enableUpdateAnimations={true}                    
                    selectionMode={SelectionMode.multiple}                    
                    selection={this._selection}
                    onRenderItemColumn={(item, index, column) =>
                    {
                        return this.props.ItemTemplate(item);
                    }}
                    getKey={(item, index) =>
                        item?.IsModelObjectReference ? item.Handle.toString() : ''}
                    />
            </div>
            );
    }

    private _onRenderRow: IDetailsListProps['onRenderRow'] = props =>
    {
        const customStyles: Partial<IDetailsRowStyles> = {};
        if (props)
        {
            // if (props.itemIndex % 2 === 0)
            {
                // Every other row renders with a different background color
                customStyles.root = {
                    //backgroundColor: "#800000",
                    border: "none",
                    minHeight: 0,
                    padding: 0,
                    margin: 0,
                };
            }

            return <DetailsRow {...props}
                styles={customStyles}
                checkboxVisibility={CheckboxVisibility.hidden} />;
        }
        return null;
    };

    private _selection: Selection;
    private _columns: IColumn[];
    private _skipSelectionChangeNotification: boolean = false;
}
