import * as React from 'react';
import { WindowLayout } from './Enums';

export interface ILayoutTemplate
{
    Layout: WindowLayout,
    VisualTree: (context: any) => JSX.Element
}

export class FrameworkTemplate
{
    /* private */ _mainVisualTree?: (parent: any) => JSX.Element;
    /* private */ _allLayouts: (ILayoutTemplate|null)[];

    constructor(
        visualTree: ((parent: any) => JSX.Element),        
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

    public GetVisualTree(layout?: WindowLayout): (parent: any) => JSX.Element
    {
        var vt = this._allLayouts[(layout as number) || 0]?.VisualTree;
        if (!vt)
            return this._allLayouts[0]?.VisualTree as (parent: any) => JSX.Element;
        return vt;
    }
}

export class ControlTemplate extends FrameworkTemplate
{    
}

export class DataTemplate extends FrameworkTemplate
{
}