const unixTime0Ticks: bigint =
    BigInt(621355968) * BigInt(1000000000);

export class Utilities
{   
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
}