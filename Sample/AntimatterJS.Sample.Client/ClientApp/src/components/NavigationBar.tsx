import { Component } from 'react';
import * as React from 'react';
import { createTheme, getTheme, INavLinkGroup, INavState, INavStyleProps, INavStyles, IStyleFunctionOrObject, loadTheme, Nav } from '@fluentui/react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent, BindingMode } from '@antimatterjs/react';

export interface INavigationBarProps
{
    SelectedTabName?: string | Binding,
    groups: INavLinkGroup[] | null,
    styles?: IStyleFunctionOrObject<INavStyleProps, INavStyles>,
}

interface INavigationBarState
{
    SelectedTabName?: string
}

export class NavigationBar extends AntimatterComponent<INavigationBarProps, INavigationBarState>
{
    public static DefaultBindings = {
        SelectedTabName: {
            Mode: BindingMode.TwoWay,            
        }
    };

    render()
    {
        return (
            <Nav styles={this.props.styles}
                groups={this.props.groups}                
                selectedKey={this.state.SelectedTabName}/>
            );
    }
}