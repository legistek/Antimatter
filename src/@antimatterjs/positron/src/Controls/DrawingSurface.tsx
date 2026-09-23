import * as React from 'react';
import { Binding, Event, ModelObjectReference, Size, Utilities } from '@antimatterjs/react';

import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { IPanelState, PanelBase, IPanelProps } from './Panel';

export interface IDrawingSurfaceProps extends IPanelProps
{
    RenderCommand?: ModelObjectReference | Binding;    
}

export class DrawingSurfaceBase<P extends IDrawingSurfaceProps = {}, S extends IPanelState = {}> extends PanelBase<P, S>
{
    constructor(props)
    {
        super(props);
        this._handle = DrawingSurfaceBase._nextHandle++;
    }

    override renderElement()
    {
        return (
            <svg
                ref={r =>
                {
                    if (!r || r === this._canvas)
                        return;
                    this._canvas = r;
                    this.RegisterCanvas();
                    this.ForceBoundRender();
                }} />
        );
    }

    override getCSSStyles()
    {
        var styles = super.getCSSStyles();
        styles.pointerEvents = "none";
        return styles;
    }

    override OnComponentWillUnmount()
    {
        super.OnComponentWillUnmount();
        DrawingSurfaceBase._canvasStore.delete(this._handle);
        DrawingSurfaceBase._svgStore.delete(this._handle);
    }

    public get RenderCommand(): ModelObjectReference | undefined
    {
        //this._context?.clearRect(0, 0, this.ActualWidth, this.ActualHeight);
        return this.GetValue(nameof(this.props.RenderCommand));
    }       

    override get ObserveResize(): boolean
    {
        return true;
    }

    override OnInvalidateRender()
    {
        super.OnInvalidateRender(false);
        this.ForceBoundRender();
    }

    private ForceBoundRender()
    {
        if (!this._canvas)
            return;        
        this._canvas.innerHTML = "";
        if (this.RenderCommand)
            this.ExecuteCommand(this.RenderCommand, this._handle);                
    }

    public override OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.IsVisible) && value)
        {
            this.InvalidateRender();
        }
        super.OnBoundPropertyUpdate(property, value, oldValue);
    }

    override OnResize()
    {
        this.InvalidateRender();
    }

    private RegisterCanvas(): void
    {
        if (!this._canvas)
            return;
        DrawingSurfaceBase._svgStore.set(this._handle, this._canvas);
        //var ctx = this._canvas.getContext("2d");
        //if (!ctx)
        //    return;
        //DrawingSurfaceBase._canvasStore.set(this._handle, ctx);
    }


    public static GetSize(
        args: {
            handle: number
        })
    {
        var ctx = DrawingSurfaceBase._svgStore.get(args.handle);
        if (!ctx)
            return;
        return new Size(ctx.clientWidth, ctx.clientHeight);
    }

    public static AppendInnerHtml(
        args: {
            handle: number,
            innerHTML: string
        })
    {
        var svg = DrawingSurfaceBase._svgStore.get(args.handle);
        if (!svg)
            return;
        svg.innerHTML = (svg.innerHTML || "") + args.innerHTML;
    }

    public static DrawRect(
        args: {
            handle: number,
            x: number,
            y: number,
            width: number,
            height: number,
            borderWidth: number,
            borderColor: string,
            fill: string|number|undefined
        })
    {
        var ctx = DrawingSurfaceBase._canvasStore.get(args.handle);
        if (!ctx)
            return;

        ctx.lineWidth = args.borderWidth;
        ctx.strokeStyle = args.borderColor;
        
        if (args.fill)
        {
            if (typeof (args.fill) === "string")
                ctx.fillStyle = args.fill;
            ctx.fillRect(args.x, args.y, args.width, args.height);
        }
        else
        {
            ctx.strokeRect(args.x, args.y, args.width, args.height);
        }

        return 50;
    }

    public static MeasureString(
        args: {
            text: string,
            font: string,
            ascentOnly: boolean,
        }) : Size
    {        
        var ctx = DrawingSurfaceBase._measuringCtx;
        if (!ctx)
            return new Size();
        ctx.font = args.font;
        var metrics = ctx.measureText(args.text);
        return new Size(
            metrics.width,
            metrics.fontBoundingBoxAscent + (args.ascentOnly ? 0 : metrics.fontBoundingBoxDescent)
            // + metrics.actualBoundingBoxDescent
        );
    }

    public static DrawLine(        
        args: {
            handle: number,
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            thickness: number,
            color: string
        })
    {
        var ctx = DrawingSurfaceBase._canvasStore.get(args.handle);
        if (!ctx)
            return;
        ctx.moveTo(args.x1, args.y1);
        ctx.lineWidth = args.thickness;
        ctx.lineTo(args.x2, args.y2);
        ctx.strokeStyle = args.color;
        ctx.stroke();
        
        return "hobo";
    }

    public static DrawString(
        args: {
            handle: number,
            x: number,
            y: number,
            text: string,
            font: string,
            fill: string,
        })
    {
        var ctx = DrawingSurfaceBase._canvasStore.get(args.handle);
        if (!ctx)
            return;
        ctx.moveTo(args.x, args.y);
        ctx.font = args.font;
        ctx.fillStyle = args.fill;
        ctx.fillText(args.text, args.x, args.y);

        return 3.14159;
    }

    public static CreateGradientBrush()
    {

    }

    private _canvas?: SVGSVGElement | null;
    private _handle: number;
    private static _measuringCanvas = document.createElement("canvas");
    private static _measuringCtx = DrawingSurfaceBase._measuringCanvas.getContext("2d");
    private static _canvasStore = new Map<number, CanvasRenderingContext2D>();
    private static _svgStore = new Map <number, SVGSVGElement> ();
    private static _nextHandle: number = 0;
}

export class DrawingSurface extends DrawingSurfaceBase<IDrawingSurfaceProps, IPanelState>
{
}

(window as any).AmxDrawingSurface = DrawingSurfaceBase;