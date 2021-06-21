import * as React from 'react';
import { Binding } from "@antimatterjs/react";
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { Style } from '../Style';
import {
    IRenderFunction,
    IComboBoxStyles,
    IStyle,

    ComboBox as FluentComboBox,
    IComboBox as FluentIComboBox,
    IComboBoxOption as FluentIComboBoxOption

} from '@fluentui/react';

import { Control, IControlProps, IControlState } from './Control';
import { ISelectorProps, ISelectorState, Selector } from './Primitives/Selector';
import { ISelectableItemControlProps, SelectableItemControl } from './Primitives/SelectableItemControl';
import { SelectionMode } from '../Enums';


export interface IComboBoxProps extends IItemsControlProps {
//export interface IComboBoxProps extends IControlProps {
    //ItemsSource?: any[] | Binding,

    Converter?: ((item: any) => ComboBoxOption_Fluent),
    Multiselect?: boolean | Binding
}
export interface IComboBoxState extends IItemsControlState {
//export interface IComboBoxState extends IControlState {
    //ItemsSource?: any[],

    Multiselect?: boolean
}

class ComboBoxBase<P extends IComboBoxProps = {}, S extends IComboBoxState = {}> extends ItemsControl<P, S>
//class ComboBoxBase<P extends IComboBoxProps = {}, S extends IComboBoxState = {}> extends Control<P, S>
{

    public static DefaultBindings = {
        ItemsSource: {
            NotifyCollectionChanged: true
        }
    };

    public static DefaultStyle: Style<IComboBoxProps> = new Style<IComboBoxProps>(
        {
            Template: new ControlTemplate((templatedParent: ComboBoxBase) => templatedParent.controlTemplate)
        }
    );

    private options: ComboBoxOption_Fluent[] = [];

    private populateOptions(): void {
        this.options = [];
        for (const item of (this.state.ItemsSource ?? [])) {
            const o: ComboBoxOption_Fluent = this.props.Converter?.call(this, item) ?? (item as ComboBoxOption_Fluent);
            this.options.push(o);
        }

        //this.options = exampleOptions;
    }

    private get controlTemplate(): JSX.Element {
        this.populateOptions();
        const inputStyle: IStyle = {
            cursor: 'pointer',
            color: 'transparent !important',    //!important b/c a "rgb(16, 16, 16)" from somewhere overrides it o/w
            textShadow: '0 0 0 #000000'         //This + transparent color => hide cursor while keeping text visible
        };
        //const styles: IComboBoxStyles = {
        const styles = {
            input: inputStyle
        };
        return (
            <FluentComboBox
                styles={styles}
                allowFreeform={false}
                options={this.options}
                onRenderOption={this.onRenderOption}
                onChange={this.onChange}
                useComboBoxAsMenuWidth={true}
                multiSelect={this.state.Multiselect}
            />
        );
    }

    private onRenderOption: IRenderFunction<ComboBoxOption_Fluent> = (item?: ComboBoxOption_Fluent) => {
        return <div>{item?.text} {item?.infotip}</div>;
    };

    private onChange = (event: React.FormEvent<FluentIComboBox>, option?: FluentIComboBoxOption, index?: number, value?: string) =>
    {
        console.log(`change to ${value}`);
    }
}

export class ComboBox_Fluent extends ComboBoxBase<IComboBoxProps, IComboBoxState> { }


export interface ComboBoxOption_Fluent extends FluentIComboBoxOption {
    infotip?: string;
}

//export interface IComboBoxConverter<P> {
//    (props?: P, converter?: (props?: P) => JSX.Element | null): JSX.Element | null;
//}