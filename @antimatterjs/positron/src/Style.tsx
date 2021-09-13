import { Utilities } from "@antimatterjs/react";
import * as React from "react";

export interface ICSSSheet
{
    [key: string]: React.CSSProperties;
}

export class Style<T> {
    constructor(props: T, basedOn?: Style<T>)
    {
        this._styleID = WebStyle._lastStyleID++;

        if (basedOn)
        {
            this.Props = {} as any;
            Object.assign(this.Props, basedOn.Props);
            Object.assign(this.Props, props);
        }
        else
        {
            this.Props = props;
        }
    }

    public readonly Props: T;

    public static CreateIconSet(start: number, end: number): { [key: string]: string }
    {
        let set: { [key: string]: string } = {};
        for (let i: number = start; i <= end; i++)
        {
            set[i.toString(16)] = String.fromCharCode(i);
        }
        return set;
    }

    _styleID: number;
    static _lastStyleID: number = 0;
}

export class WebStyle<T> extends Style<T>
{       
    static _kebabRegex: RegExp = new RegExp(/[A-Z]/g);
    static _cssKeys: Map<string, string> = new Map<string, string>();
    
    _applied: boolean = false;
    readonly _sheet?: ICSSSheet;

    constructor(props: T, sheet?: ICSSSheet, basedOn?: WebStyle<T>)
    {
        super(props, basedOn);

        if (basedOn)
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

    public Class(): string
    {
        if (!this._applied && this._sheet)
        {
            Utilities.AddStyleSheet(this.CreateStyleSheet(this._sheet));
            this._applied = true;
        }
        return this.GetClassName();
    }

    private GetClassName()
    {
        return `ptnst${this._styleID}`;
    }

    private CreateStyleSheet(classes: ICSSSheet): string
    {
        let s: string[] = [];
        for (const cssClass of Object.entries(classes))
        {
            var selector = cssClass[0];
            s.push(selector.replaceAll("@", `.${this.GetClassName()}`) + "\n");
            s.push("{\n");

            var entries = Object.entries(cssClass[1]);
            for (const entry of entries)
                s.push(`\t${this.GetCSSKey(entry[0])}: ${entry[1]};\n`);

            s.push("}\n");
        }

        return "".concat(...s);
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
}