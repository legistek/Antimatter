import * as React from "react";
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from "../FrameworkElement";
import { ManipulationEvent, ManipulationEventArgs } from "./ManipulationEventArgs";

export class ManipulationHelper
{
    private _isPotentiallyManipulating: boolean = false;
    private _isManipulating: boolean = false;
    private _pointerCache: PointerEvent[] = [];
    private _translate: TranslateTracker = new TranslateTracker();
    private _scale: ScaleTracker = new ScaleTracker();
    private _parent: FrameworkElement<IFrameworkElementProps, IFrameworkElementState>;

    constructor(parent: FrameworkElement)
    {
        this._parent = parent;
    }

    public OnPointerDown(event: PointerEvent): void
    {
        this._pointerCache.push(event);
        this._isPotentiallyManipulating = true;

        if (this._pointerCache.length === 1)
        {
            this._translate = new TranslateTracker();
            this._scale = new ScaleTracker();

            // The first pointer is down; record the X, Y for translation only
            this._translate.Commit(event.pageX, event.pageY);

            if (this._parent.state.OnManipulationStarting)
            {
                var me = new ManipulationEventArgs(ManipulationEvent.Starting, event);
                this._parent.state.OnManipulationStarting(me);
            }
        }
        else if (this._pointerCache.length === 2)
        {
            // A scale operation has begun
            var ev1 = this._pointerCache[0];
            var ev2 = this._pointerCache[1];

            // Get the absolute pointer distance at the time the second pointer goes down;
            // this is the baseline for scale
            this._scale.PendingBasePixelDistance =
                this._scale.LastPixelDistance =
                this.GetEventDistance(ev1, ev2); // / this._cumulativeScale; // ??

            // Reset translation using a new centerpoint reference
            this._translate.Commit(
                (ev1.pageX + ev2.pageX) / 2,
                (ev1.pageY + ev2.pageY) / 2);
        }        
    }

    public OnPointerMove(event: PointerEvent): void
    {
        if (!this._isPotentiallyManipulating || this._pointerCache.length === 0)
            return;

        if (this._isPotentiallyManipulating &&
            !this._isManipulating &&
            this._parent.state.OnManipulationStarted)
        {
            var startedArgs = new ManipulationEventArgs(ManipulationEvent.Started, event);
            if (this._pointerCache.length === 1)
            {
                this._scale.CenterX = this._pointerCache[0].clientX;
                this._scale.CenterY = this._pointerCache[0].clientY;
            }
            else
            {
                this._scale.CenterX = (this._pointerCache[0].clientX + this._pointerCache[1].clientX) / 2;
                this._scale.CenterY = (this._pointerCache[0].clientY + this._pointerCache[1].clientY) / 2;
            }
            startedArgs.CenterX = this._scale.CenterX;
            startedArgs.CenterY = this._scale.CenterY;
            this._parent.state.OnManipulationStarted(startedArgs);
        }
        
        this._isManipulating = true;
        this._parent.Container?.setPointerCapture(event.pointerId);
        var captured = this._parent.Container?.hasPointerCapture(event.pointerId);
        event.stopPropagation();
        event.preventDefault();

        // Find this event in the cache and update its record with this event
        for (var i = 0; i < this._pointerCache.length; i++)
        {
            if (event.pointerId == this._pointerCache[i].pointerId)
            {
                this._pointerCache[i] = event;
                break;
            }
        }

        let deltaX = 0;
        let deltaY = 0;        
        let deltaScale = 1;
        let centerX = 0;
        let centerY = 0;
        if (this._pointerCache.length > 1)
        {
            // scale (and translation?)
            var ev1 = this._pointerCache[0];
            var ev2 = this._pointerCache[1];

            var newDistance = this.GetEventDistance(ev1, ev2);
            deltaScale = newDistance / this._scale.LastPixelDistance;
            this._scale.PendingCumScale = newDistance / this._scale.PendingBasePixelDistance;

            // Compute center point based on average of two points
            centerX = (ev1.pageX + ev2.pageX) / 2;
            centerY = (ev1.pageY + ev2.pageY) / 2;
        }
        else
        {
            // just translation!
            centerX = this._pointerCache[0].pageX;
            centerY = this._pointerCache[0].pageY;
        }
                    
        deltaX = centerX - this._translate.LastX;
        deltaY = centerY - this._translate.LastY;
        this._translate.PendingCumX = centerX - this._translate.PendingOriginX;
        this._translate.PendingCumY = centerY - this._translate.PendingOriginY;
        this._translate.LastX = centerX;
        this._translate.LastY = centerY;            
        
        if (this._parent.state.OnManipulationDelta)
        {
            const args: ManipulationEventArgs = new ManipulationEventArgs(
                ManipulationEvent.Delta,
                event);
            args.CenterX = this._scale.CenterX;
            args.CenterY = this._scale.CenterY;
            args.DeltaX = deltaX;
            args.DeltaY = deltaY;
            args.CumulativeX = this._translate.CommittedCumX + this._translate.PendingCumX;
            args.CumulativeY = this._translate.CommittedCumY + this._translate.PendingCumY;
            args.DeltaScale = deltaScale;
            args.CumulativeScale = this._scale.CommittedCumScale * this._scale.PendingCumScale;
            this._parent.state.OnManipulationDelta(args);
        }       
    }

    public OnPointerUp(event: PointerEvent): void
    {
        if (!this.RemovePointerEvent(event))
            // We weren't tracking this one anyway
            return;

        if (!this._isManipulating)
            return;

        this._parent.Container?.releasePointerCapture(event.pointerId);

        if (this._pointerCache.length === 0)
        {
            this._isManipulating = false;
            this._isPotentiallyManipulating = false;
            if (this._parent.state.OnManipulationCompleted)
            {
                var me = new ManipulationEventArgs(ManipulationEvent.Completed, event);
                this._parent.state.OnManipulationCompleted(me);
            }
        }
        else if (this._pointerCache.length === 1)
        {
            // a scale operation has completed; we're down to just a
            // translation using 1 point
            this._scale.Commit();
            this._translate.Commit(
                this._pointerCache[0].pageX,
                this._pointerCache[0].pageY);
        }
    }

    private RemovePointerEvent(ev: PointerEvent): boolean
    {
        for (var i = 0; i < this._pointerCache.length; i++)
        {
            if (this._pointerCache[i].pointerId == ev.pointerId)
            {
                this._pointerCache.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    private GetEventDistance(e1: PointerEvent, e2: PointerEvent)
    {
        var x1 = e1.pageX;
        var y1 = e1.pageY;
        var x2 = e2.pageX;
        var y2 = e2.pageY;
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
}

// All these must be in SCREEN (untransformed) pixels to work correctly
class TranslateTracker
{
    public PendingOriginX: number = 0;  
    public PendingOriginY: number = 0;
    public LastX: number = 0;
    public LastY: number = 0;
    public PendingCumX: number = 0;
    public PendingCumY: number = 0;
    public CommittedCumX: number = 0;
    public CommittedCumY: number = 0;

    public Commit(centerX: number, centerY: number)
    {
        this.CommittedCumX += this.PendingCumX;
        this.CommittedCumY += this.PendingCumY;
        this.PendingCumX = 0;
        this.PendingCumY = 0;        
        this.PendingOriginX = this.LastX = centerX;
        this.PendingOriginY = this.LastY = centerY;
    }
}

class ScaleTracker
{
    public PendingBasePixelDistance: number = 0;
    public LastPixelDistance: number = 0;
    public PendingCumScale: number = 1;
    public CommittedCumScale: number = 1;
    public CenterX: number = 0;
    public CenterY: number = 0;

    public Commit()
    {
        this.PendingBasePixelDistance = 0;
        this.CommittedCumScale *= this.PendingCumScale;
        this.PendingCumScale = 1;
        this.LastPixelDistance = 0;
    }
}