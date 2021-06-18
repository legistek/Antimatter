import { FrameworkElement } from "../FrameworkElement";
import { Matrix } from "./Matrix";

class TranslateTransform
{
    public TranslateX: number = 0;
    public TranslateY: number = 0;

    public get Value(): Matrix
    {
        return new Matrix(1, 0, 0, 1, this.TranslateX, this.TranslateY);
    }

    public ToCSS(): string
    {
        if (this.TranslateX === 0 && this.TranslateY === 0)
            return '';
        return `translate(${this.TranslateX}px,${this.TranslateY}px) `;
    }
}

class ScaleTransform
{
    public ScaleX: number = 1;
    public ScaleY: number = 1;

    public get Value(): Matrix
    {
        return new Matrix(
            this.ScaleX,
            0,
            0,
            this.ScaleY,
            0,
            0);
    }

    public ToCSS(): string
    {
        if (this.ScaleX === 1 && this.ScaleY === 1)
            return '';
        return `scale(${this.ScaleX},${this.ScaleY}) `;
    }
}

class RotateTransform
{
    public Angle: number = 0;

    public get Value(): Matrix
    {
        if (this.Angle === 0)
            return new Matrix();
        const sin: number = Math.sin(this.Angle);
        const cos: number = Math.cos(this.Angle);
        return new Matrix(cos, sin, -sin, cos, 0, 0);
    }

    public ToCSS(): string
    {
        if (this.Angle === 0)
            return '';
        return `rotate(${this.Angle}rad) `;
    }
}

export class MultitouchTransform
{
    private _centerX: number = 0;
    private _centerY: number = 0;
    private _committed: Matrix = new Matrix();
    private _pendingTranslation: TranslateTransform = new TranslateTransform();
    private _pendingRotation: RotateTransform = new RotateTransform();
    private _pendingScale: ScaleTransform = new ScaleTransform();

    private _isCSSDirty: boolean = true;
    private _isMatrixDirty: boolean = true;
    private _cachedMatrix: Matrix = new Matrix();
    private _cachedCSS: string = '';
    private _target?: FrameworkElement;

    public get Value(): Matrix
    {
        if (this._isMatrixDirty)
            this.UpdateMatrix();
        return this._cachedMatrix;
    }

    public ToCSS(): string
    {
        if (this._isCSSDirty)
            this.UpdateCSS();
        return this._cachedCSS;
    }

    private UpdateMatrix(): void
    {
        this._cachedMatrix = new Matrix(1, 0, 0, 1, -this.CenterX, -this.CenterY);
        this._cachedMatrix = this._cachedMatrix.Multiply(this._pendingScale.Value);
        this._cachedMatrix = this._cachedMatrix.Multiply(this._pendingRotation.Value);
        this._cachedMatrix = this._cachedMatrix.Multiply(this._pendingTranslation.Value);        
        this._cachedMatrix = this._cachedMatrix.Multiply(new Matrix(1, 0, 0, 1, this.CenterX, this.CenterY));
        this._cachedMatrix = this._cachedMatrix.Multiply(this._committed);
        this._isMatrixDirty = false;
    }

    private UpdateCSS(): void
    {
        this._cachedCSS = `${this._committed.ToCSS()} ` +
            `translate(${this.CenterX}px, ${this.CenterY}px) ` +
            `${this._pendingTranslation.ToCSS()} ` +
            `${this._pendingRotation.ToCSS()} ` +
            `${this._pendingScale.ToCSS()} ` +
            `translate(-${this.CenterX}px, -${this.CenterY}px) `;
        this._isCSSDirty = false;
    }

    public get TranslateX()
    {
        return this._pendingTranslation.TranslateX;
    }
    public set TranslateX(value: number)
    {
        this._pendingTranslation.TranslateX = value;
        this._isCSSDirty = true;
        this._isMatrixDirty = true;
        this._target?.InvalidateRender();
    }

    public get TranslateY()
    {
        return this._pendingTranslation.TranslateY;
    }
    public set TranslateY(value: number)
    {
        this._pendingTranslation.TranslateY = value;
        this._isCSSDirty = true;
        this._isMatrixDirty = true;
        this._target?.InvalidateRender();
    }

    public get Rotation()
    {
        return this._pendingRotation.Angle;
    }
    public set Rotation(value: number)
    {
        this._pendingRotation.Angle = value;
        this._isCSSDirty = true;
        this._isMatrixDirty = true;
        this._target?.InvalidateRender();
    }

    public get ScaleX()
    {
        return this._pendingScale.ScaleX;
    }
    public set ScaleX(value: number)
    {
        this._pendingScale.ScaleX = value;
        this._isCSSDirty = true;
        this._isMatrixDirty = true;
        this._target?.InvalidateRender();
    }

    public get ScaleY()
    {
        return this._pendingScale.ScaleY;
    }
    public set ScaleY(value: number)
    {
        this._pendingScale.ScaleY = value;
        this._isCSSDirty = true;
        this._isMatrixDirty = true;
        this._target?.InvalidateRender();
    }

    public get CenterX()
    {
        return this._centerX;
    }
    public set CenterX(value: number)
    {
        this._centerX = value;        
        this._isCSSDirty = true;
        this._isMatrixDirty = true;
        this._target?.InvalidateRender();
    }

    public get CenterY()
    {
        return this._centerY;
    }
    public set CenterY(value: number)
    {
        this._centerY = value;
        this._isCSSDirty = true;
        this._isMatrixDirty = true;
        this._target?.InvalidateRender();
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
        return Math.sqrt(this.Value.M11 * this.Value.M11 + this.Value.M12 * this.Value.M12);
    }

    public get AbsoluteRotation()
    {
        return Math.atan2(this.Value.M12, this.Value.M11);
    }

    public Reset()
    {
        this._committed = Matrix.Identity;
        this._cachedCSS = '';
        this._centerX = 0;
        this._centerY = 0;
        this._isCSSDirty = false;
        this._isMatrixDirty = false;
        this._pendingScale = new ScaleTransform();
        this._pendingRotation = new RotateTransform();
        this._pendingTranslation = new TranslateTransform();
        this._target?.InvalidateRender();
    }

    public CommitPendingTransformations()
    {
        this._committed = this.Value;
        this._cachedCSS = this._committed.ToCSS();
        this._isCSSDirty = false;
        this._isMatrixDirty = false;
        this._pendingScale = new ScaleTransform();        
        this._pendingRotation = new RotateTransform();
        this._pendingTranslation = new TranslateTransform();
        this._target?.InvalidateRender();
    }

    public AssignTarget(target: FrameworkElement)
    {
        this._target = target;
        target.InvalidateRender();
    }
}