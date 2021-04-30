import * as React from 'react';
import { Binding, BindingParameters, ModelObjectReference } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { INavLinkGroup, INavLink, Nav, Icon, MotionAnimations, Pivot, PivotItem, Fabric, getTheme } from '@fluentui/react';
import { Style } from '../Style';
import { Grid } from './Grid';
import { ItemsControl } from './ItemsControl';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';

export interface ITabItem
{
    Label: string,
    Route: string,
    Key?: string,
    Content: JSX.Element,
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

    public static DefaultStyle: Style<ITabControlProps> = new Style<ITabControlProps>(
        {
            Template: (templatedParent: TabControl<ITabControlProps, ITabControlState>) =>
            {
                let tabs: JSX.Element[] = [];
                for (const tab of templatedParent.state.Tabs)
                {
                    tabs.push(<PivotItem
                        headerText={tab.Label} />);
                }
                return (
                    <Grid ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}>
                        <ItemsControl ref={ic => templatedParent._tabList = ic}
                            ItemTemplate={(tab: ITabItem) =>
                            {
                                if (!templatedParent.GetTabIsVisible(tab))
                                    return (<></>);
                                return (
                                    <div className={templatedParent.ConstructTabItemClassList(tab)}
                                        onClick={(e) => templatedParent.OnTabItemClick(tab)}>
                                        {tab.Label}
                                    </div>
                                );
                            }}
                            ItemsSource={templatedParent.state.Tabs}/>                                                                                  

                        <TabPanel TabItem={templatedParent._selectedTab} />

                    </Grid>);               
            },
            Tabs: []
        },
        {
            Selector: "@ .tab-item",
            Rules: {
                color: TabControl.theme.semanticColors.bodySubtext,
                fontWeight: "bold",
                borderWidth: "0px 0px 0px 2px",
                borderColor: "transparent",
                padding: "10px 45px 10px 10px",
                background: "transparent",               
                cursor: "pointer",
                margin: "0px 0px 0px 10px"
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
            <div
                key={this.state.TabItem?.Key}
                style={{
                    padding: "10px",
                    animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
                }}>
                {this.state.TabItem?.Content}
            </div>
        );
    }
}