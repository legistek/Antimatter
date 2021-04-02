import { Component } from 'react';
import * as React from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Company } from './components/Company';

import './custom.css'
import { Antimatter, DataContext } from '@antimatterjs/react';
import { Binding } from '@antimatterjs/react/src/Binding';

export default class App extends Component<{DataContext: any}>
{
    static displayName = App.name;

    constructor(props)
    {
        super(props);        
        Antimatter.InitializeComponent(this);        
    }

    render()
    {
        return (
            <DataContext Value={new Binding("Company")}>
                <Company />
            </DataContext>
            

            //<Layout>
            //    <Route exact path='/' component={Home} />
            //    <Route path='/counter' component={Company} />
            //    <Route path='/fetch-data' component={FetchData} />
            //</Layout>
        );
    }
}
