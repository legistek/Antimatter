import * as React from 'react';
import { Binding, DataContext, ModelObjectReference } from '@antimatterjs/react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { WindowLayout } from '../Enums';
import { WindowLayoutContext } from './Window';
import { DataTemplate, FrameworkTemplate } from '../FrameworkTemplate';
import { IPanelProps, PanelBase } from './Panel';

export interface IContentPresenterProps extends IPanelProps
{
    Content?: ModelObjectReference | Binding,
    ContentTemplate?: DataTemplate | Binding,
    Layout?: WindowLayout
}
export interface IContentPresenterState extends IFrameworkElementState
{
    ContentTemplate?: DataTemplate,
    Layout?: WindowLayout
}

export class ContentPresenterBase<
    P extends IContentPresenterProps = {},
    S extends IContentPresenterState = {}>
    extends PanelBase<P, S>
{
    public get Content(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.Content));
    }

    public get ContentTemplate(): DataTemplate | undefined
    {
        return this.GetValue(nameof(this.props.ContentTemplate));
    }

    /* override */ renderElement(): JSX.Element
    {
        return (
            <WindowLayoutContext.Consumer>
                {
                    (layout) =>
                    {
                        (this.state as any).Layout = layout;
                        if (this.Content)
                        {
                            return (
                                <DataContext Value={this.Content}>
                                    {this.RenderContent()}
                                </DataContext>);
                        }
                        else
                        {
                            // No explicitly set content is fine, we just
                            // have to trust in DataContext
                            return this.RenderContent();
                        }
                    }                    
                }
            </WindowLayoutContext.Consumer>);
    }

    private RenderContent(): JSX.Element | null
    {
        var renderer = FrameworkTemplate.GetRenderer(
            this.GetTemplate(),
            this.state.Layout);
        return renderer(this.Content, 0, false, this);
    }

    protected /* virtual */ GetTemplate(): DataTemplate
    {
        return this.ContentTemplate;
    }
}


export class ContentPresenter extends ContentPresenterBase<IContentPresenterProps, IContentPresenterState>
{
}