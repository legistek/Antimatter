import * as React from 'react';
import { Binding, DataContext, ModelObjectReference } from '@antimatterjs/react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { WindowLayout } from '../Enums';
import { WindowLayoutContext } from './Window';
import { DataTemplate, FrameworkTemplate } from '../FrameworkTemplate';
import { IPanelProps, PanelBase } from './Panel';

export interface IHtmlPresenterProps extends IPanelProps
{
    Content?: string | Binding,
    AppendTemp?: string | Binding,
}

export class HtmlPresenter<
    P extends IHtmlPresenterProps = {}> extends PanelBase<P>
{
    _innerElement?: HTMLDivElement | null;

    public get Content(): string | undefined
    {
        return this.GetValue(nameof(this.props.Content));
    }
    public set Content(value: string|undefined)
    {
        this.SetValue(nameof(this.Content), value, false, true, true);
    }

    public get AppendTemp(): string | undefined
    {
        return this.GetValue(nameof(this.props.AppendTemp));
    }    

    override renderElement(): JSX.Element
    {
        return <div
            ref={r => { this._innerElement = r; } }
            dangerouslySetInnerHTML={{
                __html: this.Content || ""
            }}
        />
    }

    public override OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        super.OnBoundPropertyUpdate(property, value, oldValue);
        if (property === nameof(this.Content))
        {
            if (!this._innerElement)
                return;
            this._innerElement.innerHTML = this.Content || "";
        }
        else if (property === nameof(this.AppendTemp))
        {
            if (!this._innerElement)
                return;
            this.Content += value as string;
        }
    }
}
