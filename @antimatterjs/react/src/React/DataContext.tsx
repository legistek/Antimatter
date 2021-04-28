import * as React from 'react';
import { Component } from 'react';
import { Antimatter } from '../Antimatter';
import { Binding } from '../Binding';
import { ModelObjectReference } from '../ModelObjectReference';
import { ReactDataContext } from './ReactClient';

/** Used to change the DataContext of a UI branch. */
export class DataContext extends Component<{ Value?: Binding | ModelObjectReference }, { Value?: ModelObjectReference }>
{    
    constructor(props)
    {
        super(props);
        Antimatter.InitializeComponent(this);
    }

    render()
    {        
        if (!this.state.Value)
            return null;
        return (
            <ReactDataContext.Provider value={this.state.Value}>
                {this.props.children}
            </ReactDataContext.Provider>
        );
    }
}