import * as React from 'react';
import { getTheme } from '@fluentui/react';
import { Binding, BindingMode, PropertyChangedEventArgs, Utilities } from '@antimatterjs/react';
import { HorizontalAlignment, Orientation, SelectionMode, VerticalAlignment } from '../Enums';
import { FrameworkElement } from '../FrameworkElement';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { Style } from '../Style';
import { CheckBox } from './CheckBox';
import { Glyph } from './Glyph';
import { Grid, IColumnDefinition } from './Grid';
import { Panel } from './Panel';
import { Popup } from './Popup';
import { StackPanel } from './StackPanel';
import { ITextBlockProps, TextBlock } from './TextBlock';
import { ISelectableItemControlProps, SelectableItemControlBase, ISelectableItemControlState }
    from './Primitives/SelectableItemControl';
import { EmptyISelectorState, ISelectorProps, ISelectorState, Selector } from './Primitives/Selector';

export interface IComboBoxProps extends ISelectorProps
{
    Label?: string | Binding,
    TitleOverride?: DataTemplate | string | Binding,
    PreventAutoCheckboxes?: boolean | Binding,
    PlaceholderText?: string | Binding
}
export interface IComboBoxState extends ISelectorState
{
    Label?: string,
    TitleOverride?: DataTemplate | string,
    PreventAutoCheckboxes?: boolean,
    PlaceholderText?: string,
    PopupIsOpen?: boolean
}

export class ComboBox<P extends IComboBoxProps = {}, S extends IComboBoxState = EmptyISelectorState>
    extends Selector<P, S>
{
    private static DROPDOWN_MAX_HEIGHT: number = 400;
    protected static theme = getTheme();

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

    protected _button?: FrameworkElement | null;
    public get IsMultiSelect(): boolean { return this.props.SelectionMode == SelectionMode.Multiple; }

    public static DefaultStyle: Style<IComboBoxProps> = new Style<IComboBoxProps>(
        {
            SelectionMode: SelectionMode.Single,
            ItemsSource: [],            
            Template: new ControlTemplate((templatedParent: ComboBox) => templatedParent.Template),
            ItemTemplate: new DataTemplate((item: any) => ComboBox.DefaultItemTemplate(item))
        },
        {
            Selector: "@ .panel",
            Rules: {
                cursor: 'pointer',
                userSelect: 'none'
            }
        },
        {
            Selector: "@ .panel:focus::after",
            Rules: {
                content: "''",
                pointerEvents: "none",
                position: "absolute",
                boxSizing: "border-box",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                borderRadius: "0",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: ComboBox.theme.palette.themeSecondary //Fluent equivalent: rgb(46, 112, 224) or #2e70e0
            }
        }
    );

    protected get Template(): JSX.Element
    {
        //console.log(`Current neutralSecondary ${ComboBox.theme.palette.neutralSecondary}`);

        const dropdown: JSX.Element = (
            <Panel
                ref={r => this._button = r}
                OnClick={() => this.TogglePopup()}
                OnKeyPress={(event) => this.OnKeyPressed(event)}
                BorderBrush={ComboBox.theme.palette.neutralSecondary} //Fluent equivalent: rgb(96, 96, 96) or #606060
                BorderThickness="1px"
                Padding="0"
                Background={ComboBox.theme.palette.white}
                ClassName="panel"
                TabIndex={0}
            >
                <Grid ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition(28, false)]}>
                    {this.TitleElem}
                    <Glyph
                        Icon="ChevronDown"
                        Foreground={ComboBox.theme.palette.neutralSecondary}
                        HorizontalAlignment={HorizontalAlignment.Center}
                        VerticalAlignment={VerticalAlignment.Center}
                    />
                </Grid>
            </Panel>
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
                    FontSize={this.state.FontSize ?? ComboBox.theme.fonts.medium.fontSize}
                    FontWeight={this.state.FontWeight ?? 600}
                    FontFamily={this.state.FontFamily}
                    Margin="5px 0"
                    Style={labelStyle}
                />
                {dropdown}
            </StackPanel>
        );

        const root: JSX.Element = this.state.Label ? labeledDropdown : dropdown;
        const elem: JSX.Element = (
            <>
                {root}
                <Popup
                    IsOpen={new Binding({
                        Source: this,
                        Path: nameof(this.state.PopupIsOpen),
                        Mode: BindingMode.TwoWay
                    })}
                    Target={() => this._button}
                    Width={this._button?.Container?.clientWidth}
                    MaxHeight={ComboBox.DROPDOWN_MAX_HEIGHT}
                    Padding="0">
                    <StackPanel ItemsParent={this} />
                </Popup>
            </>
        );

        return elem;
    }

    public /* override */ GetContainerForItemOverride()
    {
        return ComboBoxItem;
    }



    public static DefaultTextblockStyle: Style<ITextBlockProps> = new Style<ITextBlockProps>(
        {
            FontFamily: ComboBox.theme.fonts.medium.fontFamily,
            FontSize: ComboBox.theme.fonts.medium.fontSize,
            Margin: "7px 6px"
        },
        {
            Rules: {
                userSelect: 'none'
            }
        }
    );

    protected static DefaultItemTemplate(item: any): JSX.Element
    {
        const elem: JSX.Element = (
            <TextBlock
                Text={Utilities.GetStringKey(item)}
                Style={ComboBox.DefaultTextblockStyle}
            />
        );
        return elem;
    }

    /* protected override */ OnSelectionChanged()
    {
        if (!this.IsMultiSelect)
            this.PopupIsOpen = false;
        super.OnSelectionChanged();
    }

    public get PopupIsOpen(): boolean
    {
        if (this.state.PopupIsOpen !== undefined)
            return this.state.PopupIsOpen as boolean;
        return false;
    }
    public set PopupIsOpen(value: boolean)
    {
        this.SetValue(nameof(this.state.PopupIsOpen), value, false);
        this.PropertyChanged.invoke(this, new PropertyChangedEventArgs(nameof(this.state.PopupIsOpen)));
    }    

    protected TogglePopup(): void
    {
        if (this.state.IsEnabled == false)
            return;
        this.PopupIsOpen = !this.PopupIsOpen;
    }

    private OnKeyPressed(event: KeyboardEvent): void
    {
        if (event.key != "Enter" && event.key != " ")
            return;
        this.TogglePopup();
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

    //Format string as title-friendly element that looks consistent (whitespace-wise) w/ DefaultItemTemplate
    private ConstructTitleFromString(text?: string): JSX.Element | undefined
    {
        if (!text)
            return undefined;
        const elem: JSX.Element = (
            <TextBlock
                Text={text}
                Margin="5px 6px"
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

    private get Parent(): ComboBox<IComboBoxProps, IComboBoxState>
    {
        return this.state.Parent as ComboBox<IComboBoxProps, IComboBoxState>;
    }
    private get RenderAutoCheckbox(): boolean
    {
        return this.Parent.IsMultiSelect && !this.Parent.state.PreventAutoCheckboxes;
    }

    public static DefaultStyle: Style<IComboBoxProps> = new Style<IComboBoxProps>(
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