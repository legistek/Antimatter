import { release } from "os";
import { ModelObjectReference } from "./ModelObjectReference";

const unixTime0Ticks: bigint =
    BigInt(621355968) * BigInt(1000000000);

export class Utilities
{
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
            return (item as ModelObjectReference).Handle.toString();
        else if (typeof (item) === 'number')
            return item;
        else if (item?.key)
            return item.key;
        else
            return item?.toString();
    }

    public static SleepAsync(ms): Promise<any>
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public static DateFromTicks(ticks: bigint): Date
    {
        // get the ms from Unix Time 0
        var ms = Number((ticks - unixTime0Ticks) / BigInt(10000));

        return new Date(ms);
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
     * this information is entrusted to the comparer function.
     * @param count The number of items being searched.
     * @param comparer The comparer function, which receives an item index to
     * evaluate. The function must return 0 if the item has been located at that 
     * index, < 0 if the algorithm should look at a lower index, and > 0 if
     * the algorithm should look at a higher index.
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
}