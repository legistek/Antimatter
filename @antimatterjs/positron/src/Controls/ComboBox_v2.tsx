import * as React from 'react';
import { Dropdown, getTheme, IDropdownOption, IStyle } from '@fluentui/react';
import { Binding, BindingMode, Utilities } from '@antimatterjs/react';
import { Popup } from './Popup';
import { EmptyISelectorState, ISelectorProps, ISelectorState, Selector } from './Primitives/Selector';
import { Orientation, SelectionMode, VerticalAlignment } from '../Enums';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { ISelectableItemControlProps, SelectableItemControlBase, ISelectableItemControlState }
    from './Primitives/SelectableItemControl';
import { FrameworkElement } from '../FrameworkElement';
import { Style } from '../Style';
import { ITextBlockProps, TextBlock } from './TextBlock';
import { CheckBox } from './CheckBox';
import { StackPanel } from './StackPanel';
import { Grid, IColumnDefinition } from './Grid';
import { VirtualizedPanel } from './VirtualizedPanel';
import { VirtualizingPanel } from './VirtualizingPanel';
import { Control, IControlProps, IControlState } from './Control';

export interface IComboBoxProps2 extends ISelectorProps
{
    Label?: string | Binding,
    TitleOverride?: DataTemplate | string | Binding,
    PreventAutoCheckboxes?: boolean | Binding,
    PlaceholderText?: string | Binding
}
export interface IComboBoxState2 extends ISelectorState
{
    Label?: string,
    TitleOverride?: DataTemplate | string,
    PreventAutoCheckboxes?: boolean,
    PlaceholderText?: string,
    PopupIsOpen?: boolean
}

export class ComboBox2<P extends IComboBoxProps2 = {}, S extends IComboBoxState2 = EmptyISelectorState>
    extends Selector<P, S>
{
    private static DROPDOWN_MAX_HEIGHT: number = 400;

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
            NotifyCollectionChanged: true
        }
    };

    private _button?: FrameworkElement | null;
    public get IsMultiSelect(): boolean { return this.props.SelectionMode == SelectionMode.Multiple; }

    public static DefaultStyle: Style<IComboBoxProps2> = new Style<IComboBoxProps2>(
        {
            SelectionMode: SelectionMode.Single,
            ItemsSource: [],
            Template: new ControlTemplate((templatedParent: ComboBox2) => templatedParent.Template),
            ItemTemplate: new DataTemplate((item: any) => ComboBox2.DefaultItemTemplate(item))
        }
    );

    private get Template(): JSX.Element
    {
        const dropdown: JSX.Element = (
            <FluentDropdown
                ref={r => this._button = r}
                OnClick={() => this.TogglePopup()}
                Content={this.TitleTemplate}
                IsEnabled={this.state.IsEnabled}
                Label={this.state.Label}
            />
        );

        const labelStyle: Style<ITextBlockProps> = new Style<ITextBlockProps>({},
            {
                Rules: {
                    fontFamily: TextBlock.theme.fonts.medium.fontFamily,
                    cursor: 'default'
                }
            }
        );

        const labeledDropdown: JSX.Element = (
            <StackPanel Orientation={Orientation.Vertical}>
                <TextBlock
                    Text={this.state.Label}
                    FontSize={this.state.FontSize ?? 14}
                    FontWeight={this.state.FontWeight ?? 600}
                    FontFamily={this.state.FontFamily}
                    Margin="5px 0"
                    Style={labelStyle}
                />
                {dropdown}
            </StackPanel>
        );

        const stackPanel: JSX.Element = (
            <StackPanel ItemsParent={this} />
        );
        const virtualPanel_PastTense: JSX.Element = (
            <VirtualizedPanel ItemsParent={this} />
        );
        const virtualPanel_PresentParticipleTense: JSX.Element = (
            <VirtualizingPanel ItemsParent={this} />
        );

        const panel: JSX.Element = stackPanel;
        //const panel: JSX.Element = virtualPanel_PastTense;
        //const panel: JSX.Element = virtualPanel_PresentParticipleTense;

        const root: JSX.Element = this.state.Label ? labeledDropdown : dropdown;
        const elem: JSX.Element = (
            <>
                {root}
                <Popup
                    IsOpen={this.state.PopupIsOpen}
                    Target={() => this._button}
                    Width={this._button?.Container?.clientWidth}
                    MaxHeight={ComboBox2.DROPDOWN_MAX_HEIGHT}
                    Padding="0"
                >
                    {panel}
                </Popup>
            </>
        );
        return elem;
    }

    public /* override */ GetContainerForItemOverride()
    {
        return ComboBoxItem;
    }

    public static DefaultTextblockStyle: Style<ITextBlockProps> = new Style<ITextBlockProps>({},
        {
            Rules: {
                userSelect: 'none',
                lineHeight: '30px'
            }
        }
    );

    private static DefaultItemTemplate(item: any): JSX.Element
    {
        const elem: JSX.Element = (
            <TextBlock
                Text={Utilities.GetStringKey(item)}
                Margin="0px 6px"
                Style={ComboBox2.DefaultTextblockStyle}
            />
        );
        return elem;
    }

    /* protected override */ OnSelectionChanged()
    {
        if (!this.IsMultiSelect)
            this.setState({ PopupIsOpen: false });
        super.OnSelectionChanged();
    }

    private TogglePopup(): void
    {
        if (this.state.IsEnabled == false)
            return;
        this.setState({ PopupIsOpen: !this.state.PopupIsOpen });
    }

    private get TitleTemplate(): DataTemplate | undefined
    {
        const elem: JSX.Element | undefined = this.TitleElem;
        if (elem)
            return new DataTemplate(() => elem);
    }

    private get TitleElem(): JSX.Element | undefined
    {
        if (this.state.TitleOverride)
        {
            if (this.state.TitleOverride instanceof DataTemplate)
                return this.state.TitleOverride.GetVisualTree()(this);
            else if (typeof this.state.TitleOverride == 'string')
                return this.ConstructTitleFromString(this.state.TitleOverride);
        }

        if (this.IsMultiSelect)
        {
            const keys: string[] = this.state.SelectedItems?.map(i => Utilities.GetStringKey(i)).filter(i => !!i) ?? [];
            if (!keys || keys.length == 0)
                return this.PlaceholderElem;
            const joined: string = keys.join(', ');
            return this.ConstructTitleFromString(joined);
        }

        //For standard single-selection, use the item template for the selected item w/o the ItemContainerStyle applied
        if (this.state.SelectedItem)
            return this.GetTemplateForItem(this.state.SelectedItem)(this.state.SelectedItem);
        return this.PlaceholderElem;
    }

    private get PlaceholderElem(): JSX.Element | undefined
    {
        if (this.state.PlaceholderText)
            return this.ConstructTitleFromString(this.state.PlaceholderText)
    }

    //Format string as title-friendly element that looks consistent w/ DefaultItemTemplate (meaning whitespace on left)
    private ConstructTitleFromString(text?: string): JSX.Element | undefined
    {
        if (!text)
            return undefined;
        const elem: JSX.Element = (
            <TextBlock
                Text={text}
                Margin="0px 6px"
            />
        );
        return elem;
    }
}

class ComboBoxItem<P extends ISelectableItemControlProps = {}, S extends ISelectableItemControlState = {}>
    extends SelectableItemControlBase<P, S>
{
    private static ROOT_CLASS: string = 'option-wrapper';
    private static SELECTED_CLASS: string = 'selected';
    private static DISABLED_CLASS: string = 'disabled';
    private static theme = getTheme();

    public static DefaultBindings = {
        IsSelected: {
            Mode: BindingMode.TwoWay
        },
        IsEnabled: {
            Mode: BindingMode.TwoWay
        }
    };

    private get Parent(): ComboBox2<IComboBoxProps2, IComboBoxState2>
    {
        return this.state.Parent as ComboBox2<IComboBoxProps2, IComboBoxState2>;
    }
    private get RenderAutoCheckbox(): boolean
    {
        return this.Parent.IsMultiSelect && !this.Parent.state.PreventAutoCheckboxes;
    }

    public static DefaultStyle: Style<IComboBoxProps2> = new Style<IComboBoxProps2>(
        {
            SelectionMode: SelectionMode.Single,
            ItemsSource: [],
            Template: new ControlTemplate((templatedParent: ComboBoxItem) => templatedParent.Template)
        },
        {
            Selector: `.${ComboBoxItem.ROOT_CLASS}:not(.${ComboBoxItem.DISABLED_CLASS})`,
            Rules:
            {
                cursor: 'pointer'
            },
        },
        {
            Selector: `.${ComboBoxItem.ROOT_CLASS}:hover:not(.${ComboBoxItem.DISABLED_CLASS})`,
            Rules: {
                backgroundColor: ComboBoxItem.theme.semanticColors.listItemBackgroundHovered
            }
        },
        {
            Selector: `.${ComboBoxItem.ROOT_CLASS}.${ComboBoxItem.SELECTED_CLASS}:not(.${ComboBoxItem.DISABLED_CLASS})`,
            Rules: {
                //backgroundColor: ComboBoxItem.theme.palette.neutralQuaternaryAlt
                backgroundColor: ComboBoxItem.theme.palette.themeLighter
            }
        },
        {
            Selector: `.${ComboBoxItem.ROOT_CLASS}.${ComboBoxItem.DISABLED_CLASS}`,
            Rules: {
                color: ComboBoxItem.theme.semanticColors.disabledBodyText
            }
        },
    );

    private get Template(): JSX.Element
    {
        const contentElem: JSX.Element = this.Parent.GetTemplateForItem(this.state.Item)(this.state.Item);

        var checkboxElem: JSX.Element | undefined;
        const colDefs: IColumnDefinition[] = [Grid.ColumnDefinition(1, true)];

        if (this.RenderAutoCheckbox)
        {
            colDefs.unshift(Grid.ColumnDefinition());
            checkboxElem = (
                <CheckBox
                    IsChecked={this.state.IsSelected}
                    OnClick={(event) => this.OnCheckboxClicked(event)}
                    VerticalAlignment={VerticalAlignment.Center}
                    Margin="0 0 0 4px"
                    IsEnabled={this.props.IsEnabled}
                />
            );
        }

        const combinedElem: JSX.Element = (
            <Grid
                ClassName={this.ConstructGridClasses}
                ColumnDefinitions={colDefs}
            >
                {checkboxElem}
                {contentElem}
            </Grid>
        );
        return combinedElem;
    }

    private OnCheckboxClicked(event: MouseEvent): void
    {
        //this.Parent.SelectItemAtIndex(this.state.ItemIndex);

        event.preventDefault();
    }

    private get ConstructGridClasses(): string
    {
        var classNames: string = ComboBoxItem.ROOT_CLASS;
        if (this.state.IsEnabled == false)
            classNames += ` ${ComboBoxItem.DISABLED_CLASS}`;
        if (this.state.IsSelected)
            classNames += ` ${ComboBoxItem.SELECTED_CLASS}`;
        return classNames;
    }
}

//Wrapper for Fluent's Dropdown control as a FrameworkElement (for compatibility w/ Popup's Target prop)
//Only used to render the root element UI; everything of consequence is handled manually in the main/parent control
export interface FluentDropdownProps extends IControlProps { Content?: DataTemplate }
export interface FluentDropdownState extends IControlState { Content?: DataTemplate }
class FluentDropdown<P extends FluentDropdownProps = {}, S extends FluentDropdownState = {}> extends Control<P, S>
{
    public static DefaultStyle: Style<FluentDropdownProps> = new Style<FluentDropdownProps>(
        {
            Template: new ControlTemplate((templatedParent: FluentDropdown) => templatedParent.Template),
        }
    );

    private get Template(): JSX.Element
    {
        const titleStyle: IStyle = {
            height: 'unset',
            paddingLeft: 0
        };

        //Will display dummy option's text w/o content, which apparently requres non-whitespace chars to have a height
        if (!this.state.Content)
            titleStyle.color = 'transparent !important';    //!important to prevent :hover overriding

        const elem: JSX.Element = (
            <Dropdown
                options={[FluentDropdown.DummyOption]}
                selectedKey={FluentDropdown.DummyOption.key}
                onRenderTitle={this.TitleRenderer}
                onRenderList={() => null}
                disabled={this.state.IsEnabled == false}
                styles={
                    { title: titleStyle }
                }
            />
        );
        return elem;
    }

    private get TitleRenderer(): (() => JSX.Element) | undefined
    {
        if (this.state.Content)
            return () => this.state.Content?.GetVisualTree()(this) ?? <></>;
    }

    //Placeholder option for fluent control, to yield a non-null selection necessary for onRenderTitle() to fire
    private static DummyOption: IDropdownOption = { key: 0, text: '.' };
}
