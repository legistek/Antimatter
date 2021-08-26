import * as React from 'react';
import { Binding, BindingParameters, ModelObjectReference } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { DefaultEffects, MotionAnimations, getTheme } from '@fluentui/react';
import { Style } from '../Style';
import { Grid } from './Grid';
import { ItemsControl } from './ItemsControl';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { Glyph } from './Glyph';
import { HorizontalAlignment, Orientation, ScrollBarVisibility, VerticalAlignment, WindowLayout } from '../Enums';
import { StackPanel } from './StackPanel';
import { TextBlock } from './TextBlock';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { CommandButton } from './CommandButton';
import { Window } from './Window';

import { Route, Switch, Redirect } from 'react-router-dom';

export interface ITabItem
{
    Label: string,
    Route?: string,
    Key: string,
    Content: JSX.Element,
    Icon?: number,
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
    Tabs: ITabItem[]
}
export interface ITabControlProps extends IControlProps, ITabControlCommon
{
}
export interface ITabControlState extends IControlState, ITabControlCommon
{
}

export class TabControlBase<
    P extends ITabControlProps = { Tabs: [] },
    S extends ITabControlState = { Tabs: [] }> extends Control<P, S>
{
    static theme = getTheme();

    public static DefaultStyle: Style<ITabControlProps> = new Style<ITabControlProps>(
        {
            Template: new ControlTemplate(
                TabControlBase.VerticalDesktopTemplate,
                {
                    Layout: WindowLayout.Tablet,
                    VisualTree: TabControlBase.VerticalMobileTemplate
                }),
            Padding: "5px",
            FontSize: TabControlBase.theme.fonts.large.fontSize as number,
            Tabs: []
        },
        {
            Selector: "@ .tab-item",
            Rules: {
                color: TabControlBase.theme.semanticColors.bodySubtext,
                fontFamily: TabControlBase.theme.fonts.medium.fontFamily,
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
                background: TabControlBase.theme.palette.neutralLight
            },
        },
        {
            Selector: "@ .tab-item.selected",
            Rules: {
                color: TabControlBase.theme.semanticColors.bodyText,
                borderColor: TabControlBase.theme.semanticColors.link,
                borderWidth: "0px 0px 0px 3px",
                borderStyle: "solid"
            }
        },
        {
            Selector: "@ .menu-content",
            Rules: {
                animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            }
        },
        {
            Selector: "@ .mobile-tab-back",
            Rules: {
                cursor: "pointer"
            }
        }
    );

    private static VerticalMobileTemplate(templatedParent: TabControlBase<ITabControlProps, ITabControlState>): JSX.Element
    {
        return (<Switch>{TabControl.GetMobileTabRoutes(templatedParent)}</Switch>);
    }

    private static GetMobileTabRoutes(templatedParent: TabControlBase<ITabControlProps, ITabControlState>): JSX.Element[]
    {        
        let routes: JSX.Element[] =
            [
                (<Route exact path={templatedParent._startingRoute}>
                    <ItemsControl
                        ref={ic => templatedParent._tabList = ic}
                        ClassName="menu-content"
                        ItemsSource={templatedParent.state.Tabs}
                        ItemTemplate={new DataTemplate((tab: ITabItem) =>
                        {
                            if (!templatedParent.GetTabIsVisible(tab))
                                return (<></>);
                            return templatedParent.RenderTabLabel(tab, true);
                        })} />
                </Route>)
            ];

        var otherRoutes = templatedParent.state.Tabs.map(
            t =>
            (<Route path={Window.CombineRoute(templatedParent._startingRoute, t.Key)} key={t.Key}>
                <Grid
                    RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                    <TabContentPanel
                        Grid={{ Row: 1 }}
                        TabItem={t}
                        TabControlParent={templatedParent}/>                                            
                    <Panel
                        Grid={{ Row: 0 }}
                        BoxShadow={DefaultEffects.elevation8}
                        Padding="5px 5px">
                        <StackPanel
                            Grid={{ Row: 0 }} Orientation={Orientation.Horizontal}>
                            <Glyph
                                ClassName="mobile-tab-back"
                                Foreground="black"
                                Margin="10px 10px"
                                FontSize={TabControl.theme.fonts.xxLarge.fontSize}
                                VerticalAlignment={VerticalAlignment.Center}
                                OnClick={(e) => templatedParent.MobileBackButtonClick()}
                                Icon="ChevronLeft" />
                            <TextBlock Text={t.Label}
                                FontWeight="bold"
                                VerticalAlignment={VerticalAlignment.Center}
                                FontSize={TabControl.theme.fonts.xLarge.fontSize} />
                        </StackPanel>
                    </Panel>
                </Grid>
            </Route>));

        routes = routes.concat(otherRoutes);
        return routes;
    }

    private static VerticalDesktopTemplate(templatedParent: TabControlBase<ITabControlProps, ITabControlState>): JSX.Element
    {
        return (
            <Grid ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}>
                <ItemsControl
                    Grid={{ Column: 0 }}
                    Margin="0px 20px 0px 0px"
                    ref={ic => templatedParent._tabList = ic}
                    ItemTemplate={new DataTemplate((tab: ITabItem) =>
                    {
                        if (!templatedParent.GetTabIsVisible(tab))
                            return (<></>);
                        return templatedParent.RenderTabLabel(tab, false);
                    })}
                    ItemsSource={templatedParent.state.Tabs} />

                <Panel Grid={{ Column: 1 }}>
                    <Switch>
                        {TabControl.GetDesktopTabRoutes(templatedParent)}
                    </Switch>
                </Panel>
            </Grid>);
    }

    private static GetDesktopTabRoutes(templatedParent: TabControlBase<ITabControlProps, ITabControlState>): JSX.Element[]
    {
        var defaultTab = templatedParent.state.Tabs?.find(t => templatedParent.GetTabIsEnabled(t) && templatedParent.GetTabIsVisible(t));
        let routes: JSX.Element[] =
            [
                (<Redirect exact
                    push={true}
                    from={templatedParent._startingRoute}
                    to={Window.CombineRoute(templatedParent._startingRoute, defaultTab?.Key || "")} />)
            ];

        var otherRoutes = templatedParent.state.Tabs.map(
            t =>
            (<Route path={Window.CombineRoute(templatedParent._startingRoute, t.Key)} key={t.Key}>
                <TabContentPanel
                    TabControlParent={templatedParent}
                    TabItem={t}
                    OnDidMount={(content) => templatedParent.SetSelectedTab((content as TabContentPanel).state.TabItem)} />
            </Route>));

        routes = routes.concat(otherRoutes);
        return routes;
    }

    componentWillMount()
    {
        this._startingRoute = Window.Route;
    }    

    private SetSelectedTab(tab?: ITabItem)
    {
        this._selectedTab = tab;
        this._tabList?.InvalidateRender();
    }

    private RenderTabLabel(tab: ITabItem, mobile: boolean): JSX.Element
    {
        return (
            <Grid
                ClassName={this.ConstructTabItemClassList(tab, mobile)}
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

    private GetActualSelectedTab(mobile: boolean): ITabItem | undefined
    {
        let t: ITabItem | undefined = undefined;
        if (mobile)
            t = this._selectedTab;
        else
            t = this._selectedTab || this.state.Tabs?.find(t => this.GetTabIsEnabled(t) && this.GetTabIsVisible(t));
        return t;
    }

    private ConstructTabItemClassList(item: ITabItem, mobile: boolean)
    {
        let classes: string = "tab-item ";
        if (!this.GetTabIsEnabled(item))
            classes += "disabled ";
        if (!mobile && this.GetActualSelectedTab(mobile) == item)
            classes += "selected ";
        return classes;
    }

    private OnTabItemClick(item: ITabItem): void
    {
        this._selectedTab = item;
        Window.PushRoute(Window.CombineRoute(this._startingRoute, item.Key));
    }

    private GetTabIsVisible(item: ITabItem)
    {
        if (item.IsVisible === undefined)
            return true;

        if (typeof (item.IsVisible) == 'boolean')
            return item.IsVisible;

        return this.BindState(item.IsVisible as BindingParameters, item.Key + "_visible");
    }

    private GetTabIsEnabled(item: ITabItem)
    {
        if (item.IsEnabled === undefined)
            return true;

        if (typeof (item.IsEnabled) == 'boolean')
            return item.IsEnabled;

        return this.BindState(item.IsEnabled as BindingParameters, item.Key + "_enabled");
    }

    private MobileBackButtonClick()
    {
        Window.GoBack();
    }

    _tabList?: ItemsControl | null;
    _selectedTab?: ITabItem;
    _unlisten?: Function;
    _startingRoute: string = "/";
}

export class TabControl extends TabControlBase<ITabControlProps, ITabControlState>
{
}

interface ITabContentPanelProps extends IPanelProps
{
    TabItem?: ITabItem;
    TabControlParent?: TabControl;
}
interface ITabContentPanelState extends IPanelState
{
    TabItem?: ITabItem;
    TabControlParent?: TabControl;
}
class TabContentPanel extends PanelBase<ITabContentPanelProps, ITabContentPanelState>
{
    public static DefaultStyle: Style<ITabContentPanelProps> = new Style<ITabContentPanelProps>(
        {
            VerticalScrollBarVisibility: ScrollBarVisibility.Auto
        }
    );

    /* override */ renderElement(): JSX.Element
    {
        return this.state.TabItem?.Content || (<></>);
    }

    /* override */ constructClasses()
    {
        return super.constructClasses() + " tab-content";
    }

    /* override */ getCSSStyles()
    {
        return Object.assign(
            super.getCSSStyles(),
            {
                padding: this.state.TabItem?.Padding || this.state.TabControlParent?.state.Padding,
                animation: `${MotionAnimations.scaleDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            });
    }
}