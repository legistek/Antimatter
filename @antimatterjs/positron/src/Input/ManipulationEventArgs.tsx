export enum ManipulationEvent
{
    Starting = 0,
    Started = 1,
    Delta = 2,
    Completed = 3,
}

export class ManipulationEventArgs
{
    constructor(event: ManipulationEvent, nativeEvent: PointerEvent)
    {
        this.Event = event;
        this.NativeEvent = nativeEvent;
    }

    public Event: ManipulationEvent;

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

    public NativeEvent: PointerEvent;
}