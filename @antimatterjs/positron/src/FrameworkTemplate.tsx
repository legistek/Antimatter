import { type } from 'os';
import * as React from 'react';
import { WindowLayout } from './Enums';

export type TemplateFunction = ((item: any) => JSX.Element | null);

export type ITemplateLayouts =
    {
        [key in WindowLayout]?: (item: any) => JSX.Element | null;
    }

export interface ILayoutTemplate
{
    Layout: WindowLayout,
    VisualTree: (context: any) => JSX.Element|null
}

export class FrameworkTemplate
{
    /* private */ _mainVisualTree?: (parent: any) => JSX.Element|null;
    /* private */ _allLayouts: (ILayoutTemplate|null)[];

    constructor(
        visualTree: ((parent: any) => JSX.Element|null),        
        ...alternates: ILayoutTemplate[])
    {
        this._mainVisualTree = visualTree;
        this._allLayouts = [null, null, null, null];
        this._allLayouts[0] =
        {
            Layout: WindowLayout.Default,
            VisualTree: visualTree
        };
        if (alternates)
        {
            for (const alt of alternates)
            {
                this._allLayouts[alt.Layout as number] = alt;                
            }
        }        
    }

    public GetVisualTree(layout?: WindowLayout): TemplateFunction
    {
        var vt = this._allLayouts[(layout as number) || 0]?.VisualTree;
        if (!vt)
            return this._allLayouts[0]?.VisualTree as (parent: any) => JSX.Element;
        return vt;
    }

    private static _emptyTemplate: TemplateFunction = (item) => (<></>);

    public static GetRenderer(val: DataTemplate, layout?: WindowLayout): TemplateFunction
    {
        if (!val)
            return FrameworkTemplate._emptyTemplate;

        if (typeof (val) === "function")
        {
            var func = val as TemplateFunction;
            return func;
        }
        else
        {
            var layouts = val as ITemplateLayouts;
            if (!layout)
                return layouts[WindowLayout.Default] || FrameworkTemplate._emptyTemplate;
            return layouts[layout] || FrameworkTemplate._emptyTemplate;
        }
    }
}

export type DataTemplate = ITemplateLayouts | TemplateFunction | undefined;

export type ControlTemplateValue = ITemplateLayouts | TemplateFunction | undefined;

export class ControlTemplate extends FrameworkTemplate
{    
}