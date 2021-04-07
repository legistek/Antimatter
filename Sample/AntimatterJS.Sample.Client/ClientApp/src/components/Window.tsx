import { Component } from 'react';
import * as React from 'react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';

export class Window extends AntimatterComponent
{
    render()
    {
        return (
            <div className="amx-root">
                {this.props.children}
            </div>);
    }
}