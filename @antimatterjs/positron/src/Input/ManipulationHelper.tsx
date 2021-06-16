import { raiseClick } from "@fluentui/utilities";
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

            // Get the absolute pointer distance at the time the second 
            // pointer goes down; this is the baseline for scale
            this._scale.PendingBasePixelDistance =
                this._scale.LastPixelDistance =
                this.GetEventDistance(ev1, ev2);

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
            var rc = this._parent.Container?.getBoundingClientRect();
            if (rc)
            {                
                if (this._pointerCache.length === 1)
                {
                    this._scale.CenterX = this._pointerCache[0].clientX - rc.left;
                    this._scale.CenterY = this._pointerCache[0].clientY - rc.top;
                }
                else
                {
                    this._scale.CenterX = (this._pointerCache[0].clientX + this._pointerCache[1].clientX) / 2 - rc.left;
                    this._scale.CenterY = (this._pointerCache[0].clientY + this._pointerCache[1].clientY) / 2 - rc.top;
                }
                startedArgs.CenterX = this._scale.CenterX;
                startedArgs.CenterY = this._scale.CenterY;
            }
            this._parent.state.OnManipulationStarted(startedArgs);
        }
        
        this._isManipulating = true;
        this._parent.Container?.setPointerCapture(event.pointerId);

        // Once confirmed manipulation has begun stop propagation         
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

        const args: ManipulationEventArgs = new ManipulationEventArgs(
            ManipulationEvent.Delta,
            event);
        
        let centerX = 0;
        let centerY = 0;
        if (this._pointerCache.length > 1)
        {
            // scale (and translation?)
            var ev1 = this._pointerCache[0];
            var ev2 = this._pointerCache[1];

            var newDistance = this.GetEventDistance(ev1, ev2);
            args.DeltaScale = newDistance / this._scale.LastPixelDistance;
            this._scale.PendingCumulativeScale = newDistance / this._scale.PendingBasePixelDistance;

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

        args.DeltaX = centerX - this._translate.LastX;
        args.DeltaY = centerY - this._translate.LastY;
        this._translate.PendingCumulativeX = centerX - this._translate.PendingOriginX;
        this._translate.PendingCumulativeY = centerY - this._translate.PendingOriginY;
        this._translate.LastX = centerX;
        this._translate.LastY = centerY;            
        
        if (this._parent.state.OnManipulationDelta)
        {
            args.CenterX = this._scale.CenterX;
            args.CenterY = this._scale.CenterY;            
            args.CumulativeX = this._translate.CommittedCumulativeX + this._translate.PendingCumulativeX;
            args.CumulativeY = this._translate.CommittedCumulativeY + this._translate.PendingCumulativeY;
            args.CumulativeScale = this._scale.CommittedCumulativeScale * this._scale.PendingCumulativeScale;
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
    public PendingCumulativeX: number = 0;
    public PendingCumulativeY: number = 0;
    public CommittedCumulativeX: number = 0;
    public CommittedCumulativeY: number = 0;

    public Commit(centerX: number, centerY: number)
    {
        this.CommittedCumulativeX += this.PendingCumulativeX;
        this.CommittedCumulativeY += this.PendingCumulativeY;
        this.PendingCumulativeX = 0;
        this.PendingCumulativeY = 0;        
        this.PendingOriginX = this.LastX = centerX;
        this.PendingOriginY = this.LastY = centerY;
    }
}

class ScaleTracker
{
    public PendingBasePixelDistance: number = 0;
    public LastPixelDistance: number = 0;
    public PendingCumulativeScale: number = 1;
    public CommittedCumulativeScale: number = 1;
    public CenterX: number = 0;
    public CenterY: number = 0;

    public Commit()
    {
        this.PendingBasePixelDistance = 0;
        this.CommittedCumulativeScale *= this.PendingCumulativeScale;
        this.PendingCumulativeScale = 1;
        this.LastPixelDistance = 0;
    }
}