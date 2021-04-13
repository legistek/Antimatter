import { Component } from 'react';
import * as React from 'react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';

export interface IWindowProps
{
    Background?: string
}

export class Window extends AntimatterComponent<IWindowProps>
{
    render()
    {
        return (
            <div className="amx-root"
                style={{
                    background: this.props.Background
                }}>
                {this.props.children}
            </div>);
    }
}