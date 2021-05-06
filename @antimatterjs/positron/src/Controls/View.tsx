import * as React from 'react';
import { Binding, DataContext, ModelObjectReference } from '@antimatterjs/react';
import { IPanelProps, IPanelState, Panel } from './Panel';

export interface IViewProps extends IPanelProps
{
    ViewModel?: ModelObjectReference | Binding,
}
export interface IViewState extends IPanelState
{
    ViewModel?: ModelObjectReference
}

export abstract class View<P extends IViewProps = {},
    S extends IViewState = {}>
    extends Panel<P,S>
{
    /* protected */ abstract Template(): JSX.Element;
    
    /* override */ renderElement(): JSX.Element
    {
        return (
            <DataContext Value={this.state.ViewModel}>
                {this.Template()}
            </DataContext>);
    }
}