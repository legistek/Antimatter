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

import { Route, Routes } from 'react-router-dom';
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
        return (<Routes>{NavMenu.GetMobileTabRoutes(templatedParent)}</Routes>);
    }

    private static GetMobileTabRoutes(templatedParent: NavMenuBase<INavMenuProps, INavMenuState>): JSX.Element[]
    {
        let mainRoute: JSX.Element[] =
            [
                (<Route path={templatedParent.BaseRoute + "/"} key="default"
                    element={
                        <ItemsControl
                            ref={ic => { templatedParent._tabList = ic; } }
                            ClassName="menu-content"
                            ItemsSource={templatedParent.state.Items}
                            ItemTemplate={(tab: ITabItem) =>
                            {
                                if (!templatedParent.GetTabIsVisible(tab))
                                    return (<></>);
                                return templatedParent.RenderTabLabel(tab, true);
                            }} />
                    } />)
            ];

        var otherRoutes = templatedParent.state.Items.map(
            t =>
            (<Route path={templatedParent.BaseRoute + t.Key} key={t.Key}
                element={
                    <Grid
                        key={t.Key}
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
                                <TextBlock Text={t.Label as string}
                                    FontWeight="bold"
                                    VerticalAlignment={VerticalAlignment.Center}
                                    FontSize={FontStyle.ExtraLarge} />
                            </StackPanel>
                        </Panel>
                    </Grid>
                } />));

        return [...otherRoutes, ...mainRoute];
    }

    private static VerticalDesktopTemplate(templatedParent: NavMenuBase<INavMenuProps, INavMenuState>): JSX.Element
    {
        return (
            <Grid ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}>
                <ItemsControl
                    Grid={{ Column: 0 }}
                    Margin="0px 20px 0px 0px"
                    ref={ic => { templatedParent._tabList = ic; } }
                    VerticalScrollBarVisibility={ScrollBarVisibility.Auto}
                    ItemTemplate={(tab: ITabItem) =>
                    {
                        if (!templatedParent.GetTabIsVisible(tab))
                            return (<></>);
                        return templatedParent.RenderTabLabel(tab, false);
                    }}
                    ItemsSource={templatedParent.state.Items} />

                <Panel Grid={{ Column: 1 }}>
                    <Routes>
                        {NavMenu.GetDesktopTabRoutes(templatedParent)}
                    </Routes>
                </Panel>
            </Grid>);
    }

    private static GetDesktopTabRoutes(templatedParent: NavMenuBase<INavMenuProps, INavMenuState>): JSX.Element[]
    {
        // find default item
        let defaultItem: ITabItem | undefined = undefined;
        for (var item of templatedParent.Items)
        {
            if (item.IsDefault)
            {
                defaultItem = item;
                break;
            }
            if (templatedParent.GetTabIsEnabled(item) &&
                templatedParent.GetTabIsVisible(item))
            {
                if (!defaultItem)
                    defaultItem = item;
            }
        }

        //let actualRoutes: ITabItem[] = [...templatedParent.Items];
        //if (defaultItem)
        //    actualRoutes.push({
        //        Key: '/',
        //        Content: defaultItem.Content,
        //        Label: defaultItem.Label,
        //    });

        var finalRoutes = templatedParent.Items.map(
            t => (
                <Route path={templatedParent.BaseRoute + t.Key}
                    key={t.Key}
                    element={
                        <TabContentPanel
                            key={t.Key}
                            TabControlParent={templatedParent}
                            TabItem={t}
                            OnDidMount={
                                (content) =>
                                {
                                    templatedParent.SetSelectedTab((content as TabContentPanel).state.TabItem as ITabItem, true);
                                }
                            } />
                    } />
            )
        );

        if (defaultItem)
        {
            finalRoutes.push((
                <Route
                    path={templatedParent.BaseRoute + '/'}
                    key='default'
                    element={
                        <TabContentPanel
                            TabControlParent={templatedParent}
                            TabItem={defaultItem}
                            OnDidMount={
                                (content) =>
                                {
                                    templatedParent.SetSelectedTab((content as TabContentPanel).state.TabItem as ITabItem, true);
                                }
                            } />
                    } />
            ));
        }

        return finalRoutes;
    }
    
    private get BaseRoute(): string
    {
        var route = Window.Route;
        if (!route)
            return '';
        for (var item of this.Items)
        {
            if (route.endsWith(item.Key))
            {
                var base = route.substring(0, route.length - item.Key.length);
                return base;
            }
        }
        return '';
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
                    Icon={(typeof tab.Icon === 'number' || typeof tab.Icon === 'string' ? tab.Icon : new Binding(tab.Icon))}
                    Foreground={mobile ? tab.IconForeground : SemanticColor.ButtonTextDisabled}
                    FontSize={FontStyle.ExtraLarge} />

                <StackPanel Grid={{ Column: 1 }}
                    Orientation={Orientation.Vertical}
                    VerticalAlignment={VerticalAlignment.Center}>
                    <TextBlock Text={tab.Label as string}
                        ClassName="tab-label"
                        Margin="0"
                        FontSize={this.FontSize}
                        FontWeight="bold" />

                    {tab.Description && (<TextBlock
                        Text={tab.Description}
                        MaxLines={mobile ? "99" : "4"}
                        FontSize={FontStyle.Medium} />)}
                </StackPanel>
            </Grid>);
    }

    public /* override */ OnTabItemClick(item: ITabItem): void
    {
        this._selectedTab = item;
        Window.PushRoute(this.BaseRoute + item.Key);
    }

    public override GetActualSelectedTab(mobile: boolean): ITabItem | undefined
    {
        let t: ITabItem | undefined = undefined;
        if (mobile)
            t = this._selectedTab;
        else
            t = this._selectedTab || this.state.Items?.find(t => this.GetTabIsEnabled(t) && this.GetTabIsVisible(t));
        return t;
    }

    private MobileBackButtonClick()
    {
        Window.PushRoute(this.BaseRoute);
    }

    _unlisten?: Function;    
}

export class NavMenu extends NavMenuBase<INavMenuProps, INavMenuState>
{
}

