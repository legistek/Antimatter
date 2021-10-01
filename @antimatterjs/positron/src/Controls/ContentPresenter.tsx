import * as React from 'react';
import { Binding, DataContext, ModelObjectReference } from '@antimatterjs/react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { WindowLayout } from '../Enums';
import { WindowLayoutContext } from './Window';
import { DataTemplate, DataTemplateValue, FrameworkTemplate } from '../FrameworkTemplate';
import { IPanelProps, IPanelState, PanelBase } from './Panel';

export interface IContentPresenterProps extends IPanelProps
{
    Content?: ModelObjectReference | Binding
    ContentTemplate?: DataTemplateValue,
    Layout?: WindowLayout
}
export interface IContentPresenterState extends IPanelState
{
    Content?: ModelObjectReference,
    ContentTemplate?: DataTemplateValue,
    Layout?: WindowLayout
}

export class ContentPresenterBase<
    P extends IContentPresenterProps = {},
    S extends IContentPresenterState = {}>
    extends PanelBase<P, S>
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

    private RenderContent(): JSX.Element | null
    {
        var renderer = FrameworkTemplate.GetRenderer(
            this.state.ContentTemplate,
            this.state.Layout);
        return renderer(this.state.Content);
    }
}


export class ContentPresenter extends ContentPresenterBase<IContentPresenterProps, IContentPresenterState>
{
}