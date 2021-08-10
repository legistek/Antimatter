import * as React from 'react';
import { Dropdown, IDropdownOption, IDropdownSubComponentStyles, IStyle } from '@fluentui/react';
import { Binding, BindingMode, BindingParameters, ModelObjectReference } from "@antimatterjs/react";
import { ControlTemplate } from '../FrameworkTemplate';
import { SelectionMode } from '../Enums';
import { Style } from '../Style';
import { EmptyISelectorState, ISelectorProps, ISelectorState, Selector } from './Primitives/Selector';

export interface IComboBoxProps extends ISelectorProps
{
    Label?: string | Binding,
    TitleStringOverride?: string | Binding,
    Placeholder?: string | Binding,
    IsEnabledPath?: string,
    UseCustomMultiselectTemplate?: boolean | Binding
}
export interface IComboBoxState extends ISelectorState
{
    Label?: string,
    TitleStringOverride?: string,
    Placeholder?: string,
    IsEnabledPath?: string,
    UseCustomMultiselectTemplate?: boolean
}

class ComboBoxBase<P extends IComboBoxProps = {}, S extends IComboBoxState = EmptyISelectorState> extends Selector<P, S>
{
    public static DefaultBindings = {
        ItemsSource: {
            NotifyCollectionChanged: true
        },
        SelectedItem: {
            Mode: BindingMode.TwoWay
        },
        SelectedItems: {
            Mode: BindingMode.TwoWay,
            NotifyCollectionChanged: true,
            FallbackValue: []
        }
    };

    public static DefaultStyle: Style<IComboBoxProps> = new Style<IComboBoxProps>(
        {
            Template: new ControlTemplate((templatedParent: ComboBoxBase) => templatedParent.Template)
        }
    );

    private _options: IDropdownOption[] = [];
    private get IsMultiSelect(): boolean { return this.props.SelectionMode == SelectionMode.Multiple; }

    private get Template(): JSX.Element
    {
        this.PopulateOptions();

        var key: string | undefined;
        var keys: string[] | undefined;
        if (this.IsMultiSelect)
            keys = this.state.SelectedItems?.map(item => this.GetItemKey(item));
        else
            key = this.GetItemKey(this.state.SelectedItem);

        const textStyle: IStyle =
        {
            fontFamily: this.state.FontFamily,
            color: this.state.Foreground,
            fontSize: this.state.FontSize
        };
        const optionStyle: IStyle = {
            selectors: {
                ' .SelectableItemControlBase': {
                    display: 'grid',
                    width: '100%'
                }
            }
        }
        const subcomponentStyles: IDropdownSubComponentStyles | any = {};
        if (this.state.UseCustomMultiselectTemplate)
            subcomponentStyles.multiSelectItem = { checkbox: {display: 'none'}}

        const placeholder: string = this.state.Placeholder ?? this.state.TitleStringOverride ?? '';

        return (
            <Dropdown
                options={this._options}
                selectedKey={key}
                selectedKeys={keys}
                onRenderOption={(item?: IDropdownOption) => this.OnRenderOption(item)}
                onChange={(event, option, index?: number) => this.OnChange(index)}
                onRenderTitle={(items) => this.OnRenderTitle(items)}
                multiSelect={this.IsMultiSelect}
                disabled={this.state.IsEnabled === false}
                label={this.state.Label}
                placeholder={placeholder}
                notifyOnReselect={false}
                styles={{
                    dropdownItem: optionStyle,
                    dropdownItems: optionStyle,
                    label: textStyle,
                    subComponentStyles: subcomponentStyles
                }}
            />
        );
    }

    //For rendering current selection in main (non-expanded) control element
    //Unless provided explicitly, uses same template as DD options (if single-select), or comma-separated string (o/w)
    private OnRenderTitle(options?: IDropdownOption[]): JSX.Element | null
    {
        if (this.state.TitleStringOverride != null)
            return <>{this.state.TitleStringOverride}</>;

        if (!this.IsMultiSelect && options?.length == 1)
            return this.OnRenderOption(options[0]);
        return null;
    }

    private OnRenderOption(option?: IDropdownOption): JSX.Element | null
    {
        const index: number = this._options?.findIndex(o => o.key == option?.key);
        return this.OnRenderItem(option?.data, index);
    };

    private OnChange(index?: number): void
    {
        if (index == null)
            return;
        if (this.IsMultiSelect)
            this.ToggleMultiItemSelection(index);
        else
            this.SetSingleItemSelection(index);
    }

    //The multi-selection analog to Selector.SetSingleItemSelection()
    /* private*/ ToggleMultiItemSelection(index: number)
    {
        var item: any = this.state.ItemsSource ? this.state.ItemsSource[index] : null;
        if (!item || (this.SelectionMode == SelectionMode.Single))
            return;
        const items: any[] = this.state.SelectedItems ?? [];

        //const currentIndex: number = items.indexOf(item);
        const currentIndex: number = items.findIndex(i => this.CheckItemEquality(item, i));

        if (currentIndex == -1)
            items.push(item);
        else
            items.splice(currentIndex, 1);
        const itemsCopy: any[] = items.slice();
        this.SetValue(nameof(this.state.SelectedItems), itemsCopy);
        this.OnSelectionChanged();
        this._lastClickedOrSelected = index;
    }

    //For checking if SelectedItems contains a given (ItemSource) item, actual objects may be different so compare keys
    CheckItemEquality(item1: any, item2: any): boolean
    {
        const key1: string = this.GetItemKey(item1);
        const key2: string = this.GetItemKey(item2);
        return (key1 != '') && (key1 === key2);
    }

    //Fluent's click area exceeds Selector templates', so cancel Selector's handlers & use OnChange to process manually
    /* override */ OnItemPointerDown(event: MouseEvent, item: any): void { }
    /* override */ OnItemClick(event: MouseEvent, item: any): void { }

    public PopulateOptions(): void
    {
        this._options = this.state.ItemsSource?.map(item => this.GetItemOption(item)) ?? [];
    }

    /* override */ OnPropertyChanged(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.state.ItemsSource))
            this.PopulateOptions();
        super.OnPropertyChanged(property, value, oldValue);
    }

    //Convert an arbitrary ItemsSource member into a key (compatible w/ default template) for use in Fluent dropdown
    private GetItemKey(item?: any): string
    {
        if (item == null)
            return '';
        const ref: ModelObjectReference = item as ModelObjectReference;
        if (ref?.IsModelObjectReference)
            return ref?.Handle.toString();
        else
            return item.toString();
    }

    private GetItemOption(item?: any): IDropdownOption
    {
        const key: string = this.GetItemKey(item);
        const disabledBindParams: BindingParameters = {
            Path: this.state.IsEnabledPath,
            Source: item,
            Converter: (val) => !val
        };

        const option: IDropdownOption = {
            key: key,
            text: key,
            data: item,
            disabled: this.BindState(disabledBindParams, `${key}:IsEnabled`)
        };
        return option;
    }
}

export class ComboBox extends ComboBoxBase<IComboBoxProps, IComboBoxState> { }