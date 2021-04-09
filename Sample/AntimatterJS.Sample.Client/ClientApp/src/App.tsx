import { Component } from 'react';
import * as React from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Company } from './components/Company';
import { createTheme, loadTheme } from '@fluentui/react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { Window } from './components/Window';

import './custom.css'

const theme = createTheme({
    // You can also modify certain other properties such as fontWeight if desired
    defaultFontStyle: { fontFamily: 'Roboto' }
});

loadTheme(theme);

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
            <Window>
                <DataContext Value={new Binding({ Path: "Company", Source: this.state.Model })}>
                    <Company />
                </DataContext>
            </Window>
            
            //<Layout>
            //    <Route exact path='/' component={Home} />
            //    <Route path='/counter' component={Company} />
            //    <Route path='/fetch-data' component={FetchData} />
            //</Layout>
        );
    }
}
