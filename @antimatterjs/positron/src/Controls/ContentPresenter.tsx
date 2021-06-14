import * as React from 'react';
import { Binding, DataContext, ModelObjectReference } from '@antimatterjs/react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { WindowLayout } from '../Enums';
import { WindowLayoutContext } from './Window';
import { DataTemplate } from '../FrameworkTemplate';

export interface IContentPresenterProps extends IFrameworkElementProps
{
    Content?: ModelObjectReference | Binding
    ContentTemplate?: DataTemplate,
    Layout?: WindowLayout
}
export interface IContentPresenterState extends IFrameworkElementState
{
    Content?: ModelObjectReference,
    ContentTemplate?: DataTemplate,
    Layout?: WindowLayout
}

export class ContentPresenter<
    P extends IContentPresenterProps = {},
    S extends IContentPresenterState = {}>
    extends FrameworkElement<P, S>
{    
    /* override */ renderElement(): JSX.Element
    {
        return (
            <WindowLayoutContext.Consumer>
                {
                    (layout) =>
                    {
                        (this.state as any).Layout = layout;
                        return (
                            <DataContext Value={this.state.Content}>
                                {this.state.ContentTemplate ? this.state.ContentTemplate.GetVisualTree(this.state.Layout)(this.state.Content) : (<></>)}
                            </DataContext>);
                    }                    
                }
            </WindowLayoutContext.Consumer>);
    }
}