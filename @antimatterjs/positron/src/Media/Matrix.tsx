/** 
Derived from  https://github.com/dotnet/wpf
The MIT License (MIT)

Copyright (c) .NET Foundation and Contributors

All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { Point } from "./Point";

export class Matrix
{
    private _isIdentity: boolean = true;
    private _isTranslationOnly: boolean = true;
    private _isNotRotated = true;
    private _m11: number = 1;
    private _m12: number = 0;
    private _m21: number = 0;
    private _m22: number = 1;
    private _offsetX: number = 0;
    private _offsetY: number = 0;

    constructor(m11?: number, m12?: number, m21?: number, m22?: number, offsetX?: number, offsetY?: number)
    {
        this.M11 = m11 || 1;
        this.M12 = m12 || 0;
        this.M21 = m21 || 0;
        this.M22 = m22 || 1;
        this.OffsetX = offsetX || 0;
        this.OffsetY = offsetY || 0;
    }

    public get M11(): number
    {
        return this._m11;
    }
    public set M11(value: number)
    {
        this._m11 = value;
        this._isIdentity = false;
        this._isTranslationOnly = false;
    }

    public get M12(): number
    {
        return this._m12;
    }
    public set M12(value: number)
    {
        this._m12 = value;
        this._isIdentity = false;
        this._isTranslationOnly = false;
        this._isNotRotated = false;
    }

    public get M21(): number
    {
        return this._m21;
    }
    public set M21(value: number)
    {
        this._m21 = value;
        this._isIdentity = false;
        this._isTranslationOnly = false;
        this._isNotRotated = false;
    }

    public get M22(): number
    {
        return this._m22;
    }
    public set M22(value: number)
    {
        this._m22 = value;
        this._isIdentity = false;
        this._isTranslationOnly = false;
    }

    public get OffsetX()
    {
        return this._offsetX;
    }
    public set OffsetX(value: number)
    {
        this._offsetX = value;
        this._isIdentity = false;
    }

    public get OffsetY()
    {
        return this._offsetY;
    }
    public set OffsetY(value: number)
    {
        this._offsetY = value;
        this._isIdentity = false;
    }

    public get Determinant(): number
    {
        if (this._isIdentity || this._isTranslationOnly)
            return 1.0;
        return (this._m11 * this._m22) - (this._m12 * this._m21);
    }
    
    public static get Identity(): Matrix 
    {
        return new Matrix();
    }

    public TransformPoint(pt: Point): Point
    {
        var xadd = pt.Y * this._m21 + this._offsetX;
        var yadd = pt.X * this._m12 + this._offsetY;

        return {
            X: pt.X * this._m11 + xadd,
            Y: pt.Y * this._m22 + yadd
        };
    }

    public Multiply(matrix2: Matrix): Matrix
    {
        var matrix1 = this;

        if (matrix2._isIdentity)
        {
            return new Matrix(matrix1._m11, matrix1._m12, matrix1._m21, matrix1._m22, matrix1._offsetX, matrix1._offsetY);
        }
        else if (!matrix1._isNotRotated && !matrix2._isNotRotated)
        {
            return new Matrix(
                matrix1._m11 *= matrix2._m11,
                0,
                0,
                matrix1._m22 *= matrix2._m22,
                matrix2._m11 * matrix1._offsetX + matrix2._offsetX,
                matrix2._m22 * matrix1._offsetY + matrix2._offsetY);
        }
        else
        {
            return new Matrix(
                matrix1._m11 * matrix2._m11 + matrix1._m12 * matrix2._m21,
                matrix1._m11 * matrix2._m12 + matrix1._m12 * matrix2._m22,

                matrix1._m21 * matrix2._m11 + matrix1._m22 * matrix2._m21,
                matrix1._m21 * matrix2._m12 + matrix1._m22 * matrix2._m22,

                matrix1._offsetX * matrix2._m11 + matrix1._offsetY * matrix2._m21 + matrix2._offsetX,
                matrix1._offsetX * matrix2._m12 + matrix1._offsetY * matrix2._m22 + matrix2._offsetY);
        }
    }

    public ToCSS(): string
    {
        return `matrix(${this.M11},${this.M12},${this.M21},${this.M22},${this.OffsetX},${this.OffsetY})`;
    }
}