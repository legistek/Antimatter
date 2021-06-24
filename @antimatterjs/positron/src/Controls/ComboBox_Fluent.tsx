import * as React from 'react';
import { Binding, ModelObjectReference } from "@antimatterjs/react";
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { Style } from '../Style';
import {
    IRenderFunction,
    IStyle,

    Dropdown,
    IDropdownOption,
    ISelectableOption

} from '@fluentui/react';

import { Control, IControlProps, IControlState } from './Control';
import { ISelectorProps, ISelectorState, Selector } from './Primitives/Selector';
import { ISelectableItemControlProps, SelectableItemControl } from './Primitives/SelectableItemControl';
import { SelectionMode } from '../Enums';


export interface IComboBoxProps extends ISelectorProps {
//export interface IComboBoxProps extends IItemsControlProps {
//export interface IComboBoxProps extends IControlProps {
    //Multiselect?: boolean | Binding
}
export interface IComboBoxState extends ISelectorState {
//export interface IComboBoxState extends IItemsControlState {
//export interface IComboBoxState extends IControlState {
    //Multiselect?: boolean
}

class EmptyISelectorState implements ISelectorState {
    SelectedItems = [];
}

class ComboBoxBase<P extends IComboBoxProps = {}, S extends IComboBoxState = EmptyISelectorState> extends Selector<P, S>
//class ComboBoxBase<P extends IComboBoxProps = {}, S extends IComboBoxState = {}> extends ItemsControl<P, S>
//class ComboBoxBase<P extends IComboBoxProps = {}, S extends IComboBoxState = {}> extends Control<P, S>
{

    public static DefaultBindings = {
        ItemsSource: {
            NotifyCollectionChanged: true
        }
    };

    public static ItemTemplate(item: any): JSX.Element {
        const hoboDiv: JSX.Element = <div>HOBO!</div>

        return hoboDiv;
    }

    private onRenderOption: IRenderFunction<IDropdownOption> = (item?: IDropdownOption) => {
        //return this.OnRenderItem(item?.data);
        const elem: JSX.Element | null = this.OnRenderItem(item?.data);
        const hoboElem: JSX.Element = <div>Hobo</div>

        return elem;
    };

    public static DefaultStyle: Style<IComboBoxProps> = new Style<IComboBoxProps>(
        {
            Template: new ControlTemplate((templatedParent: ComboBoxBase) => templatedParent.controlTemplate),
            ItemTemplate: new DataTemplate((item: any) => ComboBoxBase.ItemTemplate(item))
        }
    );

    private options: IDropdownOption[] = [];

    private populateOptions(): void {
        this.options = [];
        if (!this.state.ItemsSource)
            return;
        for (let item of this.state.ItemsSource ?? []) {
            const ref: ModelObjectReference = item as ModelObjectReference;
            const option: IDropdownOption = {
                key: ref.Key,
                text: ref.Key,
                data: ref
            };
            this.options.push(option);
        }
    }

    private get controlTemplate(): JSX.Element {
        this.populateOptions();
        let selectedKey: string | number | string[] | number[] | null = null;
        if (this.state.SelectedItem) {
            const ref: ModelObjectReference = this.state.SelectedItem as ModelObjectReference;
            selectedKey = ref.Key;
        }
        //Multiselect goes here
        return (
            <Dropdown
                options={this.options}
                selectedKey={selectedKey}
                onRenderOption={this.onRenderOption}
                onChange={this.onChange}
                multiSelect={this.props.SelectionMode == SelectionMode.Multiple}
            />
        );
    }

    private onChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) =>
    {
        if (index == null)
            return;
        console.log(`change to ${index}`);
        this.SetSingleItemSelection(index);
    }
}

export class ComboBox_Fluent extends ComboBoxBase<IComboBoxProps, IComboBoxState> { }