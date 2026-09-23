import { Utilities } from "./Utilities";

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

    public static UnrotateNormalPageCoordinates(pt: Point, angle: number): Point
    {
        if (angle === 90)
            return new Point(pt.Y, 1 - pt.X);
        else if (angle === 180)
            return new Point(1 - pt.Y, 1 - pt.X);
        else if (angle === 270)
            return new Point(1 - pt.Y, pt.X);
        else
            return pt;
    }
}

export class Size
{
    public readonly Width: number = 0;
    public readonly Height: number = 0;

    constructor(width?: number, height?: number)
    {
        if (width !== undefined)
            this.Width = width;
        if (height !== undefined)
            this.Height = height;
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

    public static DoMostlyOverlap(rc1: Rect, rc2: Rect): boolean
    {
        var overlap = (rc1.Left < rc2.Right && rc1.Right > rc2.Left &&
            rc1.Top < rc2.Bottom && rc1.Bottom > rc2.Top);
        if (!overlap)
            return false;

        var overlapRect = Rect.FromLTRB(
            Math.max(rc1.Left, rc2.Left),
            Math.max(rc1.Top, rc2.Top),
            Math.min(rc1.Right, rc2.Right),
            Math.min(rc1.Bottom, rc2.Bottom));

        var overlapArea = overlapRect.Area;
        var areaA = rc1.Area;
        var areaB = rc2.Area;

        return overlapArea >= 0.9 * areaA || overlapArea >= 0.9 * areaB;
    }

    public static Normalizel(rc: Rect, scale: Size): Rect
    {
        return new Rect(rc.X / scale.Width, rc.Y / scale.Height, rc.Width / scale.Width, rc.Height / scale.Height);
    }

    public static Unnormalize(rc: Rect, scale: Size): Rect
    {
        return new Rect(rc.X * scale.Width, rc.Y * scale.Height, rc.Width * scale.Width, rc.Height * scale.Height);
    }

    public static FromLTRB(left: number, top: number, right: number, bottom: number)
    {
        return new Rect(left, top, right - left, bottom - top);
    }

    public static UnrotateNormalPageCoordinates(rc: Rect, angle: number): Rect
    {
        if (angle === 90)
        {
            return Rect.FromLTRB(
                rc.Top,
                1 - rc.Right,
                rc.Bottom,
                1 - rc.Left);
        }
        else if (angle === 180)
        {
            return Rect.FromLTRB(
                1 - rc.Right,
                1 - rc.Bottom,
                1 - rc.Left,
                1 - rc.Top);
        }
        else if (angle === 270)
        {
            return Rect.FromLTRB(
                1 - rc.Bottom,
                rc.Left,
                1 - rc.Top,
                rc.Right);
        }
        else
        {
            return rc;
        }
    }

    public static FromPoints(pt1: Point, pt2: Point, normalize?: boolean)
    {
        if (normalize)
        {
            var left = Math.min(pt1.X, pt2.X);
            var top = Math.min(pt1.Y, pt2.Y);
            var right = Math.max(pt1.X, pt2.X);
            var bottom = Math.max(pt1.Y, pt2.Y);
            return Rect.FromLTRB(left, top, right, bottom);
        }
        else
        {
            return Rect.FromLTRB(pt1.X, pt1.Y, pt2.X, pt2.Y);
        }
    }

    public get Area(): number
    {
        return Math.abs((this.Bottom - this.Top) * (this.Right - this.Left));
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

export class Thickness
{
    public readonly Top: number = 0;
    public readonly Right: number = 0;
    public readonly Bottom: number = 0;
    public readonly Left: number = 0;

    public static readonly Empty: Thickness = new Thickness();

    constructor(top?: number, right?: number, bottom?: number, left?: number)
    {
        if (top !== undefined) this.Top = top;
        if (left !== undefined) this.Left = left;
        if (bottom !== undefined) this.Bottom = bottom;
        if (right !== undefined) this.Right = right;
        Object.freeze(this);
    }

    public Grow(factor: number): Thickness
    {
        return new Thickness(
            this.Top * factor,
            this.Right * factor,
            this.Bottom * factor,
            this.Left * factor);
    }

    public get TotalWidth(): number
    {
        return this.Left + this.Right;
    }

    public get TotalHeight(): number
    {
        return this.Top + this.Bottom;
    }

    public static Equals(a: Thickness, b: Thickness): boolean
    {
        return a.Left === b.Left &&
            a.Top === b.Top &&
            a.Right === b.Right &&
            a.Bottom === b.Bottom;
    }

    public static FromString(s: string): Thickness
    {
        s = s.toLowerCase();
        var splits = s.split(" ");
        for (let i = 0; i < splits.length; i++)
        {
            if (splits[i].endsWith('px'))
                splits[i] = splits[i].substring(0, splits[i].length - 2);
        }
        if (splits.length === 1)
        {
            var size = Number.parseFloat(splits[0]);
            return new Thickness(size, size, size, size);
        }
        else if (splits.length === 2)
        {
            var v = Number.parseFloat(splits[0]);
            var h = Number.parseFloat(splits[1]);
            return new Thickness(v, h, v, h);
        }
        else if (splits.length === 4)
        {
            var t = Number.parseFloat(splits[0]);
            var r = Number.parseFloat(splits[1]);
            var b = Number.parseFloat(splits[2]);
            var l = Number.parseFloat(splits[3]);
            return new Thickness(t, r, b, l);
        }
        else
        {
            return new Thickness();
        }
    }

    public toString(): string
    {
        return `${this.Top}px ${this.Right}px ${this.Bottom}px ${this.Left}px`;
    }
}

export class RGB
{
    public Red: number = 0;
    public Green: number = 0;
    public Blue: number = 0;

    constructor(red?: number, green?: number, blue?: number)
    {
        if (red !== undefined)
            this.Red = red;
        if (green !== undefined)
            this.Green = green;
        if (blue !== undefined)
            this.Blue = blue;
    }

    public static ParseCSSColor(c: string): RGB|undefined
    {
        if (c.startsWith('#'))
        {

            if (c.length !== 7)
                return undefined;

            let rgb: RGB = new RGB();

            if (isNaN(rgb.Red = Number.parseInt(c.substring(1, 3), 16)))
                return undefined;
            if (isNaN(rgb.Green = Number.parseInt(c.substring(3, 5), 16)))
                return undefined;
            if (isNaN(rgb.Blue = Number.parseInt(c.substring(5, 7), 16)))
                return undefined;

            return rgb;
        }
        else if (c.startsWith('rgba') || c.startsWith('rgb'))
        {
            c = Utilities.RightOf(c, '(');
            c = Utilities.LeftOf(c, ')');
            var values = c.split(',');
            if (values.length < 3)
                return undefined;

            let rgb: RGB = new RGB();
            if (isNaN(rgb.Red = Number.parseInt(values[0])))
                return undefined;
            if (isNaN(rgb.Green = Number.parseInt(values[1])))
                return undefined;
            if (isNaN(rgb.Blue = Number.parseInt(values[2])))
                return undefined;

            return rgb;
        }
    }

    public static RGBFromHue(hue: number): RGB
    {
        const x = hue / 360;
        if (x < 0.166666)
        {
            return new RGB(255, 255 * x / 0.166666, 0);
        }
        else if (x < 0.333333)
        {
            return new RGB(
                255 * (0.333333 - x) / 0.166666,
                255,
                0);
        }
        else if (x < 0.5)
        {
            return new RGB(
                0,
                255,
                255 * (x - 0.333333) / 0.166666);;
        }
        else if (x < 0.666666)
        {
            return new RGB(
                0,
                255 * (0.666666 - x) / 0.166666,
                255);
        }
        else if (x < 0.833333)
        {
            return new RGB(
                255 * (x - 0.666666) / 0.166666,
                0,
                255);
        }
        else if (x <= 1)
        {
            return new RGB(
                255,
                0,
                255 * (1 - x) / 0.166666);
        }
        else
        {
            return new RGB(255, 255, 255);
        }
    }

    public get Luminance(): number
    {
        var red = this.Red / 255;
        var green = this.Green / 255;
        var blue = this.Blue / 255;

        var cmax = Math.max(red, green, blue);
        var cmin = Math.min(red, green, blue);

        return cmax + cmin;
    }

    public get Hue(): number
    {
        var red = this.Red / 255;
        var green = this.Green / 255;
        var blue = this.Blue / 255;

        var cmax = Math.max(red, green, blue);
        var cmin = Math.min(red, green, blue);
        var delta = cmax - cmin;

        let hue: number = 0;
        if (delta === 0)
            hue = 0;
        else if (cmax === red)
            hue = 60 * ((green - blue) / delta);
        else if (cmax === green)
            hue = 60 * ((blue - red) / delta + 2);
        else // if (cmax === blue)
            hue = 60 * ((red - green) / delta + 4);

        if (hue < 0)
            hue += 360;

        return hue;
    }

    public get CSSValue(): string
    {
        return `#${this.Red.toString(16).padStart(2, '0')}${this.Green.toString(16).padStart(2, '0')}${this.Blue.toString(16).padStart(2, '0')}`;
    }

    public AdjustBrightness(adjustment: number)
    {
        if (adjustment > 0)
        {
            this.Red = this.Truncate(this.Red + ((255.0 - this.Red) * adjustment));
            this.Green = this.Truncate(this.Green + ((255.0 - this.Green) * adjustment));
            this.Blue = this.Truncate(this.Blue + ((255.0 - this.Blue) * adjustment));
        }
        else
        {
            adjustment = 1 - Math.abs(adjustment);
            this.Red = this.Truncate(this.Red * adjustment);
            this.Green = this.Truncate(this.Green * adjustment);
            this.Blue = this.Truncate(this.Blue * adjustment);
        }
    }

    private Truncate(value: number): number
    {
        if (value < 0) return 0;
        else if (value > 255) return 255;
        else return value;
    }
}
