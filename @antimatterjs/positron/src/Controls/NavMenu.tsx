import * as React from 'react';
import { Binding, BindingParameters, ModelObjectReference } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { DefaultEffects, MotionAnimations } from '@fluentui/react';
import { WebStyle } from '../Style';
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
import { ITabControlCommon, ITabControlProps, ITabControlState, ITabItem, TabContentPanel, TabControl, TabControlBase } from './TabControl';
import { FontStyle, SemanticColor, Theme } from '../Theme';

export interface INavMenuProps extends ITabControlProps
{
}
export interface INavMenuState extends ITabControlState
{
}

export class NavMenuBase<
    P extends INavMenuProps = { Items: [] },
    S extends INavMenuState = { Items: [] }> extends TabControlBase<P, S>
{    
    public static /* override */ DefaultStyle: WebStyle<INavMenuProps> = new WebStyle<INavMenuProps>(
        {
            Template: new ControlTemplate(
                NavMenuBase.VerticalDesktopTemplate,
                {
                    Layout: WindowLayout.Tablet,
                    VisualTree: NavMenuBase.VerticalMobileTemplate
                }),
            Padding: "5px",
            FontSize: FontStyle.Large,
            Items: []
        },
        {
            "@ .tab-menu-item": {
                color: Theme.Value(SemanticColor.BodySubtext),
                fontFamily: Theme.Value(FontStyle.FontFamily),
                borderWidth: "0px 0px 0px 4px",
                borderColor: "transparent",
                padding: "10px 45px 10px 10px",
                background: "transparent",
                cursor: "pointer",
                margin: "5px 0px 5px 10px"
            },
            "@ .tab-label": {
                fontWeight: "bold"
            },
            "@ .tab-menu-item:hover": {
                background: Theme.Value(SemanticColor.ButtonBackgroundHovered)
            },
            "@ .tab-menu-item:not(.mobile)": {
                maxWidth: "250px"
            },
            "@ .tab-menu-item.selected": {
                color: Theme.Value(SemanticColor.BodyText),
                borderColor: Theme.Value(SemanticColor.Link),
                borderWidth: "0px 0px 0px 4px",
                borderStyle: "solid"
            },
            "@ .menu-content": {
                animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            },
            "@ .tab-content": {
                animation: `${MotionAnimations.scaleDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            },
            "@ .mobile-nav-back": {
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
                        ItemTemplate={new DataTemplate((tab: ITabItem) =>
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
                        TabControlParent={templatedParent}/>                                            
                    <Panel
                        Grid={{ Row: 0 }}
                        BoxShadow={DefaultEffects.elevation8}
                        Padding="5px 5px">
                        <StackPanel
                            Grid={{ Row: 0 }} Orientation={Orientation.Horizontal}>
                            <Glyph
                                ClassName="mobile-nav-back"
                                Foreground={SemanticColor.BodyText}
                                Margin="10px 10px"
                                FontSize={FontStyle.ExtraExtraLarge}
                                VerticalAlignment={VerticalAlignment.Center}
                                OnClick={(e) => templatedParent.MobileBackButtonClick()}
                                Icon="ChevronLeft" />
                            <TextBlock Text={t.Label}
                                FontWeight="bold"
                                VerticalAlignment={VerticalAlignment.Center}
                                FontSize={FontStyle.ExtraLarge} />
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
                    ItemTemplate={new DataTemplate((tab: ITabItem) =>
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
                    TabControlParent={templatedParent}
                    TabItem={t}
                    OnDidMount={(content) => templatedParent.SetSelectedTab((content as TabContentPanel).state.TabItem as ITabItem, true)} />
            </Route>));

        routes = routes.concat(otherRoutes);
        return routes;
    }

    protected /* override */ OnComponentWillMount()
    {
        this._startingRoute = Window.Route;
    }    

    protected /* override */ RenderTabLabel(tab: ITabItem, mobile: boolean): JSX.Element
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
                    Foreground={mobile ? tab.IconForeground : SemanticColor.ButtonTextDisabled}
                    FontSize={FontStyle.ExtraLarge} />

                <StackPanel Grid={{ Column: 1 }}
                    Orientation={Orientation.Vertical}
                    VerticalAlignment={VerticalAlignment.Center}>
                    <TextBlock Text={tab.Label}
                        ClassName="tab-label"
                        Margin="0"
                        FontSize={this.FontSize}
                        FontWeight="bold" />

                    {tab.Description && (<TextBlock
                        Text={tab.Description}
                        MaxLines={mobile ? "99" : "2"}
                        FontSize={FontStyle.Medium} />)}
                </StackPanel>
            </Grid>);
    }

    protected /* override */ OnTabItemClick(item: ITabItem): void
    {
        this._selectedTab = item;
        Window.PushRoute(this._startingRoute, item.Key);
    }

    private MobileBackButtonClick()
    {
        Window.PushRoute(this._startingRoute);
    }

    _unlisten?: Function;
    _startingRoute: string = "/";
}

export class NavMenu extends NavMenuBase<INavMenuProps, INavMenuState>
{
}

