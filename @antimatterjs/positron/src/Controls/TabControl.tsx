import * as React from 'react';
import { Link } from 'react-router-dom';
import { Route, withRouter } from 'react-router-dom';
import { Binding, BindingParameters, ModelObjectReference } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { INavLinkGroup, INavLink, Nav, Icon, MotionAnimations } from '@fluentui/react';
import { Style } from '../Style';
import { Grid } from './Grid';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';

export interface ITabItem
{
    Label: string,
    Route: string,
    Key?: string,
    Content: JSX.Element,
    IsEnabled?: boolean | BindingParameters,
    IsVisible?: boolean | BindingParameters,
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

@withRouter     // need this so Nav gets updates on route changes
export class TabControl<P extends ITabControlProps = {Tabs: []}, S extends ITabControlState = {Tabs:[]}> extends Control<P,S>
{
    _groups: INavLinkGroup[] = [];

    public static DefaultStyle: Style<ITabControlProps> = new Style<ITabControlProps>(
        {
            Template: (templatedParent: TabControl) =>
            (
                <Grid ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1,true)]}>
                    <Nav groups={templatedParent._groups}
                        styles={
                            {
                                root: {
                                    width: "fit-content",
                                    margin: "0px 0px 0px 10px"                                },
                                link: {
                                    padding: "0px 45px 0px 10px",                                    
                                }
                            }
                        }
                        linkAs={(props) =>
                        (
                            <Link className={props.className} style={{ color: 'inherit', boxSizing: 'border-box' }} to={props.href}>
                                <span style={{ display: 'flex' }}>
                                    {!!props.iconProps && <Icon style={{ margin: '0 4px' }} {...props.iconProps} />}
                                    {props.children}
                                </span>
                            </Link>
                        )} />

                    <ItemsControl Grid={{ Column: 1 }}
                        ItemTemplate={(tab: ITabItem) => (
                            <Route path={tab.Route} component={()=>
                            (
                                <div style={{
                                    padding: "10px",
                                    animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
                                }}>
                                    {tab.Content}                                        
                                </div>
                            )} />
                        )}
                        ItemsSource={templatedParent.state.Tabs} />                                                
                </Grid>
            ),
            Tabs: []
        });

    constructor(props)
    {
        super(props);
        this.ConstructNavigationBarGroups();
    }

    ConstructNavigationBarGroups()
    {        
        let links: INavLink[] = [];

        for (const item of this.state.Tabs)
        {
            if (!this.GetTabIsVisible(item))
                continue;

            links.push({
                url: item.Route,
                name: item.Label,
                key: item.Key,
                disabled: !this.GetTabIsEnabled(item),               
            });
        }

        this._groups = [{links: links}];
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