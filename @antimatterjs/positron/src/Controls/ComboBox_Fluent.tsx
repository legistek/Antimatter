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
    ISelectableOption,
    constructKeytip

} from '@fluentui/react';

import { Control, IControlProps, IControlState } from './Control';
import { ISelectorProps, ISelectorState, Selector } from './Primitives/Selector';
import { ISelectableItemControlProps, SelectableItemControl } from './Primitives/SelectableItemControl';
import { SelectionMode } from '../Enums';
import { IPanelProps, IPanelState, Panel } from './Panel';

import * as ReactDomServer from 'react-dom/server';


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

interface IComboBoxPanelState extends IPanelState {
    SelectedKey?: string;
}

class ComboBoxPanel extends Panel<IPanelProps, IComboBoxPanelState>
{
    private get Parent(): ComboBox_Fluent {
        return this.state.ItemsParent as ComboBox_Fluent;
    }

    /* override */ renderElement(): JSX.Element | null {
        this.PopulateOptions();
        return (
            <Dropdown
                options={this._options}
                selectedKey={this.state.SelectedKey}
                onRenderOption={this.onRenderOption}
                onChange={this.onChange}
                multiSelect={this.Parent?.props.SelectionMode == SelectionMode.Multiple}
            />
        );
    }

    private onRenderOption: IRenderFunction<IDropdownOption> = (item?: IDropdownOption) => {
        //return this.OnRenderItem(item?.data);
        //const elem: React.ReactElement = this.OnRenderItem(item?.data) ?? React.createElement('div');
        //const elem: React.ReactElement | null = this.OnRenderItem(item?.data);
        const elem: any = this.state.ItemsParent?.OnRenderItem(item?.data);

        const hoboDiv: JSX.Element = ComboBoxBase.HoboDiv;

        if (elem) {
            const types: React.ReactElement = (elem as React.ReactElement)
            const hobo: string = ReactDomServer.renderToString(elem) ?? '';
            const whoknows: string = ReactDomServer.renderToString(hoboDiv) ?? '';

            const yolo: JSX.Element = <div dangerouslySetInnerHTML={{ __html: hobo }}></div>;

            const help: JSX.Element = (<>{elem}</>);

            return help;
        }


        return elem;
        //return ComboBoxBase.HoboDiv;
    };



    private _options: IDropdownOption[] = [];

    public PopulateOptions(): void {
        this._options = [];
        const items = this.Parent?.state.ItemsSource;
        if (items == null || items.length == 0)
            return;

        for (const item of items) {
            var option = item as ModelObjectReference;
            if (!option.IsModelObjectReference)
                continue;

            const cmdProps: IDropdownOption = {
                key: option.Handle.toString(),
                text: option.Handle.toString(),
                data: option
            };
            this._options.push(cmdProps);
        }
        this.UpdateSelection();
    }

    //Update SelectedKey in component's state to force a rerender
    public UpdateSelection(): void
    {
        const selectedItem: ModelObjectReference = this.Parent?.state.SelectedItem as ModelObjectReference;
        if (!selectedItem?.IsModelObjectReference)
            return;
        const key: string = selectedItem?.Handle.toString() ?? '';
        if (key == this.state.SelectedKey)
            return;
        if (key != this.state.SelectedKey)
            this.setState({ SelectedKey: key });
    }

    private onChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
        if (index == null)
            return;
        this.Parent.SetSingleItemSelection(index);
    }
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

    public static get HoboDiv(): JSX.Element {
        return <div className="i-am-a-class">HOBO</div>
    }

    public static ItemTemplate(item: any): JSX.Element {
        return ComboBoxBase.HoboDiv;
    }

    private static HoboStyle: Style<IComboBoxProps> = new Style<IComboBoxProps>(
        {
            Template: new ControlTemplate((templatedParent: ComboBoxBase<IComboBoxProps, IComboBoxState>) =>
            {
                return (
                    <div>HOBO, BUT THIS TIME FROM ItemContainerStyle</div>
                );
            })
        }
    );

    public static DefaultStyle: Style<IComboBoxProps> = new Style<IComboBoxProps>(
        {
            ItemsSource: [],
            ItemsPanel: ComboBoxPanel,
            ItemTemplate: new DataTemplate((item: any) => ComboBoxBase.ItemTemplate(item)),
            ItemContainerStyle: ComboBoxBase.HoboStyle
        }
    );

    /* protected override */ OnSelectionChanged() {
        (this.ItemsPanelInstance as ComboBoxPanel)?.PopulateOptions();
        super.OnSelectionChanged();
    }

    /* override */ OnPropertyChanged(property: string, value: any, oldValue: any) {
        if (property === nameof(this.state.ItemsSource))
        {
            (this.ItemsPanelInstance as ComboBoxPanel)?.PopulateOptions();
        }
        super.OnPropertyChanged(property, value, oldValue);
    }
}

export class ComboBox_Fluent extends ComboBoxBase<IComboBoxProps, IComboBoxState> { }
