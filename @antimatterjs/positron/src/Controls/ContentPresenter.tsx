import * as React from 'react';
import { Binding, DataContext, ModelObjectReference } from '@antimatterjs/react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { WindowLayout } from '../Enums';
import { WindowLayoutContext } from './Window';
import { DataTemplate } from '../FrameworkTemplate';

export interface IContentPresenterProps extends IFrameworkElementProps
{
    Content?: ModelObjectReference | Binding
    ContentTemplate?: DataTemplate | ((parent: any) => JSX.Element),
    Layout?: WindowLayout
}
export interface IContentPresenterState extends IFrameworkElementState
{
    Content?: ModelObjectReference,
    ContentTemplate?: DataTemplate | ((parent: any) => JSX.Element),
    Layout?: WindowLayout
}

export class ContentPresenterBase<
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
                        if (this.state.Content)
                        {
                            return (
                                <DataContext Value={this.state.Content}>
                                    {this.RenderContent()}
                                </DataContext>);
                        }
                        else
                        {
                            return this.RenderContent();
                        }
                    }                    
                }
            </WindowLayoutContext.Consumer>);
    }

    private RenderContent(): JSX.Element
    {
        if (this.state.ContentTemplate instanceof DataTemplate)
            return this.state.ContentTemplate.GetVisualTree(this.state.Layout)(this.state.Content);
        else if (typeof (this.state.ContentTemplate) === "function")
            return this.state.ContentTemplate(this.state.Content);
        else
            return (<></>);
    }
}


export class ContentPresenter extends ContentPresenterBase<IContentPresenterProps, IContentPresenterState>
{
}