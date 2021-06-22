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
        else if (item?.IsModelObjectReference)
            return (item as ModelObjectReference).Key;
        return item;
    }

    public static SleepAsync(ms): Promise<any>
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    //Converts server-compatible UTC ticks format to app-compatible local-time JS Date format
    public static DateFromTicks(ticks: bigint): Date
    {
        // get the ms from Unix Time 0
        const ms: number = Number((ticks - unixTime0Ticks) / BigInt(10000));
        const utc: Date = new Date(ms);
        const offset: number = utc.getTimezoneOffset() * 60 * 1000;
        return new Date(ms + offset);
    }

    //Supposed to return bigint type, but that currently gives serialization error, so for now sneak in a number instead
    public static TicksFromDate(local: Date): any
    {
        const offset: number = local.getTimezoneOffset() * 60 * 1000;
        const ms: number = local.getTime() - offset;
        //return (BigInt(ms) * BigInt(10000)) + unixTime0Ticks;

        const ticks: bigint = (BigInt(ms) * BigInt(10000)) + unixTime0Ticks;
        return Number(ticks);
    }

    public static AddStyleSheet(sheet: string)
    {
        var sh = document.createElement('style')
        sh.innerHTML = sheet;
        document.body.appendChild(sh);
    }
}