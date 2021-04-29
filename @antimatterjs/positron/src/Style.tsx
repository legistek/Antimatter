import { Utilities } from "@antimatterjs/react";

export interface ICSSClass
{
    Selector?: string,
    Rules: React.CSSProperties
}

export class Style<T>
{    
    static _lastStyleID: number = 0;
    static _kebabRegex: RegExp = new RegExp(/[A-Z]/g);
    static _cssKeys: Map<string, string> = new Map<string, string>();
    _styleID: number;
    _applied: boolean = false;
    readonly _classes: ICSSClass[];

    constructor(props: T, ...css: ICSSClass[])
    {
        this._styleID = Style._lastStyleID++;
        this.Props = props;
        this._classes = css;
    }

    public readonly Props: T;

    public Class(): string
    {
        if (!this._applied && this._classes.length > 0)
        {
            Utilities.AddStyleSheet(this.CreateCSSClasses());
            this._applied = true;
        }
        return this.GetClassName();
    }

    public static CreateIconSet(start: number, end: number): { [key: string]: string }
    {
        let set: { [key: string]: string } = {};
        for (let i: number = start; i <= end; i++)
        {            
            set[i.toString(16)] = String.fromCharCode(i);
        }
        return set;
    }

    CreateCSSClasses(): string
    {
        let s: string[] = [];
        for (const cssClass of this._classes)
        {
            s.push((cssClass.Selector?.replace("@", `.${this.GetClassName()}`) || `.${this.GetClassName()}`) + "\n");
            s.push("{\n");

            var entries = Object.entries(cssClass.Rules);
            for (const entry of entries)
                s.push(`\t${this.GetCSSKey(entry[0])}: ${entry[1]};\n`);

            s.push("}\n");
        }

        return "".concat(...s);
    }

    GetClassName()
    {
        return `ptnst${this._styleID}`;
    }

    GetCSSKey(style: string)
    {
        let cssKey: string | undefined = Style._cssKeys.get(style);
        if (!cssKey)
        {
            cssKey = style.replace(Style._kebabRegex, v => `-${v.toLowerCase()}`);
            Style._cssKeys.set(style, cssKey);            
        }
        return cssKey;       
    }
}