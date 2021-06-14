import { Matrix } from "./Matrix";

class TranslateTransform
{
    public TranslateX: number = 0;
    public TranslateY: number = 0;

    public get Value(): Matrix
    {
        return new Matrix(1, 0, 0, 1, this.TranslateX, this.TranslateY);
    }
}

class ScaleTransform
{
    public ScaleX: number = 1;
    public ScaleY: number = 1;
    public CenterX: number = 0;
    public CenterY: number = 0;

    public get Value(): Matrix
    {
        return new Matrix(
            this.ScaleX,
            0,
            0,
            this.ScaleY,
            this.CenterX - this.ScaleX * this.CenterX,
            this.CenterY - this.ScaleY * this.CenterY);
    }
}

class RotateTransform
{
    public Angle: number = 0;
    public CenterX: number = 0;
    public CenterY: number = 0;

    public get Value(): Matrix
    {
        const sin: number = Math.sin(this.Angle);
        const cos: number = Math.cos(this.Angle);
        const dx: number = (this.CenterX * (1.0 - cos)) + (this.CenterY * sin);
        const dy: number = (this.CenterY * (1.0 - cos)) - (this.CenterX * sin);
        return new Matrix(cos, sin, -sin, cos, dx, dy);
    }
}

export class MultitouchTransform
{
    private _committed: Matrix = new Matrix();
    private _pendingTranslation: TranslateTransform = new TranslateTransform();
    private _pendingRotation: RotateTransform = new RotateTransform();
    private _pendingScale: ScaleTransform = new ScaleTransform();
    private _isDirty: boolean = true;
    private _cachedValue: Matrix = new Matrix();

    public get Value(): Matrix
    {
        if (this._isDirty)
        {
            this._cachedValue =
                this._committed.Multiply(
                    this._pendingScale.Value.Multiply(
                        this._pendingRotation.Value.Multiply(
                            this._pendingTranslation.Value)));
            this._isDirty = false;
        }
        return this._cachedValue;
    }

    public get TranslateX()
    {
        return this._pendingTranslation.TranslateX;
    }
    public set TranslateX(value: number)
    {
        this._pendingTranslation.TranslateX = value;
        this._isDirty = true;
    }

    public get TranslateY()
    {
        return this._pendingTranslation.TranslateY;
    }
    public set TranslateY(value: number)
    {
        this._pendingTranslation.TranslateY = value;
        this._isDirty = true;
    }

    public get ScaleX()
    {
        return this._pendingScale.ScaleX;
    }
    public set ScaleX(value: number)
    {
        this._pendingScale.ScaleX = value;
        this._isDirty = true;
    }

    public get ScaleY()
    {
        return this._pendingScale.ScaleY;
    }
    public set ScaleY(value: number)
    {
        this._pendingScale.ScaleY = value;
        this._isDirty = true;
    }

    public get CenterX()
    {
        return this._pendingScale.CenterX;
    }
    public set CenterX(value: number)
    {
        this._pendingScale.CenterX = value;
        this._pendingRotation.CenterX = value;
        this._isDirty = true;
    }

    public get CenterY()
    {
        return this._pendingScale.CenterY;
    }
    public set CenterY(value: number)
    {
        this._pendingScale.CenterY = value;
        this._pendingRotation.CenterY = value;
        this._isDirty = true;
    }

    public get AbsoluteX()
    {
        return this.Value.OffsetX;
    }

    public get AbsoluteY()
    {
        return this.Value.OffsetY;
    }

    public get AbsoluteScale()
    {
        return Math.sqrt(this.Value.M11 * this.Value.M11 + this.Value.M22 * this.Value.M22);
    }

    public get AbsoluteRotation()
    {
        return Math.atan2(this.Value.M12, this.Value.M11);
    }

    public CommitPendingTransformations()
    {
        this._committed = this.Value;
        this._pendingScale = new ScaleTransform();        
        this._pendingRotation = new RotateTransform();
        this._pendingTranslation = new TranslateTransform();
    }

    public ToCSS(): string
    {
        return this.Value.ToCSS();
    }
}