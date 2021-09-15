import * as React from 'react';
import { Binding, BindingMode, PropertyChangedEventArgs, Utilities } from '@antimatterjs/react';
import { HorizontalAlignment, Orientation, SelectionMode, VerticalAlignment } from '../Enums';
import { FrameworkElement } from '../FrameworkElement';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { WebStyle } from '../Style';
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
import { FontStyle, ThemeColor, SemanticColor, Theme } from '../Theme';
import { Control } from './Control';

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

export class ComboBoxBase<P extends IComboBoxProps = {}, S extends IComboBoxState = EmptyISelectorState>
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

    protected _button?: FrameworkElement | null;
    public get IsMultiSelect(): boolean { return this.props.SelectionMode == SelectionMode.Multiple; }

    public static DefaultStyle: WebStyle<IComboBoxProps> = new WebStyle<IComboBoxProps>(
        {
            SelectionMode: SelectionMode.Single,
            ItemsSource: [],
            BorderBrush: SemanticColor.InputBorder,
            Template: new ControlTemplate((templatedParent: ComboBox) => templatedParent.template),
            ItemTemplate: new DataTemplate((item: any) => ComboBox.DefaultItemTemplate(item))
        },
        {
            "@ .panel": {
                cursor: 'pointer',
                userSelect: 'none'
            },
            [Control.DisabledElement("panel")]: {
                background: Theme.Value(SemanticColor.DisabledBackground) + " !important"
            },
            [Control.DisabledElement("panel > *")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText)
            },
            "@ .panel:hover": {
                borderColor: Theme.Value(SemanticColor.InputBorderHovered) + " !important"
            },
            "@ .panel:focus::after": {
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
                borderColor: Theme.Value(ThemeColor.ThemeSecondary)
            },
            "@ .cb-label": {
                fontFamily: Theme.Value(FontStyle.FontFamily),
                cursor: 'default'
            },
            [Control.DisabledElement("cb-label")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText)
            }
        }
    );

    protected get template(): JSX.Element
    {        
        const dropdown: JSX.Element = (            
            <Grid
                ClassName="panel"
                Grid={{Row: this.state.Label ? 1 : 0}}
                ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition(28, false)]}
                ref={r => this._button = r}
                OnClick={() => this.TogglePopup()}
                OnKeyPress={(event) => this.OnKeyPressed(event)}
                BorderBrush={this.BorderBrush} //Fluent equivalent: rgb(96, 96, 96) or #606060
                BorderThickness="1px"
                Padding="0"
                Background={this.Background}
                TabIndex={0}>
                {this.TitleElem}
                <Glyph
                    Grid={{Column: 1}}
                    Icon="ChevronDown"
                    Foreground={ThemeColor.NeutralSecondary}
                    HorizontalAlignment={HorizontalAlignment.Center}
                    VerticalAlignment={VerticalAlignment.Center}
                />
            </Grid>);

        const labeledDropdown: JSX.Element = (
            <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                <TextBlock
                    ClassName="cb-label"
                    Grid={{Row: 0}}
                    Text={this.state.Label}
                    FontSize={this.FontSize ?? Theme.Value(FontStyle.Medium)}
                    FontWeight={this.FontWeight ?? 600}
                    FontFamily={this.FontFamily}
                    Margin="0px"/>
                {dropdown}
            </Grid>
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

    public static DefaultTextblockStyle: WebStyle<ITextBlockProps> = new WebStyle<ITextBlockProps>(
        {
            FontFamily: FontStyle.FontFamily,
            FontSize: FontStyle.Medium,
            Margin: "7px 6px"
        },
        {
            "@": {
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

    public static DefaultBindings = {
        IsSelected: {
            Mode: BindingMode.TwoWay
        },
        IsEnabled: {
            Mode: BindingMode.TwoWay
        }
    };

    private get Parent(): ComboBoxBase<IComboBoxProps, IComboBoxState>
    {
        return this.state.Parent as ComboBoxBase<IComboBoxProps, IComboBoxState>;
    }
    private get RenderAutoCheckbox(): boolean
    {
        return this.Parent.IsMultiSelect && !this.Parent.state.PreventAutoCheckboxes;
    }

    public static DefaultStyle: WebStyle<IComboBoxProps> = new WebStyle<IComboBoxProps>(
        {
            SelectionMode: SelectionMode.Single,
            ItemsSource: [],
            Template: new ControlTemplate((templatedParent: ComboBoxItem) => templatedParent.template)
        },
        {
            [`.${ComboBoxItem.ROOT_CLASS}:not(.${ComboBoxItem.DISABLED_CLASS})`]: {
                cursor: 'pointer'
            },
            [`.${ComboBoxItem.ROOT_CLASS}:hover:not(.${ComboBoxItem.DISABLED_CLASS})`]: {
                backgroundColor: Theme.Value(SemanticColor.ListItemBackgroundHovered)
            },
            [`.${ComboBoxItem.ROOT_CLASS}.selected:not(.${ComboBoxItem.DISABLED_CLASS})`]: {
                backgroundColor: Theme.Value(ThemeColor.ThemeLighter)
            },
            [`.${ComboBoxItem.ROOT_CLASS}.${ComboBoxItem.DISABLED_CLASS}`]: {
                color: Theme.Value(SemanticColor.DisabledBodyText)
            }
        },
    );

    private get template(): JSX.Element
    {
        const contentElem: JSX.Element = this.Parent.GetTemplateForItem(this.state.Item)(this.state.Item);

        var checkboxElem: JSX.Element | undefined;
        const colDefs: IColumnDefinition[] = [Grid.ColumnDefinition(1, true)];

        if (this.RenderAutoCheckbox)
        {
            colDefs.unshift(Grid.ColumnDefinition());
            checkboxElem = (
                <CheckBox
                    Grid={{Column: 0}}
                    IsChecked={this.state.IsSelected}
                    OnClick={(event) => this.OnCheckboxClicked(event)}
                    VerticalAlignment={VerticalAlignment.Center}
                    Margin="0 0 0 4px"
                    IsEnabled={this.props.IsEnabled}
                />
            );
            return (
                <Grid
                    ClassName={this.ConstructGridClasses}
                    ColumnDefinitions={colDefs}>
                    {checkboxElem}
                    <Panel Grid={{ Column: 1 }}>
                        {contentElem}
                    </Panel>
                </Grid>
            );
        }

        return contentElem;            
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

    /* override */ constructClasses(): string
    {
        return super.constructClasses() + this.ConstructGridClasses;
    }
}

export class ComboBox extends ComboBoxBase<IComboBoxProps, IComboBoxState>
{
}