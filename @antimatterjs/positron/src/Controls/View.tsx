import * as React from 'react';
import { Binding, ModelObjectReference, ReactDataContext } from '@antimatterjs/react';
import { IPanelProps, IPanelState, PanelBase } from './Panel';

export interface IViewProps extends IPanelProps
{
    ViewModel?: ModelObjectReference | Binding,
}
export interface IViewState extends IPanelState
{
    ViewModel?: ModelObjectReference,
}

export abstract class ViewBase<P extends IViewProps = {},
    S extends IViewState = {}>
    extends PanelBase<P,S>
{
    /* protected */ abstract View(): JSX.Element;
    
    readonly renderElement = (): JSX.Element =>
    {
        if (this.state.ViewModel)
        {
            (this.state as any)["DataContext"] = this.state.ViewModel;
            return (
                <ReactDataContext.Provider value={this.state.ViewModel}>
                    {this.View()}
                </ReactDataContext.Provider>);
        }
        else
        {
            return this.View();
        }
    };
}

export abstract class View extends ViewBase<IViewProps, IViewState>
{
}