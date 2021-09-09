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

export interface INavMenuItem
{
    Label: string,
    Route?: string,
    Key: string,
    Content: JSX.Element,
    Icon?: number|string,
    Padding?: string,
    IconBackground?: string,
    IconForeground?: string,
    Description?: string,
    IsEnabled?: boolean | BindingParameters,
    IsVisible?: boolean | BindingParameters,
    IsSelected?: boolean
}
export interface INavMenuCommon
{
    Items: INavMenuItem[]
}
export interface INavMenuProps extends IControlProps, INavMenuCommon
{
}
export interface INavMenuState extends IControlState, INavMenuCommon
{
}

export class NavMenuBase<
    P extends INavMenuProps = { Items: [] },
    S extends INavMenuState = { Items: [] }> extends Control<P, S>
{
    static theme = getTheme();

    public static DefaultStyle: Style<INavMenuProps> = new Style<INavMenuProps>(
        {
            Template: new ControlTemplate(
                NavMenuBase.VerticalDesktopTemplate,
                {
                    Layout: WindowLayout.Tablet,
                    VisualTree: NavMenuBase.VerticalMobileTemplate
                }),
            Padding: "5px",
            FontSize: NavMenuBase.theme.fonts.large.fontSize as number,
            Items: []
        },
        {
            Selector: "@ .nav-menu-item",
            Rules: {
                color: NavMenuBase.theme.semanticColors.bodySubtext,
                fontFamily: NavMenuBase.theme.fonts.medium.fontFamily,
                borderWidth: "0px 0px 0px 3px",
                borderColor: "transparent",
                padding: "10px 45px 10px 10px",
                background: "transparent",
                cursor: "pointer",
                margin: "5px 0px 5px 10px"
            }
        },
        {
            Selector: "@ .nav-label",
            Rules: {
                fontWeight: "bold"
            }
        },
        {
            Selector: "@ .nav-menu-item:hover",
            Rules: {
                background: NavMenuBase.theme.palette.neutralLight
            },
        },
        {
            Selector: "@ .nav-menu-item:not(.mobile)",
            Rules: {
                maxWidth: "250px"
            }
        },
        {
            Selector: "@ .nav-menu-item.selected",
            Rules: {
                color: NavMenuBase.theme.semanticColors.bodyText,
                borderColor: NavMenuBase.theme.semanticColors.link,
                borderWidth: "0px 0px 0px 4px",
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
            Selector: "@ .mobile-nav-back",
            Rules: {
                cursor: "pointer"
            }
        }
    );

    private static VerticalMobileTemplate(templatedParent: NavMenuBase<INavMenuProps, INavMenuState>): JSX.Element
    {
        return (<Switch>{NavMenu.GetMobileTabRoutes(templatedParent)}</Switch>);
    }

    private static GetMobileTabRoutes(templatedParent: NavMenuBase<INavMenuProps, INavMenuState>): JSX.Element[]
    {        
        let routes: JSX.Element[] =
            [
                (<Route exact path={templatedParent._startingRoute}>
                    <ItemsControl
                        ref={ic => templatedParent._tabList = ic}
                        ClassName="menu-content"
                        ItemsSource={templatedParent.state.Items}
                        ItemTemplate={new DataTemplate((tab: INavMenuItem) =>
                        {
                            if (!templatedParent.GetTabIsVisible(tab))
                                return (<></>);
                            return templatedParent.RenderTabLabel(tab, true);
                        })} />
                </Route>)
            ];

        var otherRoutes = templatedParent.state.Items.map(
            t =>
            (<Route path={Window.CombineRoute([templatedParent._startingRoute, t.Key])} key={t.Key}>
                <Grid
                    RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}>
                    <TabContentPanel
                        Grid={{ Row: 1 }}
                        TabItem={t}
                        NavMenuParent={templatedParent}/>                                            
                    <Panel
                        Grid={{ Row: 0 }}
                        BoxShadow={DefaultEffects.elevation8}
                        Padding="5px 5px">
                        <StackPanel
                            Grid={{ Row: 0 }} Orientation={Orientation.Horizontal}>
                            <Glyph
                                ClassName="mobile-nav-back"
                                Foreground="black"
                                Margin="10px 10px"
                                FontSize={NavMenu.theme.fonts.xxLarge.fontSize}
                                VerticalAlignment={VerticalAlignment.Center}
                                OnClick={(e) => templatedParent.MobileBackButtonClick()}
                                Icon="ChevronLeft" />
                            <TextBlock Text={t.Label}
                                FontWeight="bold"
                                VerticalAlignment={VerticalAlignment.Center}
                                FontSize={NavMenu.theme.fonts.xLarge.fontSize} />
                        </StackPanel>
                    </Panel>
                </Grid>
            </Route>));

        routes = routes.concat(otherRoutes);
        return routes;
    }

    private static VerticalDesktopTemplate(templatedParent: NavMenuBase<INavMenuProps, INavMenuState>): JSX.Element
    {
        return (
            <Grid ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}>
                <ItemsControl
                    Grid={{ Column: 0 }}
                    Margin="0px 20px 0px 0px"
                    ref={ic => templatedParent._tabList = ic}
                    ItemTemplate={new DataTemplate((tab: INavMenuItem) =>
                    {
                        if (!templatedParent.GetTabIsVisible(tab))
                            return (<></>);
                        return templatedParent.RenderTabLabel(tab, false);
                    })}
                    ItemsSource={templatedParent.state.Items} />

                <Panel Grid={{ Column: 1 }}>
                    <Switch>
                        {NavMenu.GetDesktopTabRoutes(templatedParent)}
                    </Switch>
                </Panel>
            </Grid>);
    }

    private static GetDesktopTabRoutes(templatedParent: NavMenuBase<INavMenuProps, INavMenuState>): JSX.Element[]
    {
        var defaultTab = templatedParent.state.Items?.find(t => templatedParent.GetTabIsEnabled(t) && templatedParent.GetTabIsVisible(t));
        let routes: JSX.Element[] =
            [
                (<Redirect exact
                    push={true}
                    from={templatedParent._startingRoute}
                    to={Window.CombineRoute([templatedParent._startingRoute, defaultTab?.Key || ""])} />)
            ];

        var otherRoutes = templatedParent.state.Items.map(
            t =>
            (<Route path={Window.CombineRoute([templatedParent._startingRoute, t.Key])} key={t.Key}>
                <TabContentPanel
                    NavMenuParent={templatedParent}
                    TabItem={t}
                    OnDidMount={(content) => templatedParent.SetSelectedTab((content as TabContentPanel).state.TabItem)} />
            </Route>));

        routes = routes.concat(otherRoutes);
        return routes;
    }

    protected /* override */ OnComponentWillMount()
    {
        this._startingRoute = Window.Route;
    }    

    private SetSelectedTab(tab?: INavMenuItem)
    {
        this._selectedTab = tab;
        this._tabList?.InvalidateRender();
    }

    private RenderTabLabel(tab: INavMenuItem, mobile: boolean): JSX.Element
    {
        return (
            <Grid
                ClassName={this.ConstructTabItemClassList(tab, mobile)}
                ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}
                OnClick={(e) => this.OnTabItemClick(tab)}                
                Padding="5px 0px">

                <CommandButton
                    Style={CommandButton.CircleButtonStyle}
                    Margin="0px 10px"
                    Background={mobile ? tab.IconBackground : undefined}
                    Icon={tab.Icon}
                    Foreground={mobile ? tab.IconForeground : "#808080"}
                    FontSize={NavMenu.theme.fonts.xLarge.fontSize as number} />

                <StackPanel Grid={{ Column: 1 }}
                    Orientation={Orientation.Vertical}
                    VerticalAlignment={VerticalAlignment.Center}>
                    <TextBlock Text={tab.Label}
                        ClassName="nav-label"
                        Margin="0"
                        FontSize={this.state.FontSize}
                        FontWeight="bold" />

                    {tab.Description && (<TextBlock
                        ClassName="nav-item-description"
                        Text={tab.Description}
                        FontSize={(this.state.FontSize as number) * 0.50} />)}
                </StackPanel>
            </Grid>);
    }

    private GetActualSelectedTab(mobile: boolean): INavMenuItem | undefined
    {
        let t: INavMenuItem | undefined = undefined;
        if (mobile)
            t = this._selectedTab;
        else
            t = this._selectedTab || this.state.Items?.find(t => this.GetTabIsEnabled(t) && this.GetTabIsVisible(t));
        return t;
    }

    private ConstructTabItemClassList(item: INavMenuItem, mobile: boolean)
    {
        let classes: string = "nav-menu-item ";
        if (mobile)
            classes += "mobile ";
        if (!this.GetTabIsEnabled(item))
            classes += "disabled ";
        if (!mobile && this.GetActualSelectedTab(mobile) == item)
            classes += "selected ";
        return classes;
    }

    private OnTabItemClick(item: INavMenuItem): void
    {
        this._selectedTab = item;
        Window.PushRoute(this._startingRoute, item.Key);
    }

    private GetTabIsVisible(item: INavMenuItem)
    {
        if (item.IsVisible === undefined)
            return true;

        if (typeof (item.IsVisible) == 'boolean')
            return item.IsVisible;

        return this.BindState(item.IsVisible as BindingParameters, item.Key + "_visible");
    }

    private GetTabIsEnabled(item: INavMenuItem)
    {
        if (item.IsEnabled === undefined)
            return true;

        if (typeof (item.IsEnabled) == 'boolean')
            return item.IsEnabled;

        return this.BindState(item.IsEnabled as BindingParameters, item.Key + "_enabled");
    }

    private MobileBackButtonClick()
    {
        Window.PushRoute(this._startingRoute);
    }

    _tabList?: ItemsControl | null;
    _selectedTab?: INavMenuItem;
    _unlisten?: Function;
    _startingRoute: string = "/";
}

export class NavMenu extends NavMenuBase<INavMenuProps, INavMenuState>
{
}

interface ITabContentPanelProps extends IPanelProps
{
    TabItem?: INavMenuItem;
    NavMenuParent?: NavMenu;
}
interface ITabContentPanelState extends IPanelState
{
    TabItem?: INavMenuItem;
    NavMenuParent?: NavMenu;
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
        return super.constructClasses() + " nav-content";
    }

    /* override */ getCSSStyles()
    {
        return Object.assign(
            super.getCSSStyles(),
            {
                padding: this.state.TabItem?.Padding || this.state.NavMenuParent?.state.Padding,
                animation: `${MotionAnimations.scaleDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            });
    }
}