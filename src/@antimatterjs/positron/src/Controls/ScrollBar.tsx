import * as React from 'react';
import { Event } from '@antimatterjs/react';
import { Orientation } from "../Enums";
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from "../FrameworkElement";
import { IPanelProps, Panel, PanelBase } from './Panel';
import { IScrollInfo } from './Primitives/IScrollInfo';

export interface IScrollBarProps extends IPanelProps
{
    Orientation?: Orientation,
}

export class ScrollBarBase<P extends IScrollBarProps = {}>
    extends FrameworkElement<P, IFrameworkElementState>
    implements IScrollInfo
{
    private _panels: IScrollInfo[] = [];
    private _spacer?: HTMLElement | null;
    private _isMouseOver: boolean = false;
    
    public get Orientation(): Orientation
    {
        return this.GetValue(nameof(this.props.Orientation), Orientation.Vertical);
    }

    public Scroll: Event<void> = new Event();

    public get ExtentHeight(): number
    {
        return this._spacer?.clientHeight || 0;
    }

    public get ExtentWidth(): number
    {
        return this._spacer?.clientWidth || 0;
    }

    public get HorizontalOffset(): number
    {
        return this.Container?.scrollLeft || 0;
    }

    public get VerticalOffset(): number
    {
        return this.Container?.scrollTop || 0;
    }

    public SetHorizontalOffset(offset: number)
    {
        if (!this.Container)
            return;
        this.Container.scrollLeft = offset;
    }

    public SetVerticalOffset(offset: number)
    {
        if (!this.Container)
            return;
        this.Container.scrollTop = offset;
    }

    public Refresh()
    {
        this.OnSourcePanelScroll(this);
    }    

    public LinkPanel(panel: IScrollInfo)
    {
        this._panels.push(panel);

        // This is the key panel so listen to them for 
        // our own adjustments.
        panel.Scroll.subscribe(((sender, e) =>
        {            
            this.OnSourcePanelScroll(sender as IScrollInfo);
        }).bind(this));

        this.InvalidateRender();
    }

    private OnSourcePanelScroll(panel: IScrollInfo): void
    {
        if (!this.Container || !this._spacer || this._isMouseOver)
            return;        
        if (this.Orientation === Orientation.Horizontal)
        {
            var scrollNorm = panel.HorizontalOffset / (panel.ExtentWidth - panel.ActualWidth);
            this.Container.scrollLeft = scrollNorm * (this._spacer.clientWidth - this.ActualWidth);
            if (this.SpacerWidth !== undefined)
                this._spacer.style.minWidth = this.SpacerWidth;
        }
        else
        {
            var scrollNorm = panel.VerticalOffset / (panel.ExtentHeight - panel.ActualHeight);
            this.Container.scrollTop = scrollNorm * (this._spacer.clientHeight - this.ActualHeight);
            if (this.SpacerHeight !== undefined)
                this._spacer.style.minHeight = this.SpacerHeight;
        }        
        this.OnUpdateLinkedPanelsScroll(panel);        
    }

    private OnUpdateLinkedPanelsScroll(source: IScrollInfo)
    {        
        // Update the scroll of linked panels
        if (this.Orientation === Orientation.Horizontal)
        {
            for (let panel of this._panels)
            {
                if (panel === source)
                    continue;
                var scrollNorm = source.HorizontalOffset / (source.ExtentWidth - source.ActualWidth);
                panel.SetHorizontalOffset(scrollNorm * (panel.ExtentWidth - panel.ActualWidth));
            }
        }
        else
        {
            for (let panel of this._panels)
            {
                if (panel === source)
                    continue;
                var scrollNorm = source.VerticalOffset / (source.ExtentHeight - source.ActualHeight);
                panel.SetVerticalOffset(scrollNorm * (panel.ExtentHeight - panel.ActualHeight));
            }
        }        
    }

    override OnComponentMount()
    {
        this.Container?.addEventListener("scroll", (event) =>
        {
            if (!this.Container || !this._spacer || !this._isMouseOver)
                return;
            //console.log("Scroll event from scroller!");
            this.OnUpdateLinkedPanelsScroll(this);
        });

        this.Container?.addEventListener("mouseenter", (e) =>
        {
            this._isMouseOver = true;
        });
        this.Container?.addEventListener("touchstart", (e) =>
        {
            this._isMouseOver = true;
        });

        this.Container?.addEventListener("mouseleave", (e) =>
        {
            this._isMouseOver = false;
        });
        this.Container?.addEventListener("touchend", (e) =>
        {
            this._isMouseOver = false;
        });
    }

    private get GoverningPanel(): IScrollInfo|undefined
    {
        return this._panels[0];   
    }

    protected override getCSSStyles(): React.CSSProperties
    {
        var styles = super.getCSSStyles();
        if (this.Orientation === Orientation.Horizontal)
        {
            styles.minHeight = FrameworkElement.ScrollbarSize + 1;
            styles.overflowX = "auto";            
        }
        else
        {
            styles.minWidth = FrameworkElement.ScrollbarSize + 1;
            styles.overflowY = "auto";
        }
        return styles;
    }

    private get SpacerWidth() : string|undefined
    {
        if (!this.GoverningPanel)
            return undefined;        
        return `${100 * this.GoverningPanel.ExtentWidth / this.GoverningPanel.ActualWidth}%`;
    }

    private get SpacerHeight(): string | undefined
    {
        if (!this.GoverningPanel)
            return undefined;
        return `${100 * this.GoverningPanel.ExtentHeight / this.GoverningPanel.ActualHeight}%`;
    }

    override renderElement()
    {
        if (this.Orientation === Orientation.Horizontal)
        {            
            return (
                <div
                    ref={r => { this._spacer = r; } }
                    style={{
                        minWidth: this.SpacerWidth,
                    }} />);
        }
        else
        {
            return (
                <div
                    ref={r => { this._spacer = r; } }
                    style={{
                        minHeight: this.SpacerHeight
                    }} />);
        }
    }

}

export class ScrollBar extends ScrollBarBase<IScrollBarProps> {}