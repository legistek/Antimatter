import * as React from 'react';
import { Binding, DataContext, ModelObjectReference, ReactDataContext } from '@antimatterjs/react';
import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { TextBlock } from './TextBlock';

export interface IViewProps extends IPanelProps
{
    ViewModel?: ModelObjectReference | Binding,
}
export interface IViewState extends IPanelState
{
    ViewModel?: ModelObjectReference,
}

export abstract class View<P extends IViewProps = {},
    S extends IViewState = {}>
    extends PanelBase<P,S>
{
    /* protected */ abstract Template(): JSX.Element;
    
    /* override sealed */ renderElement(): JSX.Element
    {
        (this.state as any)["DataContext"] = this.state.ViewModel;
        return (
            <ReactDataContext.Provider value={this.state.ViewModel}>
                {this.Template()}
            </ReactDataContext.Provider>);        
    }
}