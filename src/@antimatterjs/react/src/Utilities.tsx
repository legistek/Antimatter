import { Binding } from "./Binding";
import { BoundCollection } from "./BoundCollection";
import { RGB, Span } from "./Foundation";
import { ModelObjectReference } from "./ModelObjectReference";

const unixTime0MSs: number = 62135596800000;

export enum SpanOverlap
{
    EntirelyBefore = -2,    PartiallyBefore = -1,
    Within = 0,
    PartiallyAfter = 1,
    EntirelyAfter = 2
}

export enum HostPlatform
{
    Unknown,
    Windows = 1,
    Android = 2,
    iOS = 4,
    MacOS = 8,
    Chrome = 16,
    Firefox = 32,
    Safari = 64
}

export class Utilities
{
    /**
     * Takes a date (for the local time zone) and returns
     * a timeless date (stored as the date at 10:00 AM + 1ms UTC which
     * is the same date for 99.999% of the world's population.
     * @param localDate The local date+time to use. Presumably this
     * came from user input.
     */
    public static ToTimelessDate(localDate: Date): Date
    {
        return new Date(Date.UTC(
            localDate.getFullYear(),
            localDate.getMonth(),
            localDate.getDate(),
            10,
            0,
            0,
            1));
    }

    /**
     * Determines whether the given date+time is a
     * timeless date such that it should be displayed
     * without a time.
     */
    public static IsTimelessDate(date: Date): boolean
    {
        return date.getUTCHours() === 10 &&
            date.getUTCMinutes() === 0 &&
            date.getUTCSeconds() === 0 &&
            date.getUTCMilliseconds() === 1;
    }

    public static IsIterable(obj: any): boolean
    {
        if (obj === null || obj === undefined)
            return false;
        return typeof obj[Symbol.iterator] === 'function';
    }

    public static IsTrue(s?: string|null): boolean
    {
        if (s === null || s === undefined)
            return false;
        s = s.trim();
        if (s === 'True' || s === 'true')
            return true;
        else
            return false;
    }

    public static IsFalse(s?: string | null): boolean
    {
        if (s === null || s === undefined)
            return false;
        s = s.trim();
        if (s === 'False' || s === 'false')
            return true;
        else
            return false;
    }

    public static AlmostEquals(a?: number, b?: number, epsilon: number = 0.0001): boolean
    {
        if (a === undefined && b === undefined)
            return true;
        if (a === undefined || b === undefined)
            return false;
        return Math.abs(a - b) <= epsilon;
    }

    public static FindFirstDescendant(node: Node | null, criteria: (e: HTMLElement) => boolean): HTMLElement | undefined
    {
        if (!node)
            return undefined;
        for (let i = 0; i < node.childNodes.length; i++)
        {
            var childNode = node.childNodes.item(i);
            if (!(childNode instanceof HTMLElement))
                continue;
            var elem = childNode as HTMLElement;
            if (criteria(elem))
                return elem;
            var tryDesc = this.FindFirstDescendant(elem, criteria);
            if (tryDesc)
                return tryDesc;
        }
        return undefined;
    }

    public static FindTextNodes(node: Node | null, nodeList: Node[])
    {
        if (!node)
            return;
        if (node.nodeType === Node.TEXT_NODE)
            nodeList.push(node);
        else
        {
            for (let i = 0; i < node.childNodes.length; i++)
                Utilities.FindTextNodes(node.childNodes.item(i), nodeList);
        }
    }

    public static RightOf(s: string, c: string): string
    {
        let i = 0;
        if (s.length === 0)
            return '';
        do
        {
            if (s.charAt(i) === c)
            {
                i++;
                break;
            }
        } while (++i < s.length);

        if (i < s.length - 1)
            return s.substring(i);
        return '';
    }

    public static LeftOf(s: string, c: string): string
    {
        let i = 0;
        if (s.length === 0)
            return '';
        do
        {
            if (s.charAt(i) === c)
                break;
        } while (++i < s.length);

        if (i < s.length)
            return s.substring(0, i);
        return '';
    }

    public static HasFlag(e: number | undefined, flag: number): boolean
    {
        if (e === undefined)
            return false;
        return (e & flag) === flag;
    }

    public static HasAnyFlag(e: number | undefined, flag: number): boolean
    {
        if (e === undefined)
            return false;
        return (e & flag) > 0;
    }

    public static CreateRandomUUID(): string
    {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c)
        {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    public static BestGuessPlatform(): HostPlatform
    {
        let plat: HostPlatform = HostPlatform.Unknown;
        var hasTouch = window.navigator.maxTouchPoints > 0;

        var matches = navigator.userAgent.matchAll(/(Windows)|(Macintosh)|(Chrome)|(Safari)|(Edge)|(iPad)|(Android)/g);
        for (let matchArr of matches)
        {
            var match = matchArr[0];
            if (match === 'Windows')
                plat |= HostPlatform.Windows;
            else if (match === 'Chrome')
            {
                plat |= HostPlatform.Chrome;
                plat &= ~HostPlatform.Safari;
            }
            else if (match === 'Safari')
            {
                if ((plat & HostPlatform.Chrome) as number === 0)
                    plat |= HostPlatform.Safari;
            }
            else if (match === 'Macintosh')
            {
                if (hasTouch)
                    plat |= HostPlatform.iOS;
                else
                    plat |= HostPlatform.MacOS;
            }
            else if (match === 'iPad')
                plat |= HostPlatform.iOS;
            else if (match === 'Android')
                plat |= HostPlatform.Android;
        }

        return plat;
    }

    private static _isMobile?: boolean;
    public static IsMobile(): boolean
    {
        if (this._isMobile === undefined)
        {
            let //safari: boolean = false,
                windows: boolean = false,
                mac: boolean = false,
                chrome: boolean = false,
                //edge: boolean = false,
                iPad: boolean = false,
                android: boolean = false;

            var matches = navigator.userAgent.matchAll(/(Windows)|(Macintosh)|(Chrome)|(Safari)|(Edge)|(iPad)|(Android)/g);
            for (let matchArr of matches)
            {
                var match = matchArr[0];
                if (match === 'Windows')
                    windows = true;
                else if (match === 'Chrome')
                    chrome = true;
                //else if (match === 'Safari')
                //    safari = true;
                else if (match === 'Macintosh')
                    mac = true;
                //else if (match === 'Edge')
                //    edge = true;
                else if (match === 'iPad')
                    iPad = true;
                else if (match === 'Android')
                    android = true;
            }
            var hasTouch = window.navigator.maxTouchPoints > 0;

            Utilities._isMobile =
                (iPad || android) ? true :
                    windows ? false :
                        mac ? hasTouch :
                            false;
        }
        return Utilities._isMobile || false;
    };

    public static Round(input: number, digits: number)
    {
        var n = Math.pow(10, digits);
        return Math.round(input * n + Number.EPSILON) / n;
    }

    public static BoundNumber(input: number, min: number, max: number)
    {
        return Math.min(Math.max(input, min), max);
    }

    public static SelectElementContents (node: HTMLElement)
    {
        const selection = window.getSelection();
        const range = document.createRange();
        if (!range)
            return;
        range.selectNodeContents(node);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    public static escapeHTML(unsafeText: string): string
    {
        let div = document.createElement('div');
        div.innerText = unsafeText;
        return div.innerHTML;
    }

    public static FindParentElement(element: HTMLElement, criteria: (e: HTMLElement) => boolean): HTMLElement|null
    {
        let parent: HTMLElement | null = element;
        while ((parent = parent?.parentElement))
        {
            if (criteria(parent))
                return parent;
        }
        return null;
    }

    /**
     *
     * @param span1
     * @param span2
     * Return values:
     * *** span1 must be the smaller span ***
     * -2 (span1 ends before span2 starts)
     *          111111
     *                      222222
     * -1 (span1 starts before span2 starts but ends before span2 ends)
     *          111111
     *             22222222
     * 0 (span1 entirely within span2)
     *          111111
     *        2222222222
     * +1 (span1 starts after span2 starts and before span2 ends, but ends after span2 ends)
     *          1111111
     *       22222222
     * +2 (span1 entirely after span2)
     *                  111111
     *    22222222
     */
    public static CalculateOverlap(span1: Span, span2: Span): SpanOverlap
    {
        if (span1.End < span2.Start)
            return SpanOverlap.EntirelyBefore;
        else if (span1.Start > span2.End)
            return SpanOverlap.EntirelyAfter;
        else if (span1.Start >= span2.Start && span1.End <= span2.End)
            return SpanOverlap.Within;
        else if (span1.Start < span2.Start)
            return SpanOverlap.PartiallyBefore;
        else
            return SpanOverlap.PartiallyAfter;
    }

    /**
     * Scrolls an element into view only if - and only to the extent -
     * it's not already fully visible.
     * @param element The element
     * @param smooth Whether to smoothly scroll instead of instantaneously.
     */
    public static async SmartScrollIntoView(element: HTMLElement, smooth: boolean)
    {
        var parent = this.FindParentElement(element, (e) =>
        {
            if (!e.style)
                return false;
            return e.style.overflowY === "auto" ||
                e.style.overflowY === "scroll";
        });
        if (!parent)
            return;
        var rc = element.getBoundingClientRect();
        var rp = parent.getBoundingClientRect();

        var y = rc.y - rp.y;        // client's y relative to parent's
        //if (rc.bottom < rp.top || rc.top > rp.bottom)
        //{
        //    // not in view at all; use conventional method
        //    element.scrollIntoView({
        //        behavior: smooth ? "smooth" : "auto",
        //    });
        //}
        //else
            if (y < 0)
        {
            // client's top is too high up; scroll backwards
            parent.scrollBy({
                top: y,
                behavior: smooth ? "smooth" : "auto"
            });
        }
        else if (y > 0 && rc.bottom > rp.bottom)
        {
            parent.scrollBy({
                top: rc.bottom - rp.bottom,
                behavior: smooth ? "smooth" : "auto"
            });
        }
    }

    public static SmartEquals(item1: any, item2: any): boolean
    {
        if (item1?.IsModelObjectReference && item2?.IsModelObjectReference &&
            (item1 as ModelObjectReference).Handle === (item2 as ModelObjectReference).Handle)
            return true;
        return item1 == item2;
    }

    public static SmartGetKey(item): any
    {
        if (!item)
            return "";

        if (item?.IsModelObjectReference)
            return (item as ModelObjectReference).Key.toString();
        else if (typeof (item) === 'number')
            return item;
        else if (item?.key)
            return item.key;
        else if (item?.Key)
            return item.Key;
        else
            return JSON.stringify(item);
    }

    public static GetStringKey(item: any): string
    {
        return `${this.SmartGetKey(item)}`;
    }

    public static SleepAsync(ms): Promise<any>
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public static TicksMSFromDate(date: Date): number
    {
        return date.getTime() + unixTime0MSs;
    }

    public static DateFromTicks(ticksms: number): Date
    {
        // get the ms from Unix Time 0
        var ms = Number(ticksms - unixTime0MSs);
        var dt = new Date();
        dt.setTime(ms);
        return dt;
    }

    public static AddStyleSheet(sheet: string)
    {
        var sh = document.createElement('style')
        sh.innerHTML = sheet;
        document.body.appendChild(sh);
    }

    /**
     * Executes a binary search against a number of sorted items according to a
     * comparer delegate. It is agnostic as to the nature of the items being
     * searched or even whether the items actually exist in a collection, as
     * this information is entrusted to the comparer function. The only requirement
     * is that the items (virtual or otherwise) are sorted.
     * @param comparer The comparer function, which receives an item index to
     * evaluate. The function must return 0 if the item has been located at that
     * index, < 0 if the algorithm should look at a lower index, and > 0 if
     * the algorithm should look at a higher index.
     * @param upperBound The upper bound to search. If the entire set is to
     * be searched, this should be equal to the number of items - 1.
     * @param lowerBound The lower bound to search. When used with upperBound,
     * this allows a narrower search of a collection to be conducted when some
     * boundaries are already known.
     */
    public static SortedBinarySearch(
        comparer: (index: number) => number,
        upperBound: number,
        lowerBound: number = 0)
    {
        if (upperBound === lowerBound)
            return lowerBound;
        let currentIndex = upperBound >> 1;

        do
        {
            let result = comparer(currentIndex);
            if (result == 0)
                return currentIndex;
            else if (result > 0)
                // Need to look higher in the list
                lowerBound = currentIndex;
            else // if (result < 0)
                // Need to look lower in the list
                upperBound = currentIndex;

            let newIndex = lowerBound + ((upperBound - lowerBound) >> 1);
            if (newIndex == currentIndex)
                return currentIndex;
            currentIndex = newIndex;
        } while (true);
    }

    public static GetBrowser(): { Name: string, Version: number }
    {
        // Thanks to https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
        var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1]))
        {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return {
                Name: 'IE',
                Version: (Number.parseFloat(tem[1] || '0'))
            };
        }
        if (M[1] === 'Chrome')
        {
            tem = ua.match(/\bOPR|Edge\/(\d+)/)
            if (tem != null)
            {
                return {
                    Name: 'Opera',
                    Version: (Number.parseFloat(tem[1] || '0'))
                };
            }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
        return {
            Name: M[0],
            Version: (Number.parseFloat(M[1] || '0'))
        };
    }

    public static AdjustOpacity(rgbaString: string | undefined, newValue: number): string
    {
        if (!rgbaString)
            return 'unset';
        return rgbaString.replace(/[\d\.]+\)$/g, `${newValue})`);
    }

    public static CountBindingPath(prop: string): string
    {
        return `${prop}.Count`;
    }
    public static ArrayLengthBindingPath(prop: string): string
    {
        return `${prop}.Length`;
    }
    public static EmptyCountBinding(prop: string, invert?: boolean): Binding
    {
        return new Binding({
            Path: Utilities.CountBindingPath(prop),
            Converter: x => invert ? (x > 0) : !x  //Accept undefined as zero
        });
    }
    public static NonEmptyCountBinding(prop: string): Binding   //More readible shorthand for inverted EmptyCountBinding
    {
        return this.EmptyCountBinding(prop, true);
    }
    public static EmptyArrayLengthBinding(prop: string, invert?: boolean): Binding
    {
        return new Binding({
            Path: Utilities.ArrayLengthBindingPath(prop),
            Converter: x => invert ? (x > 0) : !x  //Accept undefined as zero
        });
    }

    public static SortColumnBinding(prop: string): Binding
    {
        return new Binding(prop + ".SortField");
    }

    public static TrimStringStart(s: string, trim: string)
    {
        if (s.startsWith(trim))
            return s.substring(trim.length);
        return s;
    }

    //Imitation of XAML bindings w/ HasValueConverter using TS converters to allow ConverterParameter
    public static HasValueBinding(path: string, value: any, invert?: boolean)
    {
        return new Binding({
            Path: path,
            Converter: t => invert ? (t != value) : (t == value),
            ConverterBack: (checked: boolean) =>
            {
                if (checked == !invert)
                    return value;
            }
        });
    }

    public static TryReleasePointerCapture(element?: Element|null, pointerId?: number): boolean
    {
        if (pointerId === undefined || !element)
            return false;

        try
        {
            element.releasePointerCapture(pointerId);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public static IsAlphanumeric(char: string): boolean
    {
        if (!char || char.length === 0)
            return false;
        var cd = char.charCodeAt(0);
        if (cd >= 48 && cd <= 57)
            return true;
        return char.toUpperCase() !== char.toLowerCase();
    }

    //Scroll an element smoothly over an awaitable timespan
    public static async SmoothScrollAsync(
        element: HTMLElement,
        dest: number,
        duration: number = 250): Promise<void>
    {
        return await this.ScrollForward(element, dest, element.scrollTop, Date.now(), duration);
    }

    //Corresponds to ContrastColor in Color.cs, which doesn't lend itself to binding
    public static ContrastColor(cssColor: string): string
    {
        const rgb = RGB.ParseCSSColor(cssColor);
        if (!rgb) return '#ffffff';
        const norm = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
        const lum = 0.2126 * norm(rgb.Red) + 0.7152 * norm(rgb.Green) + 0.0722 * norm(rgb.Blue);
        return lum > 0.179 ? '#000000' : '#ffffff';
    }

    private static async ScrollForward(
        element: HTMLElement,
        dest: number,
        origin: number,
        startTime: number,
        duration: number): Promise<void>
    {
        await Utilities.SleepAsync(0);
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const newTop = (dest - origin) * progress + origin;
        element.scrollTo({ top: newTop, behavior: "auto" });

        if (progress < 1)
            return await this.ScrollForward(element, dest, origin, startTime, duration);
    }
}

