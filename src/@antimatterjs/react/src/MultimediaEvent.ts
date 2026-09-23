export class MultimediaEvent
{
    type?: MultimediaEventType;

    /** Measured from start of media file, in milliseconds. */
    timestamp?: number;

    other1?: number;
    other2?: number;

    public static Create(
        type: MultimediaEventType,
        timestamp?: number,
        other1?: number,
        other2?: number): MultimediaEvent
    {
        var me = new MultimediaEvent();
        me.type = type;
        me.timestamp = timestamp;
        me.other1 = other1;
        me.other2 = other2;
        return me;
    }
}

export enum MultimediaEventType
{
    Loading = 1,
    Error = 5,
    Play = 8,
    Pause = 9,
    Ready = 14,
    Seeking = 16,
    Seeked = 17,
    TimeUpdate = 18,
    Ended = 19,
    CutPointReached = 23,
    BufferingStarted = 1005,
    BufferingEnded = 1006,    
}