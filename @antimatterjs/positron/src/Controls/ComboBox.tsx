import * as React from 'react';
import { Dropdown, IDropdownOption, IDropdownSubComponentStyles, IStyle } from '@fluentui/react';
import { Binding, BindingMode, BindingParameters, ModelObjectReference } from "@antimatterjs/react";
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { SelectionMode } from '../Enums';
import { Style } from '../Style';
import { EmptyISelectorState, ISelectorProps, ISelectorState, Selector } from './Primitives/Selector';
import { TextBlock } from './TextBlock';
import { TextBox } from './TextBox';
import { PlacementMode, Popup } from './Popup';
import { StackPanel } from './StackPanel';
import { WrapPanel } from './WrapPanel';
import { FrameworkElement } from '../FrameworkElement';
import { ISelectableItemControlProps, SelectableItemControl, SelectableItemControlBase } from './Primitives/SelectableItemControl';

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
    UseCustomMultiselectTemplate?: boolean,
    PopupIsOpen?: boolean
}

export class ComboBoxBase extends Selector<IComboBoxProps, IComboBoxState>
//class ComboBoxBase<P extends IComboBoxProps = {}, S extends IComboBoxState = EmptyISelectorState> extends Selector<P, S>
{
    public static DefaultBindings = {
        ItemsSource: {
            FallbackValue: [],
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

    private static ItemTemplate_STATIC = new DataTemplate((item: any) => (
        <TextBlock
            Text="hobo"

            OnClick={() => ComboBoxBase.TestClick_Static('Templ')}
        />
    ));

    private static ItemContainerStyle_STATIC = new Style<ISelectableItemControlProps>(
        {
            Margin: "0px",
            Template: new ControlTemplate((templatedParent: SelectableItemControl) =>
            (
                <>{templatedParent.props.children}</>

                //<StackPanel OnClick={() => ComboBoxBase.TestClick_Static('ContStyle')}>{templatedParent.props.children}</StackPanel>
            ))
        },
        {
            Rules: {
                cursor: "pointer"
            }
        }
    );

    public static TestClick_Static(arg: string): void
    {
        console.log(`click test: ${arg}`);
    }

    public static DefaultStyle: Style<IComboBoxProps> = new Style<IComboBoxProps>(
        {
            //SelectionMode: SelectionMode.Single,
            //ItemsSource: [],
            Template: new ControlTemplate((templatedParent: ComboBoxBase) => templatedParent.Template),
            //ItemTemplate: ComboBoxBase.ItemTemplate_STATIC,
            //ItemContainerStyle: ComboBoxBase.ItemContainerStyle_STATIC
        }
    );

    public OnRenderItem(item: any, index: number): JSX.Element | null
    {
        console.log(`RENDER ${index}`);
        return super.OnRenderItem(item, index);
    }

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

        const fluent: JSX.Element = (
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

        if (fluent)
            return fluent;


        const fluentEmpty: JSX.Element = (
            <Dropdown
                label={this.state.Label}
                options={this._options}
                selectedKey={key}
                onRenderList={() => null}
                onRenderTitle={(items) => this.OnRenderTitle(items)}
                onClick={() => this.Open()}
                ref={r => this._root = (r as any) }
            />
        );
        const customRoot: JSX.Element = (
            <TextBox
                Text="ROOT TEXT"
                OnClick={() => this.Open()}
                IsEnabled={this.state.IsEnabled}
                //ref={r => this._root = r}
            />
        );

        if (this._root)
        {
            const rootElem: HTMLElement = (this._root as any) as HTMLElement;
            const width: number = rootElem.clientWidth;
        }

        const panel_Stack: JSX.Element = (
            <StackPanel
                ItemsParent={this}
            />
        );
        const panel_Wrap: JSX.Element = (
            <WrapPanel
                ItemsParent={this}
            />
        );





        //const root: JSX.Element = customRoot;
        const root: JSX.Element = fluentEmpty;

        const panel: JSX.Element = panel_Stack;
        //const panel: JSX.Element = panel_Wrap;

        const custom: JSX.Element = (
            <>
                {root}
                <Popup
                    IsOpen={this.state.PopupIsOpen}
                    Target={() => this._root}
                    Placement={PlacementMode.Below}
                    Padding="0"
                >
                    {panel}
                </Popup>
            </>
        );

        //return fluent;
        return custom;
    }

    private Open(): void
    {
        if (this.state.IsEnabled == false)
            return;
        this.setState({ PopupIsOpen: true });
    }
    private Close(): void { this.setState({ PopupIsOpen: false }); }

    /* protected override */ OnSelectionChanged()
    {
        console.log(`SELECTION ACTUALLY CHANGED OMG OMG`);
        this.Close();
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

    private _root?: FrameworkElement | null;
    private get RootWidth(): number | null
    {
        return null;
    }
}

//export class ComboBox extends ComboBoxBase<IComboBoxProps, IComboBoxState> { }
export class ComboBox extends ComboBoxBase { }