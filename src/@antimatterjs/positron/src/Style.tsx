import { Utilities } from "@antimatterjs/react";
import * as React from "react";
import { Theme } from "./Theme";

let _lastStyleID: number = 0;

export interface ICSSSheet
{
    [key: string]: React.CSSProperties;
}

export abstract class StyleBase<T>
{    
    constructor(setters: T, sheet?: ICSSSheet, basedOn?: Style<T>)
    {
        this._styleID = _lastStyleID++;
        if (basedOn)
        {
            this.Setters = {} as any;
            Object.assign(this.Setters as any, basedOn.Setters);
            Object.assign(this.Setters as any, setters);
            if (basedOn instanceof WebStyle)
            {
                if (sheet && !basedOn._sheet)
                    this._sheet = sheet;
                else if (!sheet && basedOn._sheet)
                {
                    this._sheet = {};
                    Object.assign(this._sheet, basedOn._sheet);
                }
                else if (sheet && basedOn._sheet)
                {
                    this._sheet = {};
                    var basedOnEntries = Object.entries(basedOn._sheet);
                    for (var entry of basedOnEntries)
                    {
                        this._sheet[entry[0]] = {};
                        Object.assign(this._sheet[entry[0]], entry[1]);
                    }

                    var newEntries = Object.entries(sheet);
                    for (var entry of newEntries)
                    {
                        if (!this._sheet[entry[0]])
                            this._sheet[entry[0]] = {};
                        Object.assign(this._sheet[entry[0]], entry[1]);
                    }
                }
            }
            else
            {
                this._sheet = sheet;
            }
        }
        else
        {
            this.Setters = setters;
            this._sheet = sheet;
        }        
    }

    public readonly Setters: T;
    
    public static CreateIconSet(start: number, end: number): { [key: string]: string }
    {
        let set: { [key: string]: string } = {};
        for (let i: number = start; i <= end; i++)
        {
            set[i.toString(16)] = String.fromCharCode(i);
        }
        return set;
    }

    public Class(): string
    {
        if (!this._applied)
        {
            var ss = this.CreateStyleSheet(this._sheet);
            if (ss)
                Utilities.AddStyleSheet(ss);
            this._applied = true;
        }
        return this.GetClassName();
    }

    private static _tpRegex = new RegExp(/\/\*tp[^\/\*]+tp\*\//g);

    public GetTemplatablePropValue(val: string): string
    {
        if (typeof (val) !== "string")
            return val;

        if (val.includes("/*tp"))
        {
            let a = 5;
        }

        return val.replaceAll(Style._tpRegex, (propName) =>
        {
            propName = propName.substring(
                Style.TemplatePropFlag.length,
                propName.length - Style.TemplatePropEndFlag.length);
            if (!this.TemplateHasRendered)
                this.TemplateProps.add(propName);            
            return `var(--prop-${propName}${this._styleID})`
        });

        //var flagIndex = (val as string).indexOf(WebStyle.TemplatePropFlag);
        //if (flagIndex !== -1)
        //{
        //    var propName = (val as string).substring(WebStyle.TemplatePropFlag.length);
        //    if (!this.TemplateHasRendered)
        //        this.TemplateProps.add(propName);
        //    val = `var(--prop-${propName}${this._styleID})`;
        //}
        //return val;
    }

    private CreateStyleSheet(classes: ICSSSheet | undefined): string | undefined
    {
        let s: string[] = [];

        let didRoot: boolean = false;
        let didAny: boolean = true;

        if (classes)
        {
            for (const cssClass of Object.entries(classes))
            {
                var selector = cssClass[0];
                s.push(selector.replaceAll("@", `.${this.GetClassName()}`) + "\n");
                s.push("{\n");

                if (selector === "@")
                {
                    didRoot = true;
                    var propEntries = Object.entries(this.Setters as any);
                    for (const entry of propEntries)
                        didAny = this.CreateStyleProps(entry, s) || didAny;
                }

                var entries = Object.entries(cssClass[1]);
                for (const entry of entries)
                    s.push(`\t${this.GetCSSKey(entry[0])}: ${this.GetTemplatablePropValue(entry[1])};\n`);

                s.push("}\n");
            }
        }

        if (!didRoot)
        {
            s.push(`.${this.GetClassName()} {\n`);
            var propEntries = Object.entries(this.Setters as any);
            for (const entry of propEntries)
                didAny = this.CreateStyleProps(entry, s) || didAny;
            s.push("}\n");
        }

        if (!didAny)
            return undefined;

        return "".concat(...s);
    }

    private GetClassName()
    {
        return `ptnst${this._styleID}`;
    }

    private CreateStyleProps(entry: [string, any], sheet: string[]): boolean
    {
        var val = entry[1];
        if (typeof (val) === "number" &&
            (val as number) >= Theme.FirstResourceId)
            val = Theme.Value(val as number);
        else if (typeof (val) !== "string")
            return false;
        sheet.push(`\t--prop-${entry[0]}${this._styleID}: ${val};\n`);
        return true;
    }



    private GetCSSKey(style: string)
    {
        let cssKey: string | undefined = WebStyle._cssKeys.get(style);
        if (!cssKey)
        {
            cssKey = style.replace(WebStyle._kebabRegex, v => `-${v.toLowerCase()}`);
            WebStyle._cssKeys.set(style, cssKey);
        }
        return cssKey;
    }

    public _styleID: number = -1;
    public TemplateHasRendered: boolean = false;
    public static readonly TemplatePropEndFlag: string = "tp*/";
    public static readonly TemplatePropFlag: string = "/*tp";
    public TemplateProps: Set<string> = new Set<string>();

    readonly _sheet?: ICSSSheet;
    private _applied: boolean = false;
    private static _kebabRegex: RegExp = new RegExp(/[A-Z]/g);
    private static _cssKeys: Map<string, string> = new Map<string, string>();
}

export class Style<T> extends StyleBase<T> {
    constructor(setters: T, basedOn?: StyleBase<T>)
    {
        super(setters, {}, basedOn);        
    }         
}

export function TemplateProp(name: string): any
{
    // return `var(--prop-${name}${WebStyle._templPropFlag})`;
    return `${WebStyle.TemplatePropFlag}${name}${WebStyle.TemplatePropEndFlag}`;
}

export class WebStyle<T> extends StyleBase<T>
{        
}