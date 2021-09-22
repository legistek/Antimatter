import { release } from "os";
import { ModelObjectReference } from "./ModelObjectReference";

const unixTime0MSs: number = 62135596800000;

export class Utilities
{
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
            return item?.toString();
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
}