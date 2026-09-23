using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net.Model
{
    public class MultimediaEvent
    {
        public MultimediaEventType Type { get; set; }        

        public long Timestamp { get; set; }

        public int Other1 { get; set; }

        public int Other2 { get; set; }
    }

    public enum MultimediaEventType
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

        FrameReady = int.MaxValue
    }
}
