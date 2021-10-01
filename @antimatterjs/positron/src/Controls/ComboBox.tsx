import * as React from 'react';
import { Binding, BindingMode, PropertyChangedEventArgs, Utilities } from '@antimatterjs/react';
import { HorizontalAlignment, Orientation, SelectionMode, VerticalAlignment } from '../Enums';
import { FrameworkElement } from '../FrameworkElement';
import { ControlTemplate, DataTemplate, DataTemplateValue, FrameworkTemplate } from '../FrameworkTemplate';
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
import { EmptyISelectorState, ISelectorProps, ISelectorState, Selector, SelectorBase } from './Primitives/Selector';
import { FontStyle, ThemeColor, SemanticColor, Theme, ThemeLayout } from '../Theme';
import { Control } from './Control';
import { CSSClasses } from '../CSSClasses';

export interface IComboBoxProps extends ISelectorProps
{
    Label?: string | Binding,
    MinWidth?: string,
    MaxDropdownHeight?: string | Binding,
    TitleOverride?: DataTemplateValue | string | Binding,
    PreventAutoCheckboxes?: boolean | Binding,
    PlaceholderText?: string | Binding
}
export interface IComboBoxState extends ISelectorState
{
    TitleOverride?: DataTemplateValue | string,
    PreventAutoCheckboxes?: boolean,
}

export class ComboBoxBase<P extends IComboBoxProps = {}, S extends IComboBoxState = EmptyISelectorState>
    extends SelectorBase<P, S>
{
    public get Label(): string
    {
        return this.GetValue(nameof(this.props.Label));
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
    }

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

    public static DefaultStyle: WebStyle<IComboBoxProps> = new WebStyle<IComboBoxProps>(
        {
            SelectionMode: SelectionMode.Single,
            ItemsSource: [],
            MinWidth: "150px",
            ItemPadding: "5px",
            PlaceholderText: " ",
            FontSize: FontStyle.Medium,
            FontFamily: FontStyle.FontFamily,
            Padding: "5px",
            MaxDropdownHeight: "400px",
            BorderBrush: SemanticColor.InputBorder,
            BorderThickness: ThemeLayout.StandardBorder,
            Background: SemanticColor.MenuBackground,
            Template: new ControlTemplate((templatedParent: ComboBox) =>
                <>
                    <Grid
                        ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition(), Grid.ColumnDefinition()]}
                        RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                        {
                            templatedParent.Label &&
                            (<TextBlock
                                ClassName="cb-label"
                                FontWeight="bold"
                                Foreground={TemplateProp(nameof<IComboBoxProps>(p => p.Foreground))}
                                Grid={{ Row: 0 }}
                                Text={templatedParent.Label} />)
                        }
                        <Grid
                            ClassName="panel"
                            TabIndex={0}
                            ref={r => templatedParent._button = r}
                            Grid={{ Row: 1, Column: 0 }}
                            ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}
                            OnClick={() => templatedParent.TogglePopup()}
                            OnKeyDown={(event) => templatedParent.OnKeyDown(event)}>
                            {
                                templatedParent.TitleElem ||
                                templatedParent.PlaceholderText &&
                                (
                                    <span className="cb-placeholder">{templatedParent.PlaceholderText}</span>
                                )
                            }

                            {
                                templatedParent.IsInvalid &&
                                (<Glyph
                                    Style={Glyph.ControlValidationErrorStyle}
                                    ToolTip={templatedParent.ValidationError} />)
                            }

                            <Glyph
                                Grid={{ Column: 2 }}
                                Icon="ScrollUpDown"
                                Margin="0px 0px 0px 5px"
                                Foreground={ThemeColor.NeutralSecondary}
                                VerticalAlignment={VerticalAlignment.Center} />
                        </Grid>

                        {templatedParent.InfoTip && (
                            <Glyph
                                Style={Glyph.ControlInfoTipStyle}
                                Grid={{ Column: 1, Row: 1 }}
                                ClassName="cb-infotip"
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
                        Background={templatedParent.Background}
                        Placement={PlacementMode.Below}
                        Target={() => templatedParent._button}
                        MaxHeight={400}
                        Padding="0">
                        <StackPanel ItemsParent={templatedParent} />
                    </Popup>
                </>),
            ItemTemplate: (item: any) => ComboBox.DefaultItemTemplate(item)
        },
        {
            "@ .panel": {
                cursor: 'pointer',
                userSelect: 'none',
                borderRadius: Theme.Value(ThemeLayout.StandardBorderRadius),
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
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: Theme.Value(SemanticColor.FocusBorder),
            },
            "@ .cb-label": {
                fontFamily: Theme.Value(FontStyle.FontFamily),
                cursor: 'default'
            },
            "@ .cb-infotip": {
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
            [Control.DisabledElement("panel > *")]: {
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

    protected override OnSelectedItemsCollectionChanged(sender: any, e: void)
    {
        this.ItemsPanelInstance?.InvalidateRender();
        this.InvalidateRender();
        
        //super.OnSelectedItemsCollectionChanged(sender, e);
    }

    override OnElementRendered()
    {
        if (this._button)
            this.PopupWidth = this._button.ActualWidth;
    }

    public override GetContainerForItemOverride()
    {
        return ComboBoxItem;
    }

    public static DefaultTextblockStyle: WebStyle<ITextBlockProps> = new WebStyle<ITextBlockProps>(
        {
            FontFamily: FontStyle.FontFamily,
            FontSize: FontStyle.Medium,
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

    override OnSelectionChanged()
    {
        if (!this.IsMultiSelect)
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
        if (this.state.TitleOverride)
        {
            if (typeof this.state.TitleOverride == 'string')
                return this.ConstructTitleFromString(this.state.TitleOverride);
            else
                return FrameworkTemplate.GetRenderer(this.state.TitleOverride, this.Layout)(this);
        }

        if (this.IsMultiSelect)
        {
            const keys: string[] = this.state.SelectedItems?.map(i => Utilities.GetStringKey(i)).filter(i => !!i) ?? [];
            if (!keys || keys.length == 0)
                return this.PlaceholderElem;
            const joined: string = keys.join(', ');
            return this.ConstructTitleFromString(joined);
        }

        // For standard single-selection, use the item template 
        // for the selected item w / o the ItemContainerStyle applied
        if (this.SelectedItem)
            return this.GetTemplateForItem(this.SelectedItem)(this.SelectedItem);

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
            <TextBlock ClassName={isPlaceholder ? "cb-placeholder" : ''} Text={text} />
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
            (this.Parent as ComboBox).state.PreventAutoCheckboxes === false;
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
                    IsChecked={this.Parent?.IsItemSelected(this.state.Item)}
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

        return contentElem || (<></>);
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

export class ComboBox extends ComboBoxBase<IComboBoxProps, IComboBoxState>
{
}