import * as React from 'react';
import { Antimatter, Binding, BindingParameters, ModelObjectReference, PropertyChangedEventArgs, Utilities } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { DefaultEffects, MotionAnimations } from '@fluentui/react';
import { WebStyle } from '../Style';
import { Grid } from './Grid';
import { ItemsControl } from './ItemsControl';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { Glyph } from './Glyph';
import { HorizontalAlignment, Orientation, ScrollBarVisibility, VerticalAlignment, WindowLayout } from '../Enums';
import { IStackPanelProps, StackPanel } from './StackPanel';
import { TextBlock } from './TextBlock';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { CommandButton } from './CommandButton';
import { Theme, ThemeColor, SemanticColor, FontStyle } from '../Theme';

import { CSSClasses } from '../CSSClasses';
import '../ResizeObserver.js';

export interface ITabItem
{
    Label: string,
    Key: string,
    Content: JSX.Element,
    Icon?: number | string,
    Padding?: string,
    IconBackground?: string,
    IconForeground?: string,
    Description?: string,
    IsEnabled?: boolean | BindingParameters,
    IsVisible?: boolean | BindingParameters,
    IsSelected?: boolean
}
export interface ITabControlCommon
{
    Items: ITabItem[],
    MinTabWidth?: number,
}
export interface ITabControlProps extends IControlProps, ITabControlCommon
{
    SelectedItem?: string | Binding,
    SelectedIndex?: number | Binding,
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
            ClassName: "tab-panel",            
        },
        {
            "@": {
                justifyContent: "space-around"
            },
            "@::-webkit-scrollbar": {
                width: 0,
                height: 0
            }
        });

    public static DefaultStyle: WebStyle<ITabControlProps> = new WebStyle<ITabControlProps>(
        {
            MinTabWidth: 100,
            Padding: "5px",
            Template: new ControlTemplate((templatedParent: TabControl) =>
            {
                return (
                    <Grid RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                        <Grid
                            BorderThickness="0px 0px 1px 0px"
                            BorderBrush={SemanticColor.BodyFrameDivider}
                            ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}

                        >
                            <CommandButton
                                ref={r => templatedParent._scrollLeftButton = r}
                                Padding="0px"
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
                                ref={ic => templatedParent._tabList = ic}
                                ItemsPanel={StackPanel}
                                ItemsPanelStyle={TabControlBase.TabPanelStyle}
                                ItemContainerStyle={new WebStyle<IPanelProps>({
                                    MinWidth: templatedParent.state.MinTabWidth,
                                    Width: "100%"
                                })}
                                ItemTemplate={new DataTemplate((tab: ITabItem) =>
                                {
                                    if (!templatedParent.GetTabIsVisible(tab))
                                        return (<></>);
                                    return templatedParent.RenderTabLabel(tab, false);
                                })}
                                ItemsSource={templatedParent.state.Items} />
                            <CommandButton
                                ref={r => templatedParent._scrollRightButton = r}
                                VerticalAlignment={VerticalAlignment.Center}
                                Padding="0px"
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
                            Animate={true}
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
            "@ .tab-menu-item": {                
                color: Theme.Value(SemanticColor.BodySubtext),
                fontFamily: Theme.Value(FontStyle.FontFamily),
                borderWidth: "0px 0px 2px 0px",
                borderColor: "transparent",
                //padding: "10px 45px 10px 10px",
                background: "transparent",
                cursor: "pointer",
                margin: "0px 5px"
            },
            "@ .tab-menu-item:hover": {
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
            }
        }

    );

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
        

        return (
            <Panel
                ClassName={this.ConstructTabItemClassList(tab, mobile)}
                OnClick={(e) => this.OnTabItemClick(tab)}
                Padding="0px">
                <StackPanel
                    HorizontalAlignment={HorizontalAlignment.Center}
                    Orientation={Orientation.Horizontal}>
                    {tab.Icon &&
                        (<Glyph                            
                            Margin="0px 5px 0px 0px"
                            Icon={tab.Icon}
                            VerticalAlignment={VerticalAlignment.Center}
                            Foreground={mobile ? tab.IconForeground : "#808080"}
                            FontSize={"16px"} />)}

                    <StackPanel Grid={{ Column: 1 }}
                        Orientation={Orientation.Vertical}
                        VerticalAlignment={VerticalAlignment.Center}>
                        <TextBlock Text={tab.Label}
                            ClassName="tab-label"
                            Margin="12px 0px 12px 0px"
                            FontSize={this.FontSize}
                            FontWeight="bold" />

                        {tab.Description && (<TextBlock
                            Text={tab.Description}
                            FontSize={(this.FontSize as number) * 0.50} />)}
                    </StackPanel>
                </StackPanel>
            </Panel>);
    }

    protected /* override */ OnElementUpdated(oldProps: P)
    {
        this.CheckTabPanelOverflow();
    }

    protected /* override */ OnComponentMount()
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
    public /* virtual */ OnPropertyChanged(property: string, value: any, oldValue: any)
    {
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
                Antimatter.TargetChanged(
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
                Antimatter.TargetChanged(
                    this,
                    nameof(this.state.SelectedItem),
                    tab.Key,
                    false);
                break;
        }
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
            Antimatter.TargetChanged(this, nameof(this.state.SelectedItem), tab.Key, false);
            Antimatter.TargetChanged(
                this,
                nameof(this.state.SelectedIndex),
                newIndex,
                false);
        }
    }

    protected GetActualSelectedTab(mobile: boolean): ITabItem | undefined
    {
        let t: ITabItem | undefined = undefined;
        if (mobile)
            t = this._selectedTab;
        else
            t = this._selectedTab || this.state.Items?.find(t => this.GetTabIsEnabled(t) && this.GetTabIsVisible(t));
        return t;
    }

    protected GetTabIsVisible(item: ITabItem)
    {
        if (item.IsVisible === undefined)
            return true;

        if (typeof (item.IsVisible) == 'boolean')
            return item.IsVisible;

        return this.BindState(item.IsVisible as BindingParameters, item.Key + "_visible");
    }

    protected GetTabIsEnabled(item: ITabItem)
    {
        if (item.IsEnabled === undefined)
            return true;

        if (typeof (item.IsEnabled) == 'boolean')
            return item.IsEnabled;

        return this.BindState(item.IsEnabled as BindingParameters, item.Key + "_enabled");
    }

    protected ConstructTabItemClassList(item: ITabItem, mobile: boolean)
    {
        let classes: string = "tab-menu-item ";
        if (mobile)
            classes += "mobile ";
        if (!this.GetTabIsEnabled(item))
            classes += "disabled ";
        if (!mobile && this.GetActualSelectedTab(mobile) == item)
            classes += "selected ";
        return classes;
    }

    protected /* virtual */ OnTabItemClick(item: ITabItem): void
    {
        this.SetSelectedTab(item, true);
    }

    protected _tabList?: ItemsControl | null;
    protected _selectedTab?: ITabItem;
    protected _tabListObserver?: ResizeObserver;

    private _scrollLeftButton: CommandButton | null = null;
    private _scrollRightButton: CommandButton | null = null;
}

export class TabControl extends TabControlBase<ITabControlProps, ITabControlState>
{
}

interface ITabContentPanelProps extends IPanelProps
{
    TabItem?: ITabItem;
    TabControlParent?: TabControl;
    Animate?: boolean;
}
interface ITabContentPanelState extends IPanelState
{
    TabItem?: ITabItem;
    TabControlParent?: TabControl;
    Animate?: boolean;
}
export class TabContentPanel extends PanelBase<ITabContentPanelProps, ITabContentPanelState>
{    
    private _lastIndex?: number;
    private _renderCount: number = 0;

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

    /* override */ renderElement(): JSX.Element|null
    {
        var currentIndex = this.state.TabControlParent?.state?.Items?.indexOf(this.state.TabItem as ITabItem) || 0;

        var currentTab = this.state.TabControlParent?.state?.Items[currentIndex];
        if (!currentTab)
            return null; // should be impossible

        let render: JSX.Element;              

        if (this.state.Animate && this._lastIndex !== undefined && this._lastIndex != currentIndex)
        {
            var forwards = currentIndex > this._lastIndex;
            
            var priorTab = this.state.TabControlParent?.state?.Items[this._lastIndex];
            if (!priorTab)
                return null; // should be impossible

            // animate
            render = (<>
                <Panel
                    VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                    key={`tabcontent_${priorTab.Key}`}
                    ClassName={forwards ? "exiting-left" : "exiting-right"}
                    Padding={this.state.TabItem?.Padding || this.state.TabControlParent?.Padding}>
                    {priorTab.Content}
                </Panel>
                <Panel
                    //key={`tab${this._renderCount}entering`}
                    VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                    key={`tabcontent_${currentTab.Key}`}
                    ClassName={forwards ? "entering-from-right" : "entering-from-left"}
                    Padding={this.state.TabItem?.Padding || this.state.TabControlParent?.Padding}
                    Overlaps={true}>
                    {currentTab.Content}
                </Panel>
            </>);
            Utilities.SleepAsync(450).then(_ =>
            {
                this.InvalidateRender();
            });
        }
        else
        {
            render = (
                <Panel
                    key={`tabcontent_${currentTab.Key}`}
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
        return super.constructClasses() + " tab-content";
    }
}