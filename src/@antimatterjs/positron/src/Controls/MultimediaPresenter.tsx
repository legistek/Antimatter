import * as React from 'react';
import { Antimatter, Binding, BindingMode, ModelObjectReference, MultimediaEvent, MultimediaEventType } from '@antimatterjs/react';
import { TemplateProp, WebStyle } from '../Style';
import { ISelectorProps, Selector, SelectorBase } from './Primitives/Selector';
import { ISelectableItemControlProps, SelectableItemControl, SelectableItemControlBase } from './Primitives/SelectableItemControl';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { SemanticColor, Theme, ThemeColor } from '../Theme';
import { IFrameworkElementState } from '../FrameworkElement';
import { ScrollBarVisibility } from '../Enums';
import { CSSClasses } from '../CSSClasses';

export interface IMultimediaPresenterProps extends IPanelProps
{
    Uri?: string | Binding;
    Volume?: number | Binding;
    Muted?: boolean | Binding;
    DefaultControls?: boolean | Binding;
    StatusCallbackCommand?: ModelObjectReference | Binding;

    /** Milliseconds. Tells the video player to stop when it reaches this
     * timestamp. */
    StopAt?: number | Binding;

    /** Milliseconds. Ensures the video player sends a status update when this
     * timestamp is reached, irrespective of RegularUpdateInterval. */
    NotifyAt?: number | Binding;

    /** Milliseconds. The video player will send a timestamp update at least
     this frequently. Default is 1 second. */
    RegularUpdateInterval?: number | Binding;
}

export class MultimediaPresenter extends PanelBase<IMultimediaPresenterProps, IPanelState>
{
    constructor(props)
    {
        super(props);
        this._handle = MultimediaPresenter._nextHandle++;
        MultimediaPresenter._store.set(this._handle, this);
    }

    override GetLoadedCommandParameter()
    {
        return this._handle;
    }

    public get Uri(): string | undefined
    {
        return this.GetValue(nameof(this.props.Uri));
    }

    public get Volume(): number
    {
        return this.GetValue(nameof(this.props.Volume), 1);
    }
    public get Muted(): boolean
    {
        return this.GetValue(nameof(this.props.Muted), false);
    }

    public get DefaultControls(): boolean
    {
        return this.GetValue(nameof(this.props.DefaultControls), false);
    }

    public get StatusCallbackCommand(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.StatusCallbackCommand));
    }

    public get StopAt(): number | undefined
    {
        return this.GetValue(nameof(this.props.StopAt));
    }
    public set StopAt(value: number | undefined)
    {
        this.SetValue(nameof(this.props.StopAt), value, false);
    }

    public get NotifyAt(): number | undefined
    {
        return this.GetValue(nameof(this.props.NotifyAt));
    }

    public get RegularUpdateInterval(): number
    {
        return this.GetValue(nameof(this.props.RegularUpdateInterval), 1000);
    }

    override renderElement(): JSX.Element
    {
        return (
            <video
                ref={r => this.SetVideoElement(r)}
                muted={this.Muted}
                playsInline={true}
                datatype="video/mp4"
                controls={this.DefaultControls}
                onCanPlay={this.StatusCallbackCommand && (() => this.OnMediaEvent(MultimediaEventType.Ready))}
                onPlay={this.StatusCallbackCommand && (
                    (e) =>
                    {
                        this.OnMediaEvent(MultimediaEventType.Play);
                        this.OnMediaEvent(MultimediaEventType.BufferingEnded);
                    }
                )}
                onPause={this.StatusCallbackCommand && ((e) => this.OnMediaEvent(MultimediaEventType.Pause))}
                onTimeUpdate={
                    (this.StatusCallbackCommand || this.StopAt !== undefined)
                        ? ((e) => this.OnTimeUpdate())
                        : undefined
                }
                onSeeked={this.StatusCallbackCommand && ((e) => this.OnMediaEvent(MultimediaEventType.Seeked))}
                onSeeking={this.StatusCallbackCommand && ((e) => this.OnMediaEvent(MultimediaEventType.Seeking))}
                onWaiting={this.StatusCallbackCommand && ((e) => this.OnMediaEvent(MultimediaEventType.BufferingStarted))}
                onEnded={this.StatusCallbackCommand && ((e) => this.OnMediaEvent(MultimediaEventType.Ended))}
                onError={this.StatusCallbackCommand && ((e) => this.OnMediaEvent(MultimediaEventType.Error))}
                style={{
                    width: this.Width || "100%",
                    height: this.Height || "100%",
                    objectFit: "contain",
                    boxShadow: this.BoxShadow,
                }}
                className={`${CSSClasses.Image}`}
                src={this.Uri}
            />);
    }

    private OnTimeUpdate()
    {
        var timeStamp = (this._video?.currentTime || 0) * 1000;
        if (this.StopAt !== undefined && timeStamp >= this.StopAt)
        {
            this._video?.pause();
            this.ExecuteCommand(
                this.StatusCallbackCommand,
                MultimediaEvent.Create(MultimediaEventType.CutPointReached, timeStamp));
        }
        else if (this.NotifyAt !== undefined && timeStamp >= this.NotifyAt)
        {
            this.ExecuteCommand(
                this.StatusCallbackCommand,
                MultimediaEvent.Create(MultimediaEventType.TimeUpdate, timeStamp));
        }
        else if ((timeStamp >= this._lastRegularUpdate + this.RegularUpdateInterval) ||
                 timeStamp < this._lastRegularUpdate)
        {
            this._lastRegularUpdate = timeStamp;
            this.ExecuteCommand(
                this.StatusCallbackCommand,
                MultimediaEvent.Create(MultimediaEventType.TimeUpdate, timeStamp));
        }
        else
        {
            return;
        }
        Antimatter.Server.OnUserActivity();
    }

    private OnMediaEvent(type: MultimediaEventType)
    {
        var timeStamp = (this._video?.currentTime || 0) * 1000;

        switch (type)
        {
            case MultimediaEventType.Play:
                this._isPlaying = true;
                break;
            case MultimediaEventType.Ended:
                this._isPlaying = false;
                this.StopAt = undefined;
                break;
            case MultimediaEventType.Pause:
                this._isPlaying = false;                
                break;
            case MultimediaEventType.Ready:
                if (this._playWhenReady && this._video)
                {
                    this._video.play();
                    this._playWhenReady = false;
                }
                break;
        }

        if (!this.StatusCallbackCommand)
            return;
        this.ExecuteCommand(this.StatusCallbackCommand,
            MultimediaEvent.Create(type, timeStamp));
    }

    override OnComponentWillUnmount()
    {
        MultimediaPresenter._store.delete(this._handle);
    }

    private SetVideoElement(ref: HTMLVideoElement | null): void
    {
        this._video = ref;
        if (!this._video)
            return;
        this._video.volume = this.Volume;
    }

    private _video?: HTMLVideoElement | null;
    private _lastRegularUpdate: number = 0;
    private _handle: number = 0;
    private _isPlaying: boolean = false;
    private _playWhenReady: boolean = false;

    public static GetProperties(args: {
        handle: number
    }): any
    {
        var mp = MultimediaPresenter._store.get(args.handle);
        if (!mp || !mp._video)
            return {};

        let props: any = {};
        props.duration = mp._video.duration;
        props.width = mp._video.videoWidth;
        props.height = mp._video.videoHeight;
        return props;
    }

    public static Play(args: {
        handle: number
    })
    {
        var mp = MultimediaPresenter._store.get(args.handle);
        if (!mp || !mp._video)
            return;
        mp._video.play();
    }

    public static Pause(args: {
        handle: number
    })
    {
        var mp = MultimediaPresenter._store.get(args.handle);
        if (!mp || !mp._video)
            return;
        mp.StopAt = undefined;
        mp._video.pause();
    }

    public static Seek(args: {
        handle: number,
        timeStamp: number,      // ms
        outPoint?: number       // ms
    })
    {
        var mp = MultimediaPresenter._store.get(args.handle);
        if (!mp || !mp._video)
            return;
        mp._video.currentTime = args.timeStamp  / 1000.0;
        if (args.outPoint !== undefined)
            mp.StopAt = args.outPoint;
    }

    private static _store = new Map<number, MultimediaPresenter>();
    private static _nextHandle: number = 0;

    public override OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        if (property == nameof(this.props.Volume))
        {
            if (!this._video)
                return;
            this._video.volume = this.Volume;
        }
        else if (property == nameof(this.props.Uri))
        {
            if (this._video)
            {
                var wasPlaying = this._isPlaying;
                // Preemptively do this before React render in case 
                // seek, play, etc.operations follow which are likely
                this._video.src = value;
                if (wasPlaying)
                    this._playWhenReady = true;
            }
        }
        super.OnBoundPropertyUpdate(property, value, oldValue);
    }
}

(window as any).AmxMultimediaPresenter = MultimediaPresenter;