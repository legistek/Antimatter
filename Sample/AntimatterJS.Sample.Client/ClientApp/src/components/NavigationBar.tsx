import { Component } from 'react';
import * as React from 'react';
import { Route, withRouter } from 'react-router-dom';
import { createTheme, getTheme, IComponentAs, INavButtonProps, INavLinkGroup, INavState, INavStyleProps, INavStyles, IStyleFunctionOrObject, loadTheme, Nav } from '@fluentui/react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent, BindingMode } from '@antimatterjs/react';

export interface INavigationBarProps
{
    SelectedTabName?: string | Binding,
    groups: INavLinkGroup[] | null,
    styles?: IStyleFunctionOrObject<INavStyleProps, INavStyles>,
    linkAs?: IComponentAs<INavButtonProps>;
}

interface INavigationBarState
{
    SelectedTabName?: string
}

//@withRouter     // need this so Nav gets updates on route changes - TODO - sub-class that out
export class NavigationBar extends AntimatterComponent<INavigationBarProps, INavigationBarState>
{
    //public static DefaultBindings = {
    //    SelectedTabName: {
    //        Mode: BindingMode.TwoWay,            
    //    }
    //};

    render()
    {
        return (
            <Nav styles={this.props.styles}
                groups={this.props.groups}
                linkAs={this.props.linkAs}
                selectedKey={this.state.SelectedTabName}/>
            );
    }
}