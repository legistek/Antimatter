import * as React from 'react';
import { Binding, BindingMode, DataContext, ModelObjectReference, PropertyChangedEventArgs, RelativeSourceMode, Utilities } from '@antimatterjs/react';
import { HorizontalAlignment, Orientation, ScrollBarVisibility, SelectionMode, VerticalAlignment } from '../Enums';
import { FrameworkElement, IFrameworkElementState } from '../FrameworkElement';
import { ControlTemplate, DataTemplate, FrameworkTemplate } from '../FrameworkTemplate';
import { Style, TemplateProp, WebStyle } from '../Style';
import { CheckBox } from './CheckBox';
import { Glyph } from './Glyph';
import { Grid, IColumnDefinition } from './Grid';
import { Panel } from './Panel';
import { PlacementMode, Popup } from './Popup';
import { StackPanel } from './StackPanel';
import { ITextBlockProps, TextBlock } from './TextBlock';
import { ISelectableItemControlProps, SelectableItemControlBase, ISelectableItemControlState }
    from './Primitives/SelectableItemControl';
import { EmptyISelectorState, ISelectorProps, Selector, SelectorBase } from './Primitives/Selector';
import { FontStyle, ThemeColor, SemanticColor, Theme, ThemeLayout, ThemeEffect } from '../Theme';
import { Control } from './Control';
import { TextBox } from './TextBox';
import { ICollectionUpdate } from '@antimatterjs/react/src/ICollectionUpdate';
import { ItemsStackPanel } from './ItemsStackPanel';

export interface IComboBoxProps extends ISelectorProps
{
    Label?: string | Binding,
    LabelIsInline?: boolean | Binding,
    CloseOnSelect?: boolean | Binding,
    LabelWidth?: number | string,
    IsEditable?: boolean | Binding,
    MinWidth?: string,
    Width?: string,
    MaxDropdownHeight?: string | Binding,
    TitleOverride?: DataTemplate | string | Binding,
    PreventAutoCheckboxes?: boolean | Binding,
    PlaceholderText?: string | Binding,
    MinPopupWidth?: number | string,
    IsDropdownGlyphVisible?: boolean | Binding,
    PopupBackground?: string | Binding | ThemeColor | SemanticColor | ThemeEffect,
    ShowFilter?: boolean | Binding,
    FilterText?: string | Binding,
    SubmitCommand?: ModelObjectReference | Binding | ((commandParameter: any) => void),
}


export class ComboBoxBase<P extends IComboBoxProps = {}, S extends IFrameworkElementState = EmptyISelectorState>
    extends SelectorBase<P, S>
{
    public static DefaultBindings = Object.assign({
        FilterText: {
            Mode: BindingMode.TwoWay
        }
    }, SelectorBase.DefaultBindings);

    public get ShowFilter(): boolean
    {
        return this.GetValue(nameof(this.props.ShowFilter), false);
    }

    public get FilterText(): string|undefined
    {
        return this.GetValue(nameof(this.props.FilterText));
    }
    public set FilterText(value: string | undefined)
    {
        this.SetValue(nameof(this.props.FilterText), value, false);
    }

    public get IsDropdownGlyphVisible(): boolean
    {
        return this.GetValue(nameof(this.props.IsDropdownGlyphVisible), true);
    }

    public get TitleOverride(): DataTemplate | string
    {
        return this.GetValue(nameof(this.props.TitleOverride));
    }

    public get PopupBackground(): string | undefined
    {
        return this.GetValue(nameof(this.props.PopupBackground));
    }

    public get MinPopupWidth(): number
    {
        return this.GetValue(nameof(this.props.MinPopupWidth), 0);
    }

    public get Label(): string
    {
        return this.GetValue(nameof(this.props.Label));
    }

    public get CloseOnSelect(): boolean
    {
        return this.GetValue(nameof(this.props.CloseOnSelect));
    }

    public get LabelIsInline(): string | undefined
    {
        return this.GetValue(nameof(this.props.LabelIsInline));
    }
    public get LabelWidth(): string | undefined
    {
        return this.GetValue(nameof(this.props.LabelWidth));
    }

    public get Width(): string | undefined
    {
        return this.GetValue(nameof(this.props.Width));
    }
    public get MinWidth(): string | undefined
    {
        return this.GetValue(nameof(this.props.MinWidth));
    }

    public get IsEditable(): boolean
    {
        return this.GetValue(nameof(this.props.IsEditable), false);
    }

    public get PreventAutoCheckboxes(): boolean
    {
        return this.GetValue(nameof(this.props.PreventAutoCheckboxes), false);
    }

    public get PlaceholderText(): string
    {
        return this.GetValue(nameof(this.props.PlaceholderText));
    }

    public get MaxDropdownHeight(): string
    {
        return this.GetValue(nameof(this.props.MaxDropdownHeight));
    }

    private _popupWidth: number = 0;
    public get PopupWidth(): number
    {
        return this._popupWidth;
    }
    public set PopupWidth(value: number)
    {
        this._popupWidth = value;
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.PopupWidth)));
    }

    private _popupIsOpen: boolean = false;
    public get PopupIsOpen(): boolean
    {
        return this._popupIsOpen;
    }
    public set PopupIsOpen(value: boolean)
    {
        this._popupIsOpen = value;
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.PopupIsOpen)));
        if (value)
            this.OnOpen();
    }

    public get SubmitCommand(): ModelObjectReference | ((commandParameter: any) => void) | undefined
    {
        return this.GetValue(nameof(this.props.SubmitCommand));
    }

    protected /* virtual */ OnOpen(): void
    {
    }

    public static DefaultStyle: WebStyle<IComboBoxProps> = new WebStyle<IComboBoxProps>(
        {
            SelectionMode: SelectionMode.Single,
            ItemsSource: [],
            BoxShadow: ThemeEffect.ControlInnerShadow,
            //MinWidth: "150px",
            ItemPadding: "5px",
            PlaceholderText: '',
            FontSize: FontStyle.Medium,
            FontFamily: FontStyle.FontFamily,
            Padding: ThemeLayout.MarginStandardLTRB,
            ScrollAnchor: new Binding({
                RelativeSourceMode: RelativeSourceMode.Self,
                Source: nameof<IComboBoxProps>(p => p.SelectedItem)
            }),
            MaxDropdownHeight: "400px",
            CloseOnSelect: true,
            BorderBrush: SemanticColor.InputBorder,
            BorderThickness: ThemeLayout.StandardBorder,
            Background: SemanticColor.BodyBackground,
            PopupBackground: SemanticColor.MenuBackground,
            VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
            Template: new ControlTemplate((templatedParent: ComboBox) =>
                <>
                    <Grid
                        Width={templatedParent.Width}
                        ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}
                        RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                        {
                            templatedParent.Label &&
                            (<TextBlock
                                ClassName="cb-label"
                                FontWeight="bold"
                                Foreground={TemplateProp(nameof<IComboBoxProps>(p => p.Foreground))}
                                Grid={templatedParent.LabelIsInline ? { Column: 0, Row: 1 } : { Column: 1, Row: 0 }}
                                Text={templatedParent.Label}
                                VerticalAlignment={VerticalAlignment.Center}
                                Margin={ThemeLayout.MarginStandardR}
                                MinWidth={templatedParent.LabelWidth}
                            />)
                        }
                        <Grid
                            ClassName="panel"
                            Background={TemplateProp(nameof<IComboBoxProps>(p => p.Background))}
                            TabIndex={0}
                            ref={r => { templatedParent._button = r; } }
                            Grid={{ Row: 1, Column: 1 }}
                            ItemSpacing="0px"
                            ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}
                            OnClick={() => templatedParent.TogglePopup()}
                            OnDblClick={(e) =>
                            {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            OnKeyDown={(event) => templatedParent.OnKeyDown(event)}>
                            {
                                templatedParent.IsEditable
                                    ? <TextBox
                                        ref={r =>
                                        {
                                            r?.PropertyChanged.subscribe((sender, e) =>
                                            {
                                                if (e.propertyName === nameof(r.props.Text))
                                                    templatedParent.SetValue(nameof(templatedParent.SelectedItem), r.Text, false);
                                            });
                                        }}
                                        MinWidth={templatedParent.MinWidth}
                                        OnClick={e => e.stopPropagation()}
                                        SubmitCommand={templatedParent.SubmitCommand}
                                        BorderThickness={"0px"}
                                        Padding={"0px"}
                                        Margin={"0px"}
                                        Background="transparent"
                                        FocusBrush="transparent"
                                        BoxShadow={"0px"}
                                        Text={templatedParent.SelectedItem}
                                    />
                                    : templatedParent.TitleElem ||
                                    (
                                        <span className="cb-placeholder">
                                            {templatedParent.PlaceholderText ||
                                                <>&nbsp;</> //Force parent control to have consistent height, even if empty
                                            }
                                        </span>
                                    )
                            }
                            {
                                templatedParent.IsInvalid &&
                                (<Glyph
                                    Grid={{ Column: 1 }}
                                    Style={Glyph.ControlValidationErrorStyle}
                                    ToolTip={templatedParent.ValidationError} />)
                            }

                            {
                                templatedParent.IsDropdownGlyphVisible &&
                                <Glyph
                                    Grid={{ Column: 2 }}
                                    Icon="ScrollUpDown"
                                    Margin="0px 0px 0px 5px"
                                    Foreground={ThemeColor.NeutralSecondary}
                                    VerticalAlignment={VerticalAlignment.Center} />
                            }
                        </Grid>

                        {templatedParent.InfoTip && (
                            <Glyph
                                IsEnabled={true}
                                Style={Glyph.ControlInfoTipStyle}
                                Grid={{ Row: 1, Column: 2 }}
                                ClassName={CheckBox.PART_InfoTip}
                                ToolTip={templatedParent.InfoTip} />)}

                    </Grid>
                    <Popup
                        IsOpen={new Binding({
                            Source: templatedParent,
                            Path: nameof(templatedParent.PopupIsOpen),
                            Mode: BindingMode.TwoWay
                        })}
                        OnOpened={() =>
                            templatedParent.OnPopupOpened()
                        }
                        MinWidth={templatedParent.PopupWidth}
                        Background={templatedParent.PopupBackground}
                        Placement={PlacementMode.Below}
                        Target={() => templatedParent._button}
                        MaxHeight={400}
                        Padding="0">
                        {
                            templatedParent.PopupContents()
                        }
                    </Popup>
                </>),
            ItemTemplate: (item: any) => ComboBox.DefaultItemTemplate(item)
        },
        {
            "@ .panel": {
                cursor: 'pointer',
                userSelect: 'none',
                boxShadow: TemplateProp(nameof<IComboBoxProps>(p => p.BoxShadow)),
                borderRadius: TemplateProp(nameof<IComboBoxProps>(p => p.BorderRadius)),
                padding: TemplateProp(nameof<IComboBoxProps>(p => p.Padding)),
                minWidth: TemplateProp(nameof<IComboBoxProps>(p => p.MinWidth)),
                background: TemplateProp(nameof<IComboBoxProps>(p => p.Background)),
                borderWidth: TemplateProp(nameof<IComboBoxProps>(p => p.BorderThickness)),
                borderColor: TemplateProp(nameof<IComboBoxProps>(p => p.BorderBrush)),
            },
            "@ .panel:hover": {
                borderColor: Theme.Value(SemanticColor.InputBorderHovered)
            },
            "@ .panel:focus": {
                outline: "none",
                borderColor: Theme.Value(SemanticColor.FocusBorder),
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
                borderWidth: TemplateProp(nameof<IComboBoxProps>(p => p.BorderThickness)),
                borderStyle: "solid",
                borderColor: Theme.Value(SemanticColor.FocusBorder),
            },
            "@ .cb-label": {
                fontFamily: Theme.Value(FontStyle.FontFamily),
                cursor: 'default'
            },
            [`@ .${CheckBox.PART_InfoTip}`]: {
                cursor: "pointer"
            },
            "@ .cb-placeholder": {
                alignSelf: "center",
                fontFamily: TemplateProp(nameof<IComboBoxProps>(p => p.FontFamily)),
                fontSize: TemplateProp(nameof<IComboBoxProps>(p => p.FontSize)),
                color: Theme.Value(SemanticColor.DisabledBodyText) + " !important"
            },
            [Control.DisabledElement("cb-label")]: {
                color: `${Theme.Value(SemanticColor.DisabledBodyText)} !important`
            },
            [Control.DisabledElement("panel")]: {
                background: Theme.Value(SemanticColor.DisabledBackground) + " !important"
            },
            [Control.DisabledElement("panel *")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText)
            },
            [`@.${Control.STATE_ValidationError} .panel`]: {
                background: Theme.Value(SemanticColor.ErrorBackground),
                borderColor: Theme.Value(SemanticColor.Error),
            },
            [`@.${Control.STATE_ValidationError} .panel:focus::after`]: {
                borderColor: Theme.Value(SemanticColor.Error),
            }
        }
    );

    static TransparentStyle: Style<IComboBoxProps> = new WebStyle<IComboBoxProps>(
        {
            Background: "transparent",
            BorderThickness: "0px",
            Padding: "0px",
            BoxShadow: "none"
        },
        {
        },
        this.DefaultStyle);

    static NarrowStyle: Style<IComboBoxProps> = new WebStyle<IComboBoxProps>(
        {
            Padding: ThemeLayout.MarginSmallLTRB,
            VerticalAlignment: VerticalAlignment.Center
        },
        {},
        this.DefaultStyle
    );

    private PopupContents(): JSX.Element
    {
        var list = this.ItemsSource.length > 50
            ? <ItemsStackPanel
                Grid={this.ShowFilter ? { Row: 1 } : undefined}
                RealizationDelay={0}
                MinHeight={30}
                VerticalScrollBarVisibility={this.VerticalScrollBarVisibility}
                ItemsParent={this} />
            : <StackPanel
                Grid={this.ShowFilter ? { Row: 1 } : undefined}
                MinHeight={30}
                VerticalScrollBarVisibility={this.VerticalScrollBarVisibility}
                ItemsParent={this} >
            </StackPanel>;

        if (this.ShowFilter)
        {
            return <Grid RowDefinitions={[Grid.Row_Auto, Grid.Row_Star]}>
                <TextBox
                    Margin={ThemeLayout.MarginSmall}
                    Icon={"filter"}
                    Text={new Binding({
                        Source: this,
                        Path: nameof(this.FilterText),
                    })} />
                {list}
            </Grid>
        }
        else
        {
            return list;
        }
    }

    protected override OnSelectedItemsCollectionChanged(sender: any, e: ICollectionUpdate)
    {
        this.ItemsPanelInstance?.InvalidateRender();
        this.InvalidateRender();

        //super.OnSelectedItemsCollectionChanged(sender, e);
    }

    override OnElementRendered()
    {
        if (this._button)
            this.PopupWidth = Math.max(this.MinPopupWidth, this._button.ActualWidth);
    }

    public override GetContainerForItemOverride()
    {
        return ComboBoxItem;
    }

    public static DefaultTextblockStyle: WebStyle<ITextBlockProps> = new WebStyle<ITextBlockProps>(
        {
            FontFamily: FontStyle.FontFamily,
            FontSize: FontStyle.Medium,
            VerticalAlignment: VerticalAlignment.Center
        },
        {
            "@": {
                userSelect: 'none'
            }
        },
        TextBlock.DefaultStyle
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

    protected override OnSelectionChanged()
    {
        if (!this.IsMultiSelect && this.CloseOnSelect)
            this.PopupIsOpen = false;
        super.OnSelectionChanged();
    }

    protected TogglePopup(): void
    {
        if (!this.IsEnabled)
            return;
        this.PopupIsOpen = !this.PopupIsOpen;
    }

    private async OnKeyDown(event: KeyboardEvent)
    {
        if (event.key === "Enter" || event.key === " ")
            this.TogglePopup();
        else if (event.key === "ArrowUp")
            this.SelectNext(true);
        else if (event.key === "ArrowDown")
            this.SelectNext();
        else
            return;

        event.preventDefault();
    }

    private async OnPopupOpened() //: void
    {
        await Utilities.SleepAsync(50);
        this.FocusSelected(true);
    }

    private get TitleElem(): JSX.Element | undefined | null
    {
        if (this.TitleOverride)
        {
            if (typeof this.TitleOverride == 'string')
                return this.ConstructTitleFromString(this.TitleOverride);
            else
                return FrameworkTemplate.GetRenderer(this.TitleOverride, this.Layout)(this.SelectedItem);
        }

        if (this.IsMultiSelect)
        {
            const keys: string[] = this.SelectedItems.map(i => Utilities.GetStringKey(i)).filter(i => !!i) ?? [];
            if (!keys || keys.length == 0)
                return this.PlaceholderElem;
            const joined: string = keys.join(', ');
            return this.ConstructTitleFromString(joined);
        }

        // For standard single-selection, use the item template
        // for the selected item w / o the ItemContainerStyle applied
        if (this.SelectedItem)
        {
            var templ = this.GetTemplateForItem(this.SelectedItem);
            if (this.ItemAsDataContext)
                return (<DataContext Value={this.SelectedItem}>{templ(this.SelectedItem)}</DataContext>);
            else
                return templ(this.SelectedItem);
        }

        return undefined;
    }

    private get PlaceholderElem(): JSX.Element | undefined
    {
        if (this.PlaceholderText)
            return this.ConstructTitleFromString(this.PlaceholderText, true)
    }

    //Format string as title-friendly element that looks consistent (whitespace-wise) w/ DefaultItemTemplate
    private ConstructTitleFromString(text?: string, isPlaceholder?: boolean): JSX.Element | undefined
    {
        if (!text)
            return undefined;
        const elem: JSX.Element = (
            <TextBlock ClassName={isPlaceholder ? "cb-placeholder" : ''}
                Text={text}
                Style={ComboBox.DefaultTextblockStyle}
            />
        );
        return elem;
    }

    private _button?: FrameworkElement | null;
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

    private get RenderAutoCheckbox(): boolean
    {
        return this.Parent?.IsMultiSelect === true &&
            (this.Parent as ComboBox).PreventAutoCheckboxes === false;
    }

    public static DefaultStyle: WebStyle<ISelectableItemControlProps> = new WebStyle<ISelectableItemControlProps>(
        {
            //SelectionMode: SelectionMode.Single,
            // ItemsSource: [],
            Template: new ControlTemplate((templatedParent: ComboBoxItem) => templatedParent.template)
        },
        {
            "@": {
                marginTop: "0px !important",
                marginBottom: "0px !important",
                padding: TemplateProp(nameof<ISelectableItemControlProps>(p => p.Padding)),
                background: TemplateProp(nameof<ISelectableItemControlProps>(p => p.Background)),
            },
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
        SelectableItemControlBase.DefaultStyle
    );

    private get template(): JSX.Element
    {
        const contentElem = this.Parent?.GetTemplateForItem(this.state.Item)(this.state.Item);

        var checkboxElem: JSX.Element | undefined;
        const colDefs: IColumnDefinition[] = [Grid.ColumnDefinition(1, true)];

        if (this.RenderAutoCheckbox)
        {
            colDefs.unshift(Grid.ColumnDefinition());
            checkboxElem = (
                <CheckBox
                    Grid={{ Column: 0 }}
                    OnClick={(event) => this.OnCheckboxClicked(event.nativeEvent)}
                    VerticalAlignment={VerticalAlignment.Center}
                    Margin="0 4px 0 4px"
                    IsEnabled={this.props.IsEnabled}
                    PreventBlurOnClick={true}
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

        return contentElem || (<></>);
    }


    private OnCheckboxClicked(event: MouseEvent): void
    {
        //this.Parent.SelectItemAtIndex(this.state.ItemIndex);
        //this.Parent?.OnItemClick(event, this.state.Item);
        //this.Parent?.ToggleMultiItemSelection(this.state.ItemIndex ?? -1);

        event.preventDefault();
        event.stopPropagation();
    }

    private get ConstructGridClasses(): string
    {
        var classNames: string = ComboBoxItem.ROOT_CLASS;
        if (!this.IsEnabled)
            classNames += ` ${ComboBoxItem.DISABLED_CLASS}`;
        if (this.IsSelected)
            classNames += ` ${ComboBoxItem.SELECTED_CLASS}`;
        return classNames;
    }

    override getCSSStyles()
    {
        var styles = super.getCSSStyles();
        styles.padding = this.Padding || this.Parent?.ItemPadding;
        return styles;
    }

    /* override */ constructClasses(): string
    {
        return super.constructClasses() + this.ConstructGridClasses;
    }
}

export class ComboBox extends ComboBoxBase<IComboBoxProps, IFrameworkElementState>
{
}