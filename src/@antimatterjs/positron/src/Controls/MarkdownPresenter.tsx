import * as React from 'react';
import { Binding, DataContext, ModelObjectReference } from '@antimatterjs/react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { WindowLayout } from '../Enums';
import { WindowLayoutContext } from './Window';
import { DataTemplate, FrameworkTemplate } from '../FrameworkTemplate';
import { IPanelProps, PanelBase } from './Panel';
import * as DOMPurify from 'dompurify';
import { marked } from 'marked';

// import { DOMPurify } from '../Tnird Party/dompurify';
//import { marked } from '../Tnird Party/marked.min'
//import DOMPurify from '../Tnird Party/purify.min';

import { Style, WebStyle } from '../Style';
import { SemanticColor, Theme } from '../..';

export interface IMarkdownPresenterProps extends IPanelProps
{
    Content?: string | Binding,
    AppendTemp?: string | Binding,
    Version?: number | Binding,
    IsClosed?: boolean | Binding,
}

export class MarkdownPresenter<
    P extends IMarkdownPresenterProps = {}> extends PanelBase<P>
{
    private _innerElement?: HTMLDivElement | null;
    private _parsed: string = "";
    private _renderedVersion: number = 0;

    public static DefaultStyle: Style<IMarkdownPresenterProps> = new WebStyle<IMarkdownPresenterProps>(
        {
            IsClosed: true
        },
        {
            "@.is-open a": {
                pointerEvents: 'none',
                color: Theme.Value(SemanticColor.BodyText),
                textDecoration: 'none'
            }
        });

    public get Content(): string
    {
        return this.GetValue(nameof(this.props.Content), "");
    }
    public set Content(value: string | undefined)
    {
        this.SetValue(nameof(this.Content), value, false, true, true);
    }

    public get IsClosed(): boolean
    {
        return this.GetValue(nameof(this.props.IsClosed), false);
    }

    public get Version(): number
    {
        return this.GetValue(nameof(this.props.Version), 0);
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
                __html: this._parsed
            }}
        />
    }

    public override OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        super.OnBoundPropertyUpdate(property, value, oldValue);
        if (property === nameof(this.Content))
        {
            this.UpdateMarkdown();
        }
        else if (property === nameof(this.AppendTemp))
        {
            this.Content += value as string;
            this.UpdateMarkdown();            
        }
    }

    override constructClasses(): string
    {
        return super.constructClasses() +
            (this.IsClosed ? '' : 'is-open');
    }

    private UpdateMarkdown()
    {
        if (this._renderedVersion === this.Version)
            return;

        var ctx = this.DataContext;

        var unsafe = marked.parse(this.Content) as string;
        this._parsed = DOMPurify.default.sanitize(unsafe, {
            ALLOWED_TAGS: [
                // headings
                "h1", "h2", "h3", "h4", "h5", "h6",
                // text + inline
                "span", "div", "p", "br", "hr", "strong", "em", "b", "i", "del", "s", "a", "sup",
                // lists
                "ul", "ol", "li",
                // code
                "pre", "code",
                // quotes
                "blockquote",
                // tables (marked emits these with GFM enabled)
                "table", "thead", "tbody", "tr", "th", "td"
            ],
            ALLOWED_ATTR: ["href", "title", "class"],
            ALLOWED_URI_REGEXP: /^(?:https?|mailto|cite|tag):/i,
        });

        this._renderedVersion = this.Version;
        if (!this._innerElement)
            return;
        this._innerElement.innerHTML = this._parsed;
        if (!this._innerElement.children)
            return;
        var last = this._innerElement.children[this._innerElement.children.length - 1];
        if (!last)
            return;
        last.scrollIntoView();
    }
}
