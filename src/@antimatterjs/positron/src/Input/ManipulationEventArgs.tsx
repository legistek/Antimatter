import { Point } from '@antimatterjs/react';
import * as React from 'react';
import { Window } from '../Controls/Window';

export enum ManipulationEvent
{
    Starting = 0,
    Started = 1,
    Delta = 2,
    Completed = 3,
    Holding = 4,
}

export class ManipulationEventArgs
{
    constructor(event: ManipulationEvent, target: HTMLElement, nativeEvent: React.PointerEvent | React.Touch | undefined)
    {
        //this.Event = event;
        //this.NativeEvent = nativeEvent;

        if (!target.getBoundingClientRect)
            return;
        var rc = target.getBoundingClientRect();        

        if (nativeEvent)
        {
            this.NormalizedOriginX =
                (nativeEvent.pageX - rc.left) /
                rc.width;
            this.NormalizedOriginY =
                (nativeEvent.pageY - rc.top) /
                rc.height;
        }
    }

    //public Event: ManipulationEvent;

    public DeltaX: number = 0;
    public DeltaY: number = 0;
    public DeltaScale: number = 1;
    public DeltaRotation: number = 0;

    public CumulativeX: number = 0;
    public CumulativeY: number = 0;
    public CumulativeScale: number = 1;
    public CumulativeRotation: number = 0;

    public CenterX: number = 0;
    public CenterY: number = 0;

    //public NativeEvent: React.PointerEvent;

    public VelocityX: number = 0;
    public VelocityY: number = 0;

    public NormalizedOriginX: number = 0;
    public NormalizedOriginY: number = 0;

    
}