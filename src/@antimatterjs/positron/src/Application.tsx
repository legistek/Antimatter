import { BoundCollection } from '@antimatterjs/react';
import { DragDropPanel } from './Controls/DragPanel';
import { StringDictionary, Window } from './Controls/Window';
import { Theme } from './Theme';

export class Application
{
    public static Strings: StringDictionary = {};

    private static readonly _log: BoundCollection<string> = new BoundCollection<string>();

    public static get Log(): BoundCollection<string>
    {
        return Application._log;
    }

    public static BeginPrivateBrowserLog()
    {
        var log = console.log;
        console.log = function (...data: any[])
        {
            //log.call(this, data);
            log.apply(this, Array.prototype.slice.call(arguments));
            for (var item of data)
            {
                if (typeof (item) === "string")
                {
                    var dt = new Date();                    
                    Application._log.push(`${dt.toLocaleTimeString()} ${item}`);
                }
            }
        };
    }

    public static get CurrentWindow(): Window | undefined
    {
        return Application._currentWindow;
    }

    public static RegisterWindow(wnd: Window)
    {
        Application._currentWindow = wnd;
    }

    private static _currentDropPanel: DragDropPanel | undefined;
    public static get CurrentDropPanel()
    {
        return Application._currentDropPanel;
    }
    public static set CurrentDropPanel(value: DragDropPanel | undefined)
    {
        Application._currentDropPanel = value;
    }

    private static _currentWindow: Window | undefined;

    private static _currentTheme: Theme | undefined;
    public static SetTheme(theme: Theme)
    {
        if (this._currentTheme === theme)
            return;
        this._currentTheme = theme;

        var r = document.querySelector(':root') as HTMLElement;
        if (!r)
            return;

        for (let entry of Object.entries(theme.Palette))
            r.style.setProperty(`--Palette_${entry[0]}`, entry[1]);
        for (let entry of Object.entries(theme.FontStyle))
            r.style.setProperty(`--Font_${entry[0]}`, entry[1]);
        for (let entry of Object.entries(theme.Layout))
            r.style.setProperty(`--Layout_${entry[0]}`, entry[1]);
        for (let entry of Object.entries(theme.Effects))
            r.style.setProperty(`--Effect_${entry[0]}`, entry[1]);
    }
}