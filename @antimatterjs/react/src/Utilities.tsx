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
}