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
    private _manipulationStartTime: number = 0;
    private _manipulationLastTime: number = 0;
    private static readonly _holdingTimeMS: number = 500;
    private static readonly _holdingDistanceThreshold: number = 10;
    private _holdingTimer?: any;    
    private _velocityX: number = 0;
    private _velocityY: number = 0;

    constructor(parent: FrameworkElement)
    {
        this._parent = parent;
    }

    public get IsManipulating(): boolean
    {
        return this._isManipulating;
    }

    public get IsTouchEnabled(): boolean
    {
        return this._parent?.IsTouchManipulationEnabled || false;
    }

    public get IsMouseEnabled(): boolean
    {
        return this._parent?.IsMouseManipulationEnabled || false;
    }

    public OnTouchBegin(event: React.TouchEvent): void
    {
        //if (!this.CheckPointerType(event))
            //return;

        //var touch = event.touches.item(0);
        this._velocityX = 0;
        this._velocityY = 0;
        //this._touchCache.push(touch);
        this._isPotentiallyManipulating = true;

        this._manipulationStartTime = new Date().getTime();

        if (event.touches.length === 1)
        {
            var touch = event.touches.item(0);
            this._translate = new TranslateTracker();
            this._scale = new ScaleTracker();

            // The first pointer is down; record the X, Y for translation only
            this._translate.Commit(touch.pageX, touch.pageY);

            var me = new ManipulationEventArgs(ManipulationEvent.Starting, this._parent.Container as HTMLElement, touch);
            this._parent.OnManipulationStarting(me);

            this._holdingTimer = setTimeout(() =>
            {
                this._holdingTimer = undefined;
                this._parent.OnManipulationHolding(
                    new ManipulationEventArgs(ManipulationEvent.Holding, this._parent.Container as HTMLElement, touch));
            }, ManipulationHelper._holdingTimeMS);
        }
        else if (event.touches.length === 2)
        {
            // A scale operation has begun
            var ev1 = event.touches.item(0);
            var ev2 = event.touches.item(1);

            // Get the absolute pointer distance at the time the second 
            // pointer goes down; this is the baseline for scale
            this._scale.PendingBasePixelDistance =
                this._scale.LastPixelDistance =
                this.GetTouchDistance(ev1, ev2);

            // Reset translation using a new centerpoint reference
            this._translate.Commit(
                (ev1.pageX + ev2.pageX) / 2,
                (ev1.pageY + ev2.pageY) / 2);

            // Once confirmed manipulation has begun stop propagation         
            event.stopPropagation();
            event.preventDefault();
        }
    }

    public OnTouchMove(event: React.TouchEvent): void
    {
        //if (!this.CheckPointerType(event))
        //    return;
        if (!this._isPotentiallyManipulating || event.touches.length === 0)
            return;        

        var touch1 = event.touches.item(0);

        if (this._isPotentiallyManipulating &&
            !this._isManipulating)
        {
            var startedArgs = new ManipulationEventArgs(ManipulationEvent.Started, this._parent.Container as HTMLElement, touch1);
            var rc = this._parent.Container?.getBoundingClientRect();
            if (rc)
            {
                if (event.touches.length === 1)
                {
                    this._scale.CenterX = touch1.clientX - rc.left;
                    this._scale.CenterY = touch1.clientY - rc.top;
                }
                else
                {
                    var touch2 = event.touches.item(1);
                    this._scale.CenterX = (touch1.clientX + touch2.clientX) / 2 - rc.left;
                    this._scale.CenterY = (touch1.clientY + touch2.clientY) / 2 - rc.top;
                }
                startedArgs.CenterX = this._scale.CenterX;
                startedArgs.CenterY = this._scale.CenterY;
            }
            this._parent.OnManipulationStarted(startedArgs);
        }

        this._isManipulating = true;
        //this._parent.Container?.setPointerCapture(touch.identifier);

        // Once confirmed manipulation has begun stop propagation         
        //event.stopPropagation();
        //event.preventDefault();

        const args: ManipulationEventArgs = new ManipulationEventArgs(
            ManipulationEvent.Delta,
            this._parent.Container as HTMLElement,
            touch1);

        let centerX = 0;
        let centerY = 0;
        if (event.touches.length > 1)
        {
            // scale (and translation?)
            var ev1 = touch1;
            var ev2 = event.touches.item(1);

            var newDistance = this.GetTouchDistance(ev1, ev2);
            args.DeltaScale = newDistance / this._scale.LastPixelDistance;
            this._scale.PendingCumulativeScale = newDistance / this._scale.PendingBasePixelDistance;

            // Compute center point based on average of two points
            centerX = (ev1.pageX + ev2.pageX) / 2;
            centerY = (ev1.pageY + ev2.pageY) / 2;
        }
        else
        {
            // just translation!
            centerX = touch1.pageX;
            centerY = touch1.pageY;
        }

        args.DeltaX = centerX - this._translate.LastX;
        args.DeltaY = centerY - this._translate.LastY;
        this._translate.PendingCumulativeX = centerX - this._translate.PendingOriginX;
        this._translate.PendingCumulativeY = centerY - this._translate.PendingOriginY;
        this._translate.LastX = centerX;
        this._translate.LastY = centerY;

        args.CenterX = this._scale.CenterX;
        args.CenterY = this._scale.CenterY;
        args.CumulativeX = this._translate.CommittedCumulativeX + this._translate.PendingCumulativeX;
        args.CumulativeY = this._translate.CommittedCumulativeY + this._translate.PendingCumulativeY;
        args.CumulativeScale = (this._scale.CommittedCumulativeScale * this._scale.PendingCumulativeScale) || 1;
        this._parent.OnManipulationDelta(args);

        if (this._holdingTimer &&
            (args.DeltaX > ManipulationHelper._holdingDistanceThreshold ||
                args.DeltaY > ManipulationHelper._holdingDistanceThreshold))
        {
            clearTimeout(this._holdingTimer);
            this._holdingTimer = undefined;
        }

        var now = new Date().getTime();
        this._velocityX = args.DeltaX / ((now - this._manipulationLastTime) / 1000 || 1);
        this._velocityY = args.DeltaY / ((now - this._manipulationLastTime) / 1000 || 1);
        this._manipulationLastTime = now;
    }

    public OnTouchEnd(event: React.TouchEvent): void
    {
        //if (!this.CheckPointerType(event))
        //    return;

        if (!this._isManipulating)
            return;

        //this._parent.Container?.releasePointerCapture(touch.identifier);

        if (event.touches.length === 0)
        {
            this._isManipulating = false;
            this._isPotentiallyManipulating = false;

            var args = new ManipulationEventArgs(ManipulationEvent.Completed, this._parent.Container as HTMLElement, undefined);
            args.CumulativeX = (this._translate.CommittedCumulativeX + this._translate.PendingCumulativeX) || 0;
            args.CumulativeY = (this._translate.CommittedCumulativeY + this._translate.PendingCumulativeY) || 0;
            args.CumulativeScale = (this._scale.CommittedCumulativeScale * this._scale.PendingCumulativeScale) || 1;

            args.VelocityX = this._velocityX;
            args.VelocityY = this._velocityY;

            this._parent.OnManipulationCompleted(args);
        }
        else if (event.touches.length === 1)
        {
            var touch = event.touches.item(0);
            // a scale operation has completed; we're down to just a
            // translation using 1 point
            this._scale.Commit();
            this._translate.Commit(touch.pageX, touch.pageY);
        }
    }

    public OnPointerDown(event: React.PointerEvent): void
    {
        if (!this.CheckPointerType(event))
            return;

        event.persist();
        this._pointerCache.push(event.nativeEvent);
        this._isPotentiallyManipulating = true;

        this._manipulationStartTime = new Date().getTime();   
        
        if (this._pointerCache.length === 1)
        {
            this._translate = new TranslateTracker();
            this._scale = new ScaleTracker();

            // The first pointer is down; record the X, Y for translation only
            this._translate.Commit(event.pageX, event.pageY);
            
            var me = new ManipulationEventArgs(ManipulationEvent.Starting, this._parent.Container as HTMLElement, event);
            this._parent.OnManipulationStarting(me);

            this._holdingTimer = setTimeout(() =>
            {
                this._holdingTimer = undefined;
                this._parent.OnManipulationHolding(
                    new ManipulationEventArgs(ManipulationEvent.Holding, this._parent.Container as HTMLElement, event));
            }, ManipulationHelper._holdingTimeMS);
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

            // Once confirmed manipulation has begun stop propagation         
            event.stopPropagation();
            event.preventDefault();
        }        
    }

    public OnPointerMove(event: React.PointerEvent): void
    {
        if (!this.CheckPointerType(event))
            return;
        if (!this._isPotentiallyManipulating || this._pointerCache.length === 0)
            return;

        event.persist();
        if (this._isPotentiallyManipulating &&
            !this._isManipulating)
        {
            var startedArgs = new ManipulationEventArgs(ManipulationEvent.Started, this._parent.Container as HTMLElement, event);
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
            this._parent.OnManipulationStarted(startedArgs);
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
                this._pointerCache[i] = event.nativeEvent;
                break;
            }
        }

        const args: ManipulationEventArgs = new ManipulationEventArgs(
            ManipulationEvent.Delta,
            this._parent.Container as HTMLElement,
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
        
        args.CenterX = this._scale.CenterX;
        args.CenterY = this._scale.CenterY;            
        args.CumulativeX = (this._translate.CommittedCumulativeX + this._translate.PendingCumulativeX) || 0;
        args.CumulativeY = (this._translate.CommittedCumulativeY + this._translate.PendingCumulativeY) || 0;
        args.CumulativeScale = (this._scale.CommittedCumulativeScale * this._scale.PendingCumulativeScale) || 1;
        this._parent.OnManipulationDelta(args);

        if (this._holdingTimer &&
               (args.DeltaX > ManipulationHelper._holdingDistanceThreshold ||
                args.DeltaY > ManipulationHelper._holdingDistanceThreshold))
        {
            clearTimeout(this._holdingTimer);
            this._holdingTimer = undefined;
        }
    }

    public OnPointerUp(event: React.PointerEvent): void
    {
        if (!this.CheckPointerType(event))
            return;
        if (!this.RemovePointerEvent(event.nativeEvent))
            // We weren't tracking this one anyway
            return;

        if (!this._isManipulating)
            return;

        this._parent.Container?.releasePointerCapture(event.pointerId);

        if (this._pointerCache.length === 0)
        {
            this._isManipulating = false;
            this._isPotentiallyManipulating = false;
            
            var args = new ManipulationEventArgs(ManipulationEvent.Completed, this._parent.Container as HTMLElement, event);
            args.CumulativeX = this._translate.CommittedCumulativeX + this._translate.PendingCumulativeX;
            args.CumulativeY = this._translate.CommittedCumulativeY + this._translate.PendingCumulativeY;
            args.CumulativeScale = (this._scale.CommittedCumulativeScale * this._scale.PendingCumulativeScale) || 1;

            var now = new Date().getTime();

            args.VelocityX = args.CumulativeX / ((now - this._manipulationStartTime) / 1000 || 1);
            args.VelocityY = args.CumulativeY / ((now - this._manipulationStartTime) / 1000 || 1);

            this._parent.OnManipulationCompleted(args);            
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

    private GetTouchDistance(e1: React.Touch, e2: React.Touch)
    {
        var x1 = e1.pageX;
        var y1 = e1.pageY;
        var x2 = e2.pageX;
        var y2 = e2.pageY;
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }

    private GetEventDistance(e1: PointerEvent, e2: PointerEvent)
    {
        var x1 = e1.pageX;
        var y1 = e1.pageY;
        var x2 = e2.pageX;
        var y2 = e2.pageY;
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }

    private CheckPointerType(event: React.PointerEvent): boolean
    {
        if (event.pointerType === "mouse")
            return this.IsMouseEnabled;
        //if (event.pointerType === "touch")
        //    return this.IsTouchEnabled;
        return false;
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