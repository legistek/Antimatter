export class Utilities
{
    public static SleepAsync(ms): Promise<any>
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}