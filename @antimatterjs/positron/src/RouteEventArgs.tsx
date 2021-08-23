export class RouteEventArgs
{
    constructor(action: "POP" | "PUSH", location?: string)
    {
        this.Action = action;
        this.Location = location || '/';
    }

    public readonly Action: "POP" | "PUSH";

    public readonly Location: string = '/';
}