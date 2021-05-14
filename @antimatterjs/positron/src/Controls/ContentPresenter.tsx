import * as React from 'react';
import { Binding, DataContext, ModelObjectReference } from '@antimatterjs/react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';

export interface IContentPresenterProps extends IFrameworkElementProps
{
    Content?: ModelObjectReference | Binding
    ContentTemplate?: (content: ModelObjectReference) => JSX.Element;
}
export interface IContentPresenterState extends IFrameworkElementState
{
    Content?: ModelObjectReference,
    ContentTemplate?: (content?: ModelObjectReference) => JSX.Element;
}

export class ContentPresenter extends FrameworkElement<IContentPresenterProps, IContentPresenterState>
{    
    /* override */ renderElement(): JSX.Element
    {
        return (
            <DataContext Value={this.state.Content}>
                {this.state.ContentTemplate ? this.state.ContentTemplate(this.state.Content) : (<></>)}
            </DataContext>);
    }
}