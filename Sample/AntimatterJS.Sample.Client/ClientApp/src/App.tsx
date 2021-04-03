import { Component } from 'react';
import * as React from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { AntimatterComponent, Company } from './components/Company';

import './custom.css'
import { Antimatter, DataContext } from '@antimatterjs/react';
import { Binding } from '@antimatterjs/react/src/Binding';
import { ModelObjectReference } from '@antimatterjs/react/src/ModelObjectReference';

export default class App extends AntimatterComponent<{ Model: ModelObjectReference }, { Model: ModelObjectReference }>
{
    static displayName = App.name;

    constructor(props)
    {
        super(props);         
    }

    render()
    {
        return (
            <DataContext Value={this.state.Model}>
                <DataContext Value={new Binding("Company")}>
                    <Company />
                </DataContext>
            </DataContext>
            

            //<Layout>
            //    <Route exact path='/' component={Home} />
            //    <Route path='/counter' component={Company} />
            //    <Route path='/fetch-data' component={FetchData} />
            //</Layout>
        );
    }
}
