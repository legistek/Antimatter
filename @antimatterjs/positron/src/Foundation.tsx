export class Point
{
    public readonly X: number = 0;
    public readonly Y: number = 0;

    constructor(x?: number, y?: number)
    {
        if (x !== undefined)
            this.X = x;
        if (y !== undefined)
            this.Y = y;
        Object.freeze(this);
    }
}

export interface Span
{
    Start: number,
    End: number
}

export class Rect
{
    public readonly X: number = 0;
    public readonly Y: number = 0;
    public readonly Width: number = 0;
    public readonly Height: number = 0;

    constructor(x?: number, y?: number, width?: number, height?: number)
    {
        if (x !== undefined) this.X = x;
        if (y !== undefined) this.Y = y;
        if (width !== undefined) this.Width = width;
        if (height !== undefined) this.Height = height;
        Object.freeze(this);
    }

    public get Left(): number
    {
        return this.X;
    }

    public get Right(): number
    {
        return this.X + this.Width;
    }

    public get Top(): number
    {
        return this.Y;
    }

    public get Bottom(): number
    {
        return this.Y + this.Height;
    }

    public get TopLeft(): Point
    {
        return new Point(this.Left, this.Top);
    }

    public get TopRight(): Point
    {
        return new Point(this.Right, this.Top);
    }

    public get BottomLeft(): Point
    {
        return new Point(this.Left, this.Bottom);
    }

    public get BottomRight(): Point
    {
        return new Point(this.Right, this.Bottom);
    }
}