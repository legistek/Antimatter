import * as React from 'react';
import { Component } from 'react';
import { Antimatter } from '../../Antimatter';
import { BindingBase } from '../../Binding';
import { BindingExpression } from '../../BindingExpression';
import { ModelObjectReference } from '../../ModelObjectReference';
import { ReactDataContext } from '../ReactClient';

/** Used to render child content with a different DataContext than 
 * that of its parent. Use as an alternative to binding a new DataContext to child props
 * to reduce the number of bindings in an application, or to use bindings 
 * in functional components (which cannot be used with prop bindings). */
export class DataContext extends Component<{ Value?: BindingBase | ModelObjectReference }, { Value?: ModelObjectReference }>
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