import * as React from 'react';
import { Binding, BindingParameters, ModelObjectReference } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import
    {
        INavLinkGroup, INavLink,
        DefaultEffects,
        Nav, Icon, MotionAnimations, Pivot, PivotItem, Fabric, getTheme, themeRulesStandardCreator, Stack
    } from '@fluentui/react';
import { Style } from '../Style';
import { Grid } from './Grid';
import { ItemsControl } from './ItemsControl';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { Ellipse } from '../Shapes/Ellipse';
import { Glyph } from './Glyph';
import { TeachingBubble } from './TeachingBubble';
import { HorizontalAlignment, Orientation, VerticalAlignment } from '../Enums';
import { StackPanel } from './StackPanel';
import { TextBlock } from './TextBlock';
import { Panel } from './Panel';
import { CommandButton } from './CommandButton';


export interface ITabItem
{
    Label: string,
    Route?: string,
    Key?: string,
    Content: JSX.Element,
    Icon?: number,
    IconBackground?: string,
    IconForeground?: string,
    Description?: string,
    IsEnabled?: boolean | BindingParameters,
    IsVisible?: boolean | BindingParameters,
    IsSelected?: boolean
}
export interface ITabControlCommon
{
    Tabs: ITabItem[]
}
export interface ITabControlProps extends IControlProps, ITabControlCommon
{
}
export interface ITabControlState extends IControlState, ITabControlCommon
{
}

export class TabControl<
    P extends ITabControlProps = { Tabs: [] },
    S extends ITabControlState = { Tabs: [] }> extends Control<P, S>
{
    static theme = getTheme();
    _groups: INavLinkGroup[] = [];
    _tabList?: ItemsControl | null;
    _selectedTab?: ITabItem;

    public static VerticalMobileStyle: Style<ITabControlProps> = new Style<ITabControlProps>(
        {
            Template: new ControlTemplate(TabControl.VerticalMobileTemplate),
            Tabs: [],
            FontSize: TabControl.theme.fonts.large.fontSize as number
        },
        {
            Selector: "@",
            Rules: {
                
            }
        },
        {
            Selector: "@ .menu-content",
            Rules:
            {
                animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            }
        },
        {
            Selector: "@ .tab-content",
            Rules:
            {
                animation: `${MotionAnimations.scaleDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            }
        },
        {
            Selector: "@ .tab-item",
            Rules: {
                cursor: "pointer"
            }
        },
        {
            Selector: "@ .tab-item:hover",
            Rules: {
                background: TabControl.theme.palette.neutralLight
            }
        },
        {
            Selector: "@ .mobile-tab-back",
            Rules: {                
                cursor: "pointer"
            }
        }

    );

    private RenderTabLabel(tab: ITabItem, mobile: boolean): JSX.Element
    {
        return (
            <Grid
                ClassName={this.ConstructTabItemClassList(tab)}
                ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}
                OnClick={(e) => this.OnTabItemClick(tab)}
                Margin={mobile ? undefined : "0px 0px 0px 15px"}
                Padding="5px 0px">

                <CommandButton
                    Style={CommandButton.CircleButtonStyle}
                    Margin="0px 15px"
                    Background={mobile ? tab.IconBackground : undefined}
                    Icon={tab.Icon}
                    Foreground={mobile ? tab.IconForeground : "#808080"}
                    FontSize={TabControl.theme.fonts.xLarge.fontSize as number} />

                <StackPanel Grid={{ Column: 1 }}
                    Orientation={Orientation.Vertical}
                    VerticalAlignment={VerticalAlignment.Center}>
                    <TextBlock Text={tab.Label}
                        ClassName="tab-label"
                        Margin="0"
                        FontSize={this.state.FontSize}
                        FontWeight="bold" />

                    {tab.Description && (<TextBlock
                        ClassName="tab-description"
                        Text={tab.Description}
                        FontSize={(this.state.FontSize as number) * 0.50} />)}
                </StackPanel>
            </Grid>);
    }

    private static VerticalMobileTemplate(templatedParent: TabControl<ITabControlProps, ITabControlState>): JSX.Element
    {
        if (!templatedParent._selectedTab)
        {
            // Menu page            
            return (
                <ItemsControl
                    ref={ic => templatedParent._tabList = ic}
                    ClassName="menu-content"
                    ItemsSource={templatedParent.state.Tabs}
                    ItemTemplate={new DataTemplate((tab: ITabItem) =>
                    {
                        if (!templatedParent.GetTabIsVisible(tab))
                            return (<></>);
                        return templatedParent.RenderTabLabel(tab, true);                           
                    })}/>
            );
        }
        else
        {
            return (
                <Grid
                    RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}
                    ClassName="tab-content">
                    <Panel
                        Grid={{Row: 0}}
                        BoxShadow={DefaultEffects.elevation8}
                        Margin="0px 0px 10px 0px">
                        <StackPanel                            
                            Grid={{ Row: 0 }} Orientation={Orientation.Horizontal}>
                            <Glyph
                                ClassName="mobile-tab-back"
                                Foreground="black"
                                Margin="10px 10px"
                                FontSize={TabControl.theme.fonts.xLarge.fontSize}
                                VerticalAlignment={VerticalAlignment.Center}
                                OnClick={(e) => templatedParent.MobileGoBack()}
                                Icon="Back" />
                            <TextBlock Text={templatedParent._selectedTab.Label}
                                FontWeight="bold"
                                VerticalAlignment={VerticalAlignment.Center}
                                FontSize={TabControl.theme.fonts.xLarge.fontSize}/>
                        </StackPanel>
                    </Panel>
                    <TabPanel
                        Grid={{Row: 1}}
                        TabItem={templatedParent._selectedTab} />
                </Grid>);
        }
    }

    public static DefaultStyle: Style<ITabControlProps> = new Style<ITabControlProps>(
        {
            Template: new ControlTemplate((templatedParent: TabControl<ITabControlProps, ITabControlState>) =>
            {
                return (
                    <Grid ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}>
                        <ItemsControl ref={ic => templatedParent._tabList = ic}
                            ItemTemplate={new DataTemplate((tab: ITabItem) =>
                            {
                                if (!templatedParent.GetTabIsVisible(tab))
                                    return (<></>);
                                return templatedParent.RenderTabLabel(tab, false);
                            })}
                            ItemsSource={templatedParent.state.Tabs} />

                        <TabPanel
                            ClassName="tab-content"
                            TabItem={templatedParent._selectedTab} />

                    </Grid>);
            }),
            FontSize: TabControl.theme.fonts.large.fontSize as number,
            Tabs: []
        },
        {
            Selector: "@ .tab-item",
            Rules: {
                color: TabControl.theme.semanticColors.bodySubtext,
                fontFamily: TabControl.theme.fonts.medium.fontFamily,
                borderWidth: "0px 0px 0px 3px",
                borderColor: "transparent",
                padding: "10px 45px 10px 10px",
                background: "transparent",
                cursor: "pointer",
                margin: "0px 0px 0px 10px"
            }
        },
        {
            Selector: "@ .tab-label",
            Rules: {
                fontWeight: "bold"
            }
        },
        {
            Selector: "@ .tab-item:hover",
            Rules: {
                background: TabControl.theme.palette.neutralLight
            },
        },
        {
            Selector: "@ .tab-item.selected",
            Rules: {
                color: TabControl.theme.semanticColors.bodyText,
                borderColor: TabControl.theme.semanticColors.link,
                borderWidth: "0px 0px 0px 3px",
                borderStyle: "solid"
            }
        },
        {
            Selector: "@ .tab-content",
            Rules: {
                animation: `${MotionAnimations.scaleDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            }
        }
    );

    constructor(props)
    {
        super(props);        
    }

    ConstructTabItemClassList(item: ITabItem)
    {
        let classes: string = "tab-item ";
        if (!this.GetTabIsEnabled(item))
            classes += "disabled ";
        if (this._selectedTab == item)
            classes += "selected ";
        return classes;
    }

    OnTabItemClick(item: ITabItem): void
    {
        this._selectedTab = item;
        this.InvalidateRender();
        this._tabList?.InvalidateRender();
    }

    GetTabIsVisible(item: ITabItem)
    {
        if (item.IsVisible === undefined)
            return true;

        if (typeof (item.IsVisible) == 'boolean')
            return item.IsVisible;

        return this.BindState(item.IsVisible as BindingParameters, item.Key + "_visible");
    }

    GetTabIsEnabled(item: ITabItem)
    {
        if (item.IsEnabled === undefined)
            return true;

        if (typeof (item.IsEnabled) == 'boolean')
            return item.IsEnabled;

        return this.BindState(item.IsEnabled as BindingParameters, item.Key + "_enabled");
    }

    private MobileGoBack()
    {
        this._selectedTab = undefined;
        this.InvalidateRender();
    }
}

interface ITabPanelProps extends IFrameworkElementProps
{
    TabItem?: ITabItem,
}

interface ITabPanelState extends IFrameworkElementState
{
    TabItem?: ITabItem,
}

class TabPanel extends FrameworkElement<ITabPanelProps, ITabPanelState>
{
    static _renderKey: number = 0;
    /* override */ renderElement(): JSX.Element | null
    {
        return (
            <Panel Padding="10px"                
                key={this.state.TabItem?.Key}>            
                {this.state.TabItem?.Content}
            </Panel>
        );
    }
}