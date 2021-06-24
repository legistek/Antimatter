import * as React from 'react';
import {
    //IDropdownStyles,
    Dropdown, IDropdownOption, IStyle
} from '@fluentui/react';
import { Binding, BindingMode, ModelObjectReference } from "@antimatterjs/react";
import { ControlTemplate } from '@antimatterjs/positron/src/FrameworkTemplate';
import { SelectionMode } from '@antimatterjs/positron/src/Enums';
import { Style } from '@antimatterjs/positron/src/Style';
import { EmptyISelectorState, ISelectorProps, ISelectorState, Selector }
    from '@antimatterjs/positron/src/Controls/Primitives/Selector';

export interface IComboBoxProps extends ISelectorProps
{
    Label?: string | Binding,
    TitleStringOverride?: string | Binding,
    Placeholder?: string | Binding
}
export interface IComboBoxState extends ISelectorState
{
    Label?: string,
    TitleStringOverride?: string,
    Placeholder?: string
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
        if (this._options.length == 0)
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
        const styles: any = //IDropdownStyles (except w/o requiring all props to be defined)
        {
            label: textStyle
        }

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
                styles={styles}
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
        return this.OnRenderItem(option?.data);
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
        const option: IDropdownOption = {
            key: this.GetItemKey(item),
            text: this.GetItemKey(item),
            data: item
        };
        return option;
    }

    private get SelectedKey(): string | null
    {
        if (this.IsMultiSelect)
            return null;
        return this.GetItemKey(this.state.SelectedItem);
    }

    private get SelectedKeys(): string[] | null | undefined
    {
        //if (this.IsMultiSelect)
            return this.state.SelectedItems?.map(item => this.GetItemKey(item));

        //if (!this.IsMultiSelect)
        //    return undefined;
        //return this.state.SelectedItems?.map(item => this.GetItemKey(item));
    }
}

export class ComboBox extends ComboBoxBase<IComboBoxProps, IComboBoxState> { }