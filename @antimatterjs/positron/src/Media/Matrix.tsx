/** 
Portions derived from  https://github.com/dotnet/wpf
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

import { Point } from "../Foundation";

/** Represents a matrix for performing 2D transformations. 
 * This object is immutable and frozen after creation. */
export class Matrix
{
    public static readonly Identity: Matrix = new Matrix();

    public readonly M11: number = 1;
    public readonly M12: number = 0;
    public readonly M21: number = 0;
    public readonly M22: number = 1;
    public readonly OffsetX: number = 0;
    public readonly OffsetY: number = 0;

    constructor(m11?: number, m12?: number, m21?: number, m22?: number, offsetX?: number, offsetY?: number)
    {
        if (m11 && m11 !== 1)
        {
            this.M11 = m11;
            this._isIdentity = false;
            this._isTranslationOnly = false;
        }
        if (m12 !== undefined && m12 !== 0)
        {
            this.M12 = m12;            
            this._isIdentity = false;
            this._isTranslationOnly = false;
            this._isNotRotated = false;
        }
        if (m21 !== undefined && m21 !== 0)
        {
            this.M21 = m21;
            this._isIdentity = false;
            this._isTranslationOnly = false;
            this._isNotRotated = false;
        }
        if (m22 && m22 !== 1)
        {
            this.M22 = m22;
            this._isIdentity = false;
            this._isTranslationOnly = false;
        }

        if (offsetX !== undefined && offsetX !== 0)
        {
            this.OffsetX = offsetX;
            this._isIdentity = false;
        }
        if (offsetY !== undefined && offsetY !== 0)
        {
            this.OffsetY = offsetY;
            this._isIdentity = false;
        }

        Object.freeze(this);
    }
    
    public get Determinant(): number
    {
        if (this._isIdentity || this._isTranslationOnly)
            return 1.0;
        return (this.M11 * this.M22) - (this.M12 * this.M21);
    }
    
    public TransformPoint(pt: Point): Point
    {
        var xadd = pt.Y * this.M21 + this.OffsetX;
        var yadd = pt.X * this.M12 + this.OffsetY;

        return {
            X: pt.X * this.M11 + xadd,
            Y: pt.Y * this.M22 + yadd
        };
    }

    public Multiply(matrix2: Matrix): Matrix
    {
        var matrix1 = this;

        if (matrix2._isIdentity)
        {
            return matrix1;
        }
        else if (!matrix1._isNotRotated && !matrix2._isNotRotated)
        {
            return new Matrix(
                matrix1.M11 * matrix2.M11,
                0,
                0,
                matrix1.M22 * matrix2.M22,
                matrix2.M11 * matrix1.OffsetX + matrix2.OffsetX,
                matrix2.M22 * matrix1.OffsetY + matrix2.OffsetY);
        }
        else
        {
            return new Matrix(
                matrix1.M11 * matrix2.M11 + matrix1.M12 * matrix2.M21,
                matrix1.M11 * matrix2.M12 + matrix1.M12 * matrix2.M22,

                matrix1.M21 * matrix2.M11 + matrix1.M22 * matrix2.M21,
                matrix1.M21 * matrix2.M12 + matrix1.M22 * matrix2.M22,

                matrix1.OffsetX * matrix2.M11 + matrix1.OffsetY * matrix2.M21 + matrix2.OffsetX,
                matrix1.OffsetX * matrix2.M12 + matrix1.OffsetY * matrix2.M22 + matrix2.OffsetY);
        }
    }

    public ToCSS(): string
    {
        if (this._isIdentity)
            return '';
        return `matrix(${this.M11},${this.M12},${this.M21},${this.M22},${this.OffsetX},${this.OffsetY}) `;
    }

    private _isIdentity: boolean = true;
    private _isTranslationOnly: boolean = true;
    private _isNotRotated = true;
}