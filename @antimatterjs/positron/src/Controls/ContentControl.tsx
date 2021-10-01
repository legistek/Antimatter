import * as React from 'react';
import { Binding } from "@antimatterjs/react";
import { ControlTemplate, DataTemplate, DataTemplateValue } from "../FrameworkTemplate";
import { TemplateProp, WebStyle } from "../Style";
import { Control, IControlProps, IControlState } from "./Control";
import { ContentPresenter } from './ContentPresenter';

export interface IContentControlProps extends IControlProps
{
    Content?: any | Binding;
    ContentTemplate?: DataTemplateValue;
}

export class ContentControlBase<P extends IContentControlProps = {}, S extends IControlState = {}> extends Control<P,S>
{
    public static DefaultStyle: WebStyle<IContentControlProps> = new WebStyle<IContentControlProps>(
        {
            Template: new ControlTemplate((templatedParent: ContentControl) => (
                <ContentPresenter
                    Content={templatedParent.Content}
                    ContentTemplate={templatedParent.ContentTemplate}
                    BorderBrush={TemplateProp(nameof(templatedParent.BorderBrush))}
                    BorderThickness={TemplateProp(nameof(templatedParent.BorderThickness))}
                    Background={TemplateProp(nameof(templatedParent.Background))}
                    Margin={TemplateProp(nameof(templatedParent.Padding))} />
            ))
        })

    public get Content(): any
    {
        return this.GetValue(nameof(this.props.Content));
    }

    public get ContentTemplate(): DataTemplateValue
    {
        return this.GetValue(nameof(this.props.ContentTemplate));
    }
}

export class ContentControl extends ContentControlBase<IContentControlProps, IControlState>
{
}