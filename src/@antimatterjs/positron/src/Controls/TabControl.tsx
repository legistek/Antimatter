import * as React from 'react';
import { Antimatter, Binding, BindingParameters, ModelObjectReference, PropertyChangedEventArgs, Utilities } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { DefaultEffects, MarqueeSelection, MotionAnimations } from '@fluentui/react';
import { TemplateProp, WebStyle } from '../Style';
import { Grid } from './Grid';
import { ItemsControl } from './ItemsControl';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { Glyph } from './Glyph';
import { HorizontalAlignment, Orientation, ScrollBarVisibility, VerticalAlignment, WindowLayout } from '../Enums';
import { IStackPanelProps, StackPanel, StackPanelBase } from './StackPanel';
import { TextBlock } from './TextBlock';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { CommandButton } from './CommandButton';
import { Theme, ThemeColor, SemanticColor, FontStyle, ThemeEffect, ThemeLayout } from '../Theme';

import { CSSClasses } from '../CSSClasses';
import '../ResizeObserver.js';
import { IFrameworkElementState } from '../FrameworkElement';
import { template } from '@babel/core';

const VerticalTabsClassName: string = "vertical-tabs";
const AnimatedTabsClassName: string = "animate-tabs";   //Only relevant if vertical (H's handle differently)

export interface ITabItem
{
    Label: string | BindingParameters,
    //Key: string | BindingParameters,
    Key: string,
    Content: JSX.Element,
    Icon?: number | string | BindingParameters,
    Padding?: string,
    IconBackground?: string,
    IconForeground?: string,
    Description?: string,
    IsEnabled?: boolean | BindingParameters,
    IsVisible?: boolean | BindingParameters,
    IsSelected?: boolean,
    IsDefault?: boolean,
}
export interface ITabControlCommon
{
    Items: ITabItem[],
    MinTabWidth?: number,
}
export interface ITabControlProps extends IControlProps, ITabControlCommon
{
    AllCapsLabels?: boolean,
    Animate?: boolean,
    SelectedItem?: string | Binding,
    SelectedIndex?: number | Binding,
    Orientation?: Orientation,
    RenderHidden?: boolean,
    HideTabs?: boolean,
    TabLabelTemplate?: (control: TabControlBase, tab: ITabItem, mobile: boolean) => JSX.Element,
}


export interface ITabControlState extends IControlState, ITabControlCommon
{
    SelectedItem?: string,
    SelectedIndex?: number,
}

export class TabControlBase<
    P extends ITabControlProps = { Items: [] },
    S extends ITabControlState = { Items: [] }> extends Control<P, S>
{
    private static TabPanelStyle: WebStyle<IStackPanelProps> = new WebStyle<IStackPanelProps>(
        {
            Orientation: Orientation.Horizontal,
            HorizontalScrollBarVisibility: ScrollBarVisibility.Auto,
            ItemSpacing: 0,
            ClassName: "tab-panel",
        },
        {
            "@": {
                justifyContent: "space-around",
                scrollbarColor: "transparent",
                scrollbarWidth: "none",
            },
            "@::-webkit-scrollbar": {
                width: 0,
                height: 0
            }
        });

    private static readonly W100PanelStyle = new WebStyle<IPanelProps>({
        //MinWidth: templatedParent.state.MinTabWidth,
        Width: "100%"
    });

    public static DefaultStyle: WebStyle<ITabControlProps> = new WebStyle<ITabControlProps>(
        {
            MinTabWidth: 100,
            Padding: "5px",
            AllCapsLabels: true,
            BorderBrush: "transparent",
            BorderThickness: "0px",
            Animate: true,
            Template: new ControlTemplate((templatedParent: TabControlBase) =>
            {
                if (templatedParent.IsVertical)
                    return templatedParent.VerticalTemplate;

                return (
                    <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}
                        Background={TemplateProp(nameof<ITabControlProps>(p => p.Background))}>
                        <Grid
                            BorderThickness="0px 0px 1px 0px"
                            BorderBrush={SemanticColor.BodyFrameDivider}
                            ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}>
                            <CommandButton
                                ref={r => { templatedParent._scrollLeftButton = r; } }
                                Padding="7px"
                                Margin="0px 0px 2px 0px"
                                Command={(p) => templatedParent.OnScrollButtonClick(false)}
                                VerticalAlignment={VerticalAlignment.Center}
                                Style={CommandButton.IconButtonStyle}
                                Grid={{ Column: 0 }}
                                Icon="ChevronLeft"
                                IsEnabled={new Binding({
                                    Source: templatedParent,
                                    Path: nameof(templatedParent.IsLeftTabPanelScrollEnabled)
                                })}
                                IsVisible={new Binding({
                                    Source: templatedParent,
                                    Path: nameof(templatedParent.TabPanelOverflows)
                                })}
                            />
                            <ItemsControl
                                ClassName={new Binding({
                                    Source: templatedParent,
                                    Path: nameof(templatedParent.TabPanelOverflows),
                                    Converter: (overflows: boolean) =>
                                        overflows ? "tab-panel-overflows" : ""
                                })}
                                Grid={{ Column: 1 }}
                                ref={ic => { templatedParent._tabList = ic; } }
                                ItemsPanel={StackPanel}
                                ItemsPanelStyle={TabControlBase.TabPanelStyle}
                                ItemContainerStyle={TabControl.W100PanelStyle}
                                ItemTemplate={(tab: ITabItem) =>
                                {
                                    if (templatedParent.TabLabelTemplate)
                                        return templatedParent.TabLabelTemplate(templatedParent, tab, false);
                                    else
                                        return templatedParent.RenderTabLabel(tab, false);
                                }}
                                ItemsSource={templatedParent.GetVisibleTabs()} />
                            <CommandButton
                                ref={r => { templatedParent._scrollRightButton = r; } }
                                VerticalAlignment={VerticalAlignment.Center}
                                Padding="7px"
                                Margin="0px 0px 2px 0px"
                                Command={(p) => templatedParent.OnScrollButtonClick(true)}
                                Style={CommandButton.IconButtonStyle}
                                Grid={{ Column: 2 }}
                                Icon="ChevronRight"
                                IsEnabled={new Binding({
                                    Source: templatedParent,
                                    Path: nameof(templatedParent.IsRightTabPanelScrollEnabled)
                                })}
                                IsVisible={new Binding({
                                    Source: templatedParent,
                                    Path: nameof(templatedParent.TabPanelOverflows)
                                })} />
                        </Grid>
                        <TabContentPanel
                            Animate={templatedParent.Animate}
                            RenderHidden={templatedParent.RenderHidden}
                            TabControlParent={templatedParent}
                            Grid={{ Row: 1 }}
                            TabItem={templatedParent.GetActualSelectedTab(false)} />

                    </Grid>
                );
            }),
            FontSize: FontStyle.Small,
            Items: []
        },
        {
            "@": {
                borderColor: TemplateProp(nameof<ITabControlProps>(p => p.BorderBrush)),
                borderWidth: TemplateProp(nameof<ITabControlProps>(p => p.BorderThickness)),
                borderStyle: "solid",
            },
            "@ .tab-menu-item": {
                color: Theme.Value(SemanticColor.BodySubtext),
                fontFamily: Theme.Value(FontStyle.FontFamily),
                borderWidth: "0px 0px 2px 0px",
                borderColor: "transparent",
                //padding: "10px 45px 10px 10px",
                background: TemplateProp(nameof<ITabControlProps>(p => p.Background)),
                //margin: "0px 5px",
                maxWidth: "unset !important"
            },
            "@ .tab-menu-item:not(.disabled):not(.selected):hover": {
                cursor: "pointer",
                background: Theme.Value(ThemeColor.NeutralLighter)
            },
            "@ .tab-content": {
                animation: "unset"
            },
            "@ .tab-menu-item.selected": {
                color: Theme.Value(SemanticColor.BodyText),
                borderColor: Theme.Value(SemanticColor.PrimaryButtonBackgroundPressed),
                borderWidth: "0px 0px 2px 0px",
                borderStyle: "solid"
            },
            "@ .tab-panel-overflows .tab-panel": {
                justifyContent: "unset"
            },
            [`@.${VerticalTabsClassName} .tab-menu-item`]: {
                borderWidth: "0px 0px 0px 4px",
                padding: "10px 15px 10px 10px",
                margin: "0 0 5px 0"
            },
            [`@.${VerticalTabsClassName} .tab-menu-item.selected`]: {
                borderColor: Theme.Value(SemanticColor.Link),
                borderWidth: "0px 0px 0px 4px",
            },
            [`@.${VerticalTabsClassName} .tab-menu-item:not(.mobile)`]: {
                maxWidth: "250px"
            },
            [`@.${VerticalTabsClassName}.${AnimatedTabsClassName} .tab-content:not(.no-animate)`]: {
                animation: `${MotionAnimations.scaleDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            },
            [`@.${VerticalTabsClassName}.${AnimatedTabsClassName} .menu-content`]: {
                animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            }
        }

    );

    private static SimplifiedBottomTabStackPanelStyle = new WebStyle<IStackPanelProps>(
        {
            Orientation: Orientation.Horizontal,
            ItemSpacing: 0,
            BoxShadow: ThemeEffect.CardShadow,
            Margin: ThemeLayout.MarginStandardLRB,
            HorizontalAlignment: HorizontalAlignment.Left
        },
        {
        },
        StackPanel.DefaultStyle);

    public static SimplifiedBottomTabStyle: WebStyle<ITabControlProps> = new WebStyle<ITabControlProps>(
        {
            RenderHidden: true,
            Background: SemanticColor.BodyBackground,
            Template: (templatedParent: TabControlBase) =>
            {
                return (
                    <Grid                        
                        RowDefinitions={[Grid.RowDefinition(1, true), Grid.RowDefinition()]}>
                        <TabContentPanel
                            BorderRadius={templatedParent.BorderRadius}
                            Margin={
                                templatedParent.HideTabs
                                    ? ThemeLayout.MarginStandardLTRB
                                    : ThemeLayout.MarginStandardLTR
                            }
                            BoxShadow={ThemeEffect.CardShadow}
                            Padding={templatedParent.Padding}
                            Background={templatedParent.Background}
                            Grid={{ Row: 0 }}
                            TabItem={templatedParent.GetActualSelectedTab(false)}
                            TabControlParent={templatedParent}
                            Animate={false}
                            RenderHidden={true} />
                        {
                            !templatedParent.HideTabs &&

                            <ItemsControl
                                Grid={{ Row: 1 }}
                                ref={ic => { templatedParent._tabList = ic; } }
                                ItemTemplate={(tab: ITabItem) =>
                                {
                                    if (!templatedParent.GetTabIsVisible(tab))
                                        return (<></>);
                                    var selectedTab = templatedParent.GetActualSelectedTab(false);
                                    var isCurrent = tab === selectedTab;
                                    return (
                                        <StackPanel
                                            //BoxShadow={ThemeEffect.CardShadow}
                                            //Margin={"0px 1px 7px 0px"}
                                            BorderThickness={ThemeLayout.StandardBorderRB}
                                            BorderBrush={ThemeColor.NeutralTertiaryTranslucent}
                                            Orientation={Orientation.Horizontal}
                                            OnClick={(e) =>
                                            {
                                                templatedParent.OnTabItemClick(tab);
                                            }}
                                            Padding={ThemeLayout.MarginStandardLTRB}
                                            Cursor="pointer"
                                            Background={isCurrent ? ThemeColor.White : ThemeColor.NeutralLight}>
                                            {tab.Icon &&
                                                (<Glyph
                                                    Margin="0px 5px 0px 0px"
                                                    Icon={(typeof tab.Icon === 'number' || typeof tab.Icon === 'string' ? tab.Icon : new Binding(tab.Icon))}
                                                    VerticalAlignment={VerticalAlignment.Center}
                                                    Foreground={"#808080"}
                                                    FontSize={"16px"} />)}
                                            <TextBlock Text={templatedParent.GetTabLabel(tab)} />
                                        </StackPanel>
                                    );
                                }}
                                ItemsSource={templatedParent.state.Items}
                                VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                                ItemsPanelStyle={TabControl.SimplifiedBottomTabStackPanelStyle}
                            />
                        }

                    </Grid>
                );
            },
            Items: []
        },
        {
        },
        TabControlBase.DefaultStyle);

    private get VerticalTemplate(): JSX.Element
    {
        return (
            <Grid
                ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}
            >
                {
                    !this.HideTabs &&
                    <ItemsControl Grid={{ Column: 0 }}
                        Margin="5px 20px 5px 0px"
                        ref={ic => { this._tabList = ic; } }
                        ItemTemplate={(tab: ITabItem) =>
                        {
                            if (!this.GetTabIsVisible(tab))
                                return (<></>);
                            if (this.TabLabelTemplate)
                                return this.TabLabelTemplate(this as any, tab, false);
                            else
                                return this.RenderTabLabel(tab, false);
                        }}
                        ItemsSource={this.state.Items}
                        VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                        ItemsPanelStyle={StackPanel.UnspacedStyle}
                    />
                }

                <TabContentPanel Grid={{ Column: 1 }}
                    TabControlParent={this}
                    RenderHidden={this.RenderHidden}
                    TabItem={this.GetActualSelectedTab(false)}
                />

            </Grid>
        );
    }

    public get HideTabs(): boolean
    {
        return this.GetValue(nameof(this.props.HideTabs), false);
    }

    public get TabLabelTemplate(): ((control: TabControlBase, tab: ITabItem, mobile: boolean) => JSX.Element)|undefined
    {
        return this.GetValue(nameof(this.props.TabLabelTemplate), undefined);
    }

    public get RenderHidden(): boolean
    {
        return this.GetValue(nameof(this.props.RenderHidden), false);
    }

    public get Items(): ITabItem[]
    {
        return this.GetValue(nameof(this.props.Items));
    }

    public get AllCapsLabels(): boolean
    {
        return this.GetValue(nameof(this.props.AllCapsLabels));
    }

    public get Animate(): boolean
    {
        return this.GetValue(nameof(this.props.Animate), false);
    }

    private get IsVertical(): boolean
    {
        return this.props.Orientation == Orientation.Vertical;
    }

    // #region TabPanelOverflows Property
    private _tabPanelOverflows: boolean = false;
    public get TabPanelOverflows(): boolean
    {
        return this._tabPanelOverflows;
    }
    public set TabPanelOverflows(value: boolean)
    {
        if (this._tabPanelOverflows === value)
            return;
        this._tabPanelOverflows = value;
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.TabPanelOverflows)));
    }
    // #endregion

    // #region IsLeftTabPanelScrollEnabled Property
    private _isLeftTabPanelScrollEnabled: boolean = false;
    public get IsLeftTabPanelScrollEnabled(): boolean
    {
        return this._isLeftTabPanelScrollEnabled;
    }
    public set IsLeftTabPanelScrollEnabled(value: boolean)
    {
        if (this._isLeftTabPanelScrollEnabled === value)
            return;
        this._isLeftTabPanelScrollEnabled = value;
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.IsLeftTabPanelScrollEnabled)));
    }
    // #endregion

    // #region IsRightTabPanelScrollEnabled Property
    private _isRightTabPanelScrollEnabled: boolean = false;
    public get IsRightTabPanelScrollEnabled(): boolean
    {
        return this._isRightTabPanelScrollEnabled;
    }
    public set IsRightTabPanelScrollEnabled(value: boolean)
    {
        if (this._isRightTabPanelScrollEnabled === value)
            return;
        this._isRightTabPanelScrollEnabled = value;
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.IsRightTabPanelScrollEnabled)));
    }
    // #endregion

    protected /* virtual */ RenderTabLabel(tab: ITabItem, mobile: boolean): JSX.Element
    {
        if (this.IsVertical)
            return this.RenderVerticalTabLabel(tab, mobile);

        const isEnabled: boolean = this.GetTabIsEnabled(tab);

        return (
            <Panel
                ClassName={this.ConstructTabItemClassList(tab, false)}
                OnClick={(e) => this.OnTabItemClick(tab)}
                Padding="0px 5px">
                <StackPanel
                    HorizontalAlignment={HorizontalAlignment.Center}
                    Orientation={Orientation.Horizontal}>
                    {tab.Icon &&
                        (<Glyph
                            Margin="0px 5px 0px 0px"
                            Icon={(typeof tab.Icon === 'number' || typeof tab.Icon === 'string' ? tab.Icon : new Binding(tab.Icon))}
                            VerticalAlignment={VerticalAlignment.Center}
                            Foreground={mobile ? tab.IconForeground : "#808080"}
                            FontSize={"16px"} />)}

                    <StackPanel Grid={{ Column: 1 }}
                        Orientation={Orientation.Vertical}
                        VerticalAlignment={VerticalAlignment.Center}>
                        <TextBlock Text={this.AllCapsLabels ? this.GetTabLabel(tab)?.toUpperCase() : this.GetTabLabel(tab)}
                            ClassName="tab-label"
                            Margin="12px 0px 12px 0px"
                            FontSize={this.FontSize}
                            FontWeight="bold"
                            Foreground={isEnabled ? SemanticColor.BodyText : SemanticColor.DisabledText}
                        />

                        {tab.Description && (<TextBlock
                            Text={tab.Description}
                            FontSize={(this.FontSize as number) * 0.50} />)}
                    </StackPanel>
                </StackPanel>
            </Panel>);
    }

    protected RenderVerticalTabLabel(tab: ITabItem, mobile: boolean): JSX.Element
    {

        const isEnabled: boolean = this.GetTabIsEnabled(tab);

        return (
            <Grid
                ClassName={this.ConstructTabItemClassList(tab, mobile)}
                ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}
                OnClick={(e) => this.OnTabItemClick(tab)}
            >

                <CommandButton Grid={{ Column: 0 }}
                    Icon={(typeof tab.Icon === 'number' || typeof tab.Icon === 'string' ? tab.Icon : new Binding(tab.Icon))}
                    IsVisible={tab.Icon != null}
                    Style={CommandButton.CircleButtonStyle}
                    Foreground={mobile ? tab.IconForeground : SemanticColor.ButtonTextDisabled}
                    Background={mobile ? tab.IconBackground : undefined}
                    FontSize={this.FontSize}
                    Margin="0"
                />

                <StackPanel Grid={{ Column: 1 }}
                    Orientation={Orientation.Vertical}
                    VerticalAlignment={VerticalAlignment.Center}
                >
                    <TextBlock Text={this.GetTabLabel(tab)}
                        ClassName="tab-label"
                        Margin="0"
                        FontSize={this.FontSize}
                        FontWeight="bold"
                        Foreground={isEnabled ? SemanticColor.BodyText : SemanticColor.DisabledText}
                    />

                    {tab.Description && (
                        <TextBlock
                            Text={tab.Description}
                            MaxLines={mobile ? "99" : "2"}
                            FontSize={FontStyle.Small}
                        />
                    )}
                </StackPanel>
            </Grid>);
    }

    protected /* override */ OnElementUpdated(oldProps: P)
    {
        this.CheckTabPanelOverflow();
    }

    public override OnComponentMount()
    {
        var elem = this._tabList?.ItemsPanelInstance?.Container;
        if (!elem)
            return;
        this._tabListObserver = new ResizeObserver((entries) =>
        {
            this.CheckTabPanelOverflow();
        });
        elem.onscroll = (e) => this.CheckTabPanelOverflow();
        this._tabListObserver.observe(elem);
        this.CheckTabPanelOverflow();
    }

    protected /* override */ OnComponentWillUnmount()
    {
        if (this._tabListObserver)
            this._tabListObserver.disconnect();
    }

    private GetVisibleTabs(): ITabItem[]
    {
        let tabs: ITabItem[] = [];
        for (let tab of this.Items)
        {
            if (this.GetTabIsVisible(tab))
                tabs.push(tab);
        }
        return tabs;
    }

    private OnScrollButtonClick(right: boolean = false)
    {
        var elem = this._tabList?.ItemsPanelInstance?.Container;
        if (!elem)
            return;
        var amt = 0.75 * elem.clientWidth;

        elem.scrollBy({
            left: right ? amt : -amt,
            behavior: "smooth"
        });
    }

    private CheckTabPanelOverflow(): void
    {
        if (this.IsVertical)
            return;

        var elem = this._tabList?.ItemsPanelInstance?.Container;
        if (!elem)
            return;

        var desiredWidth = elem.scrollWidth -
            (this._scrollLeftButton?.ActualWidth || 0) -
            (this._scrollRightButton?.ActualWidth || 0);

        this.TabPanelOverflows = desiredWidth > elem.clientWidth;
        this.IsLeftTabPanelScrollEnabled = elem.scrollLeft > 0;
        this.IsRightTabPanelScrollEnabled = elem.scrollLeft + elem.clientWidth < elem.scrollWidth;
    }

    // Handle model-side changes
    public override OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        this._tabList?.InvalidateRender();
        let tab: ITabItem | undefined = undefined;
        switch (property)
        {
            case nameof(this.state.SelectedItem):
                tab = this.state.Items?.find(i => i.Key === value);
                if (!tab)
                    // Invalid key
                    return;
                this.SetSelectedTab(tab, false);
                var index = this.state.Items?.indexOf(tab) || 0;
                Antimatter.UpdateModelValue(
                    this,
                    nameof(this.state.SelectedIndex),
                    index,
                    false);
                break;
            case nameof(this.state.SelectedIndex):
                var index = value as number;
                if (index > (this.state.Items?.length || 0))
                    // Invalid index
                    return;
                tab = this.state.Items[index];
                this.SetSelectedTab(tab, false);
                Antimatter.UpdateModelValue(
                    this,
                    nameof(this.state.SelectedItem),
                    tab.Key,
                    false);
                break;
        }
        super.OnBoundPropertyUpdate(property, value, oldValue);
    }

    protected SetSelectedTab(tab: ITabItem, notify: boolean)
    {
        var oldIndex = this.state.SelectedIndex || 0;
        var newIndex = this.state.Items?.indexOf(tab) || 0;
        this._selectedTab = tab;
        this._tabList?.InvalidateRender();
        this.InvalidateRender();
        if (notify)
        {
            // Notify two-way binding sources
            Antimatter.UpdateModelValue(this, nameof(this.state.SelectedItem), tab.Key, false);
            Antimatter.UpdateModelValue(
                this,
                nameof(this.state.SelectedIndex),
                newIndex,
                false);
        }
    }

    public GetActualSelectedTab(mobile: boolean): ITabItem | undefined
    {
        return this._selectedTab || this.state.Items?.find(t => this.GetTabIsEnabled(t) && this.GetTabIsVisible(t));
    }

    public GetTabLabel(item: ITabItem): string
    {
        if (typeof (item.Label) == 'string')
            return item.Label;

        return this.BindState(item.Label as BindingParameters, item.Key + "_label");
    }

    protected GetTabIsVisible(item: ITabItem)
    {
        if (item.IsVisible === undefined)
            return true;

        if (typeof (item.IsVisible) == 'boolean')
            return item.IsVisible;

        return this.BindState(item.IsVisible as BindingParameters, item.Key + "_visible");
    }

    public GetTabIsEnabled(item: ITabItem)
    {
        if (item.IsEnabled === undefined)
            return true;

        if (typeof (item.IsEnabled) == 'boolean')
            return item.IsEnabled;

        return this.BindState(item.IsEnabled as BindingParameters, item.Key + "_enabled");
    }

    public ConstructTabItemClassList(item: ITabItem, mobile: boolean)
    {
        let classes: string = "tab-menu-item ";
        if (mobile)
            classes += "mobile ";
        if (!this.GetTabIsEnabled(item))
            classes += "disabled ";
        if (!mobile && this.GetActualSelectedTab(mobile)?.Key === item?.Key)
            classes += "selected ";
        return classes;
    }

    public /* virtual */ OnTabItemClick(item: ITabItem): void
    {
        if (this.GetTabIsEnabled(item))
            this.SetSelectedTab(item, true);
    }

    protected _tabList?: ItemsControl | null;
    protected _selectedTab?: ITabItem;
    protected _tabListObserver?: ResizeObserver;

    private _scrollLeftButton: CommandButton | null = null;
    private _scrollRightButton: CommandButton | null = null;

    /* override */ constructClasses()
    {
        var variableClasses: string = "";
        if (this.IsVertical)
            variableClasses += ` ${VerticalTabsClassName}`;
        if (this.Animate)
            variableClasses += ` ${AnimatedTabsClassName}`;
        return super.constructClasses() + variableClasses;
    }
}

export class TabControl extends TabControlBase<ITabControlProps, ITabControlState>
{
}

interface ITabContentPanelProps extends IPanelProps
{
    TabItem?: ITabItem;
    TabControlParent?: TabControl;
    Animate?: boolean;

    /** Not compatible with Animate */
    RenderHidden?: boolean;
}
interface ITabContentPanelState extends IFrameworkElementState
{
    TabItem?: ITabItem;
    TabControlParent?: TabControl;
}
export class TabContentPanel extends PanelBase<ITabContentPanelProps, ITabContentPanelState>
{
    private _lastIndex?: number;
    private _renderCount: number = 0;

    public get Animate(): boolean
    {
        return this.GetValue(nameof(this.props.Animate), false);
    }

    public get RenderHidden(): boolean
    {
        return this.GetValue(nameof(this.props.RenderHidden), false);
    }

    public static DefaultStyle: WebStyle<ITabContentPanelProps> = new WebStyle<ITabContentPanelProps>(
        {
            VerticalScrollBarVisibility: ScrollBarVisibility.Auto
        },
        {
            "@ .entering-from-left": {
                animation: `${CSSClasses.SlideInFromLeft} 0.4s ease 0s 1 normal`,
                animationFillMode: "forwards"
            },
            "@ .entering-from-right": {
                animation: `${CSSClasses.SlideInFromRight} 0.4s ease 0s 1 normal`,
                animationFillMode: "forwards"
            },
            "@ .exiting-left": {
                animation: `${CSSClasses.SlideOutLeft} 0.4s ease 0s 1 normal`,
                animationFillMode: "forwards"
            },
            "@ .exiting-right": {
                animation: `${CSSClasses.SlideOutRight} 0.4s ease 0s 1 normal`,
                animationFillMode: "forwards"
            }
        }
    );

    public get TabItem(): ITabItem | undefined
    {
        return this.GetValue(nameof(this.props.TabItem));
    }

    public get TabControlParent(): TabControl | undefined
    {
        return this.GetValue(nameof(this.props.TabControlParent));
    }

    /* override */ renderElement(): JSX.Element | null
    {
        var currentIndex = this.TabControlParent
            ?.Items
            ?.findIndex(item => item.Key === this.TabItem?.Key);
        if (currentIndex === undefined || currentIndex == -1)
            return null; // should be impossible

        var currentTab = this.TabControlParent?.Items[currentIndex];
        if (!currentTab)
            return null; // again, should be impossible but TS doesn't believe us

        let render: JSX.Element;

        if (this.Animate && this._lastIndex !== undefined && this._lastIndex != currentIndex)
        {
            var forwards = currentIndex > this._lastIndex;

            var priorTab = this.state.TabControlParent?.Items[this._lastIndex];
            if (!priorTab)
                return null; // should be impossible

            // animate
            render = (<>
                <Panel
                    VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                    key={`tabcontent_${priorTab.Key}`}
                    Overlaps={true}
                    ClassName={forwards ? "exiting-left" : "exiting-right"}
                    Padding={this.state.TabItem?.Padding || this.state.TabControlParent?.Padding}>
                    {priorTab.Content}
                </Panel>
                <Panel
                    //key={`tab${this._renderCount}entering`}
                    VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                    key={`tabcontent_${currentTab.Key}`}
                    ClassName={forwards ? "entering-from-right" : "entering-from-left"}
                    Padding={this.state.TabItem?.Padding || this.state.TabControlParent?.Padding}>
                    {currentTab.Content}
                </Panel>
            </>);
            Utilities.SleepAsync(450).then(_ =>
            {
                this.InvalidateRender();
            });
        }
        else if (this.RenderHidden)
        {
            if (!this.TabControlParent?.Items)
                return (<></>);
            let panels: JSX.Element[] = [];
            for (var item of this.TabControlParent?.Items)
            {
                var isItemTop = currentTab === item;
                var panel = (
                    <Panel
                        key={`tabcontent_${item.Key}`}
                        ZIndex={isItemTop ? 10 : 0}
                        Overlaps={true}
                        IsHitTestVisible={isItemTop}
                        Opacity={isItemTop ? 1 : 0}>
                        {item.Content}
                    </Panel>
                );
                panels.push(panel);
            }
            render = (<>{panels}</>);
        }
        else
        {
            render = (
                <Panel
                    key={`tabcontent_${currentTab.Key}`}
                    VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                    Padding={this.state.TabItem?.Padding || this.state.TabControlParent?.Padding}>
                    {this.state.TabControlParent?.state?.Items[currentIndex]?.Content}
                </Panel>);
        }
        this._lastIndex = currentIndex;
        //this._renderCount++;
        return render;
    }

    /* override */ constructClasses()
    {
        return super.constructClasses() + " tab-content" +
            (!this.Animate ? " no-animate" : "");
    }
}