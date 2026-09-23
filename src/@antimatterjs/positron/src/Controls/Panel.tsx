import * as React from 'react';
import { Antimatter, Binding, BindingMode, Event, ModelObjectReference, Rect, Span, SpanOverlap, Utilities } from '@antimatterjs/react';

import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { IItemsControlProps, ItemsControlBase } from './ItemsControl';
import { Orientation, ScrollBarVisibility } from '../Enums';
import { CSSClasses } from '../CSSClasses';
import { ThemeColor, SemanticColor, ThemeLayout, ThemeEffect, ColorGradient, Theme } from '../Theme';
import { IScrollInfo } from './Primitives/IScrollInfo';
import { ScrollBar } from './ScrollBar';
//import { baseElementEvents } from '@fluentui/react';
//import { Window } from './Window';
import { Application } from '../Application';
import { ICollectionUpdate, NotifyCollectionChangedAction } from '@antimatterjs/react/src/ICollectionUpdate';
//import { IndexedAccessType } from 'typescript';

export interface IPanelProps extends IFrameworkElementProps
{
    children?: React.ReactNode;
    Width?: number | string | Binding,
    Height?: number | string | Binding,
    MinWidth?: number | string | Binding,
    MaxWidth?: number | string | Binding,
    MinHeight?: number | string | Binding,
    MaxHeight?: number | string | Binding,
    BorderStyle?: string | Binding,
    Background?: string | Binding | ThemeColor | ThemeEffect | SemanticColor | ColorGradient,
    HoverBackground?: string | Binding | ThemeColor | ThemeEffect | SemanticColor | ColorGradient,
    BorderBrush?: string | Binding | ThemeColor | SemanticColor,
    BorderThickness?: string | ThemeLayout | Binding | number,
    BorderRadius?: string | ThemeLayout | Binding | number,
    Foreground?: string | Binding | ThemeColor | SemanticColor,
    ItemSpacing?: string | ThemeLayout | number,
    Padding?: string | ThemeLayout | Binding | number,
    BoxShadow?: string | ThemeEffect,
    BackgroundBlur?: string | ThemeEffect | Binding,
    ItemsParent?: ItemsControlBase<IItemsControlProps, IFrameworkElementState>,
    HorizontalScrollBarVisibility?: ScrollBarVisibility | Binding,
    VerticalScrollBarVisibility?: ScrollBarVisibility,
    OnClickCommand?: ModelObjectReference | Binding,
    OnDoubleClick?: ModelObjectReference | Binding,
    CommandParameter?: any,
    IsClickFocused?: boolean | Binding,
    AutoScrollForDrag?: boolean,
    IndicateContextMenuOpen?: boolean,
    IndicateHover?: boolean | Binding,
    IsHoverAware?: boolean,
    Inline?: boolean
}

export interface IPanelState extends IFrameworkElementState
{
}

export class PanelBase<P extends IPanelProps = {}, S extends IFrameworkElementState = {}>
    extends FrameworkElement<P, S>
    implements IScrollInfo
{
    public static readonly STATE_ContextMenuOpen: string = "fe-ctxmenu-open";
    _hscrollBar?: ScrollBar;
    _vscrollBar?: ScrollBar;

    public Scroll: Event<void> = new Event();

    public static DefaultBindings = {
        IsClickFocused: {
            Mode: BindingMode.TwoWay
        }
    };

    constructor(props: IPanelProps)
    {
        super(props);
        if (props.ItemsParent)
            props.ItemsParent.ItemsPanelInstance = this;
    }

    public get Inline(): boolean
    {
        return this.GetValue(nameof(this.props.Inline), false);
    }

    public get AutoScrollForDrag(): boolean
    {
        return this.GetValue(nameof(this.props.AutoScrollForDrag), false);
    }

    _IsSmoothScrolling;
    protected get IsSmoothScrolling(): boolean
    {
        return this._IsSmoothScrolling;
    }

    public get IndicateHover(): boolean
    {
        return this.GetValue(nameof(this.props.IndicateHover), false);
    }

    public get IsHoverAware(): boolean
    {
        return this.GetValue(nameof(this.props.IsHoverAware), false);
    }

    private _scrollTarget?: number = undefined;
    private _scrollTargetIndex?: number = undefined;
    private _scrollInterrupted: boolean = false;

    public OnScrollableHeightChanged(at: number, delta: number, itemIndex?: number)
    {
        if (this._scrollTarget === undefined)
            return;

        this._scrollInterrupted = true;

        if (itemIndex !== undefined && this._scrollTargetIndex !== undefined)
        {
            if (itemIndex >= this._scrollTargetIndex)
            {
                if (Antimatter.Debug)
                    console.log(`** ${delta} height change at index ${itemIndex}, gte scroll target index ${this._scrollTargetIndex}`);
                return;
            }
        }
        else if (at >= this._scrollTarget)
        {
            if (Antimatter.Debug)
                console.log(`** ${delta} height change at ${at}, gte scroll target ${this._scrollTarget}`);
            return; // doesn't impact current scroll target
        }

        // adjust scroll target because it's at a different
        // spot now than it was before thanks to virtualization

        if (this._scrollTarget > at && (itemIndex === undefined || this._scrollTargetIndex === undefined))
            delta = Math.min(delta, this._scrollTarget - at);

        this._scrollTarget += delta;
        if (Antimatter.Debug)
            console.log(`** ${delta} height change at ${at}, setting new scroll target ${this._scrollTarget}`);
    }

    public async ScrollSmoothlyAsync(top: number, targetIndex?: number, animate: boolean = true): Promise<boolean>
    {
        if (!this.Container)
            return false;

        this._IsSmoothScrolling = true;

        console.log(`** smoothscroll requested to ${top}`);

        this._scrollTarget = Math.round(top);
        this._scrollTargetIndex = targetIndex;

        // If the scroll distance is too far, do an immediate scroll
        // to a nearby spot then do the smooth scroll. Avoids very
        // long scrolls and unnecessary realizations in the case of
        // virtualized items.
        var cutoff = Application.CurrentWindow?.ActualHeight || 1080;
        cutoff *= 2;
        var delta = top - this.Container.scrollTop;
        if (delta > cutoff)
        {
            // going forward more than cutoff, so stop short
            // then go smooth
            this.Container.scrollTo({
                top: this.Container.scrollTop + delta - cutoff
            });
            await Utilities.SleepAsync(1);
        }
        else if (delta < -cutoff)
        {
            // going backward more than cutoff
            this.Container.scrollTo({
                top: this.Container.scrollTop + delta + cutoff
            });
            await Utilities.SleepAsync(1);
        }

        let noMovementRounds = 0;
        this._scrollInterrupted = true;
        let noMovement: boolean = false;
        do
        {
            if (this._scrollInterrupted)
            {
                this._scrollInterrupted = false;
                this.Container?.scrollTo({
                    top: this._scrollTarget,
                    behavior: animate ? 'smooth' : 'auto'
                });
            }

            await Utilities.SleepAsync(0);
            if (this._scrollInterrupted)
                continue;

            var oldTop = this.Container?.scrollTop;
            await Utilities.SleepAsync(33); // 1/60th of a second = 1 frame
            var newTop = this.Container?.scrollTop;

            if (oldTop == newTop)
            {
                if (noMovementRounds++ < 10)
                    noMovement = true;
                else
                    break;
            }
            else
            {
                noMovement = false;
                noMovementRounds = 0;
            }
        } while (noMovement || this._scrollInterrupted || this.Container?.scrollTop !== this._scrollTarget);

        this._IsSmoothScrolling = false;
        return this.Container?.scrollTop === this._scrollTarget;
    }

    public get IndicateContextMenuOpen(): boolean
    {
        return this.GetValue(nameof(this.props.IndicateContextMenuOpen), false);
    }

    public get IsClickFocused(): boolean
    {
        return this.GetValue(nameof(this.props.IsClickFocused), false);
    }

    public get BackgroundBlur(): string|undefined
    {
        return this.GetValue(nameof(this.props.BackgroundBlur));
    }

    public get BorderStyle(): string | undefined
    {
        return this.GetValue(nameof(this.props.BorderStyle));
    }

    public get BorderRadius(): string | undefined | number
    {
        return this.GetValue(nameof(this.props.BorderRadius));
    }

    public get ItemsParent(): ItemsControlBase<IItemsControlProps, IFrameworkElementState> | undefined
    {
        return this.GetValue(nameof(this.props.ItemsParent));
    }

    public get HorizontalScrollBarVisibility(): ScrollBarVisibility | undefined
    {
        return this.GetValue(nameof(this.props.HorizontalScrollBarVisibility));
    }

    public get VerticalScrollBarVisibility(): ScrollBarVisibility | undefined
    {
        return this.GetValue(nameof(this.props.VerticalScrollBarVisibility));
    }

    public get Width(): string | number | undefined
    {
        return this.GetValue(nameof(this.props.Width));
    }

    public get Height(): string | number | undefined
    {
        return this.GetValue(nameof(this.props.Height));
    }

    public get MinHeight(): string | number | undefined
    {
        return this.GetValue(nameof(this.props.MinHeight));
    }

    public get MaxHeight(): string | number | undefined
    {
        return this.GetValue(nameof(this.props.MaxHeight));
    }

    public get MinWidth(): string | number | undefined
    {
        return this.GetValue(nameof(this.props.MinWidth));
    }

    public get MaxWidth(): string | number | undefined
    {
        return this.GetValue(nameof(this.props.MaxWidth));
    }

    public get Padding(): string | undefined | number
    {
        return this.GetValue(nameof(this.props.Padding));
    }

    public get BoxShadow(): string | undefined
    {
        return this.GetValue(nameof(this.props.BoxShadow));
    }

    public get ItemSpacing(): string | undefined | number
    {
        return this.GetValue(nameof(this.props.ItemSpacing));
    }

    public get Background(): string | undefined
    {
        const bg = this.props.Background;
        if (bg instanceof ColorGradient)
            return this.GetGradientCSS(bg);

        return this.GetValue(nameof(this.props.Background));
    }

    public get HoverBackground(): string | undefined
    {
        const bg = this.props.HoverBackground;
        if (bg instanceof ColorGradient)
            return this.GetGradientCSS(bg);

        return this.GetValue(nameof(this.props.HoverBackground), Theme.Value(ThemeColor.NeutralLighter));
    }

    public get BorderBrush(): string | undefined
    {
        return this.GetValue(nameof(this.props.BorderBrush));
    }

    public get BorderThickness(): string | undefined | number
    {
        return this.GetValue(nameof(this.props.BorderThickness));
    }

    public get Foreground(): string | undefined
    {
        return this.GetValue(nameof(this.props.Foreground));
    }

    public get OnClickCommand(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.OnClickCommand));
    }

    public get OnDoubleClick(): ModelObjectReference|undefined
    {
        return this.GetValue(nameof(this.props.OnDoubleClick));
    }

    public get CommandParameter(): any
    {
        return this.GetValue(nameof(this.props.CommandParameter));
    }

    /**
     * Scrolls either to the specified index or the container housing
     * the specified item. Must be overridden by specialized panels (such as
     * VirtualizingPanel and DataGridRowsPresenter) whose children are not
     * always instantiated.
     * @param item The item's index or the target item instance
     */
    public /* virtual */ async ScrollTo(item: number | any, ignoreIfInView?: boolean, animate: boolean = true): Promise<boolean>
    {
        if (!this.ItemsParent?.ItemsSource || !this.Container)
            return false;
        var index = typeof (item) === "number"
            ? item
            : this.ItemsParent.ItemsSource.findIndex((i) => Utilities.SmartEquals(i, item));
        if (index === -1)
            return false;
        var container = this.ItemsParent.TryGetItemContainer(index);
        if (!container?.Container)
            return false;

        var scroller = Utilities.FindParentElement(container.Container as HTMLElement, (e) =>
        {
            if (!e.style)
                return false;
            return e.style.overflowY === "auto" ||
                e.style.overflowY === "scroll";
        });
        if (!scroller)
            return false;

        var scrollerPanel = (scroller as any).AMXInstance as Panel;
        if (!scrollerPanel)
            return false;

        var rc = container.Container.getBoundingClientRect();
        var rp = scroller.getBoundingClientRect();
        if (!rc || !rp)
            return false;

        var y = rc.y - rp.y;        // client's y relative to parent's
        if (ignoreIfInView && rc.top >= rp.top && rc.bottom < rp.bottom)
            return true;

        return await scrollerPanel.ScrollSmoothlyAsync(scroller.scrollTop + y, undefined, animate);
    }

    private _isMouseOver: boolean = false;
    private _selfScrollingHandle?: number = undefined;

    private LinkScrollBar(scrollbar: ScrollBar)
    {
        if (!this.Container)
            return;

        if (scrollbar.Orientation === Orientation.Horizontal)
        {
            this._hscrollBar = scrollbar;
            scrollbar.LinkPanel(this);
        }
        else
        {
            this._vscrollBar = scrollbar;
            scrollbar.LinkPanel(this);
        }
        if (!this._resizeObserver)
        {
            this.Container.addEventListener("scroll", (event) =>
            {
                if (!this._isMouseOver && !this._selfScrollingHandle)
                    return;
                window.clearTimeout(this._selfScrollingHandle);
                this._selfScrollingHandle = window.setTimeout(() =>
                {
                    this._selfScrollingHandle = undefined;
                }, 66);
                this.Scroll?.invoke(this);
            });
            this.SetupResizeObserver();
        }

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

    private _scrollersLinked: boolean = false;

    override OnComponentMount()
    {
    //    this.SetupDetachedScrollers();
        if (!this.Container)
            return;
        if (this.AutoScrollForDrag)
        {
            this.Container.addEventListener("pointermove", ((event) =>
            {
                this.OnMouseMoveForAutoScroll(event);
            }).bind(this));
            this.Container.addEventListener("pointerleave", ((e: any) =>
            {
                if (!this._isAutoScrolling)
                    return;
                //var event = e as PointerEvent;
                //if (event.target && !this.Container?.contains(event.target as Node))
                    this._isAutoScrolling = false;
            }).bind(this));
        }
    }

    //override OnElementRendered()
    //{
    //    this.SetupDetachedScrollers();
    //}

    public LinkDetachedScrollers(scrollers: ScrollBar[])
    {
        if (this._scrollersLinked)
            return;

        if (scrollers.length == 0)
            return;

        var sb1 = scrollers[0];
        if (sb1)
        {
            this.LinkScrollBar(sb1);
            this._scrollersLinked = true;
        }

        var sb2 = scrollers[1];
        if (sb2)
        {
            this.LinkScrollBar(sb2);
            this._scrollersLinked = true;
        }

        if (this._scrollersLinked)
            this.InvalidateRender();
    }

    override OnElementRendered()
    {
        super.OnElementRendered();
        this._hscrollBar?.Refresh();
        this._vscrollBar?.Refresh();
    }

    override OnComponentWillUnmount()
    {
        this._resizeObserver?.disconnect();
    }

    public get ExtentHeight(): number
    {
        return this.Container?.scrollHeight || 0;
    }

    public get ExtentWidth(): number
    {
        return this.Container?.scrollWidth || 0;
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

    protected override getCSSStyles(): React.CSSProperties
    {
        var styles: React.CSSProperties = {
            borderRadius: this.BorderRadius,
            width: this.Width,
            height: this.Height,
            minWidth: typeof(this.Width) === "number" ? this.Width : this.MinWidth,
            minHeight: this.MinHeight,
            maxWidth: this.MaxWidth,
            maxHeight: this.MaxHeight,
            color: this.Foreground,
            background: this.Background,
            borderColor: this.BorderBrush,
            borderWidth: this.BorderThickness,
            borderStyle: this.BorderStyle,
            boxShadow: this.BoxShadow,
            padding: this.Padding,
            backdropFilter: this.BackgroundBlur ? `blur(${this.BackgroundBlur})` : undefined,
            overflowX: Panel.GetScrollBarVisibilityCSSValue(this.HorizontalScrollBarVisibility),
            overflowY: Panel.GetScrollBarVisibilityCSSValue(this.VerticalScrollBarVisibility),
            WebkitBackdropFilter: this.BackgroundBlur ? `blur(${this.BackgroundBlur})` : undefined,
        };
        if (this.IndicateHover)
            styles['--prop-HoverBackground'] = this.HoverBackground;
        if (this.Inline)
            styles.display = "inline";
        return Object.assign(super.getCSSStyles(), styles);
    }

    /* override */ constructClasses(): string
    {
        return `${CSSClasses.Panel} ` +
            ((this.HorizontalScrollBarVisibility !== undefined &&
                this.HorizontalScrollBarVisibility !== ScrollBarVisibility.Hidden)
                ? `${CSSClasses.HScroll} ` : "") +
            ((this.VerticalScrollBarVisibility !== undefined &&
                this.VerticalScrollBarVisibility !== ScrollBarVisibility.Hidden)
                ? `${CSSClasses.VScroll} ` : "") +
            ((this._hscrollBar || this._vscrollBar) ? `${CSSClasses.LinkedScrollbars} ` : "") +
            (this.AutoScrollForDrag ? " autoscroll-drag " : "") +
            ((this.IsContextMenuOpen && this.IndicateContextMenuOpen)
                ? ` ${Panel.STATE_ContextMenuOpen} ` : "") +
            (this.IndicateHover ? " amx-ptn-indicatehover " : "") +
            (this.IsHoverAware ? `${CSSClasses.HoverAware}  ` : "")
            + super.constructClasses();
    }

    protected override renderElement(): JSX.Element | null
    {
        if (this.ItemsParent)
        {
            let list: (JSX.Element | null | undefined)[] = [];
            var items = this.ItemsParent.ItemsSource;
            if (items)
            {
                list = Array(items.length);
                for (let i = 0; i < list.length; i++)
                    list[i] = this.ItemsParent.OnRenderItem(items[i], i);
            }
            if (list.length > 0)
                this.ItemsParent.OnItemsRendered({
                    Start: 0,
                    End: list.length - 1
                });
            return (<>{list}</>);
        }
        else
        {
            return (<>{this.props.children}</>);
        }
    }

    public override OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        super.OnBoundPropertyUpdate(property, value, oldValue);
        if (value === true && property === nameof(this.props.IsClickFocused))
        {
            this.OnClickOutsideMe(() =>
            {
                this.SetValue(nameof(this.props.IsClickFocused), false, false, false, true);
            });
        }
    }

    public /* virtual */ OnItemsSourceCollectionChanged(e: ICollectionUpdate)
    {
        this.InvalidateRender(e.Action === NotifyCollectionChangedAction.Reset);
    }

    protected /* virtual */ OverrideContainerAttributes(
        containerProps:
            React.HTMLAttributes<HTMLElement> &
            React.ClassAttributes<HTMLElement>)
    {
        if (this.OnDoubleClick)
            containerProps.onDoubleClick = (event) =>
            {
                event.preventDefault();
                event.stopPropagation();
                this.ExecutePropCommandHandler(this.OnDoubleClick, this.CommandParameter);
                if (this.OnDblClick)
                    this.OnDblClick(event);
            };
        if (this.OnClickCommand)
            containerProps.onClick = (event) =>
            {
                event.preventDefault();
                event.stopPropagation();
                this.ExecutePropCommandHandler(this.OnClickCommand, this.CommandParameter);
                if (this.OnClickHandler)
                    this.OnClickHandler(event);
            };
    }

    private _autoscrollEdge = 50;
    private _isAutoScrolling: boolean = false;
    private _scrollInterval = 10;
    private _scrollTimePeriod = 16;

    private async OnMouseMoveForAutoScroll(e: React.MouseEvent)
    {
        if (!Application.CurrentWindow?.IsDragging)
            return;

        // For edge scroll (Don't forget this for other scenarios where we'll need it, e.g. drag & drop!)
        var rc = this.Container?.getBoundingClientRect();
        if (!rc)
            return;
        var distFromTop = e.clientY - rc.top;
        var distFromBottom = rc.bottom - e.clientY;
        if (distFromTop >= this._autoscrollEdge && distFromBottom >= this._autoscrollEdge)
            this._isAutoScrolling = false;
        else if (!this._isAutoScrolling)
        {
            this._isAutoScrolling = true;
            while (this._isAutoScrolling && Application.CurrentWindow?.IsDragging)
            {
                this.Container?.scrollBy(
                    0,
                    distFromTop < this._autoscrollEdge ? - this._scrollInterval : this._scrollInterval
                );
                await Utilities.SleepAsync(this._scrollTimePeriod);
            }
            this._isAutoScrolling = false;  // in case it was because of stop drag
        }
    }

    protected override OnResize()
    {
        this.Scroll?.invoke(this);
    }

    public static GetScrollBarVisibilityCSSValue(v?: ScrollBarVisibility): "auto" | "hidden" | "scroll" | undefined
    {
        switch (v)
        {
            case undefined:
                return undefined;
            case ScrollBarVisibility.Hidden:
                return "hidden";
            case ScrollBarVisibility.Visible:
                return "scroll";
            case ScrollBarVisibility.Auto:
            default:
                return "auto";
        }
    }

    private GetGradientCSS(gradient: ColorGradient): string | undefined
    {
        if (!gradient.Colors || gradient.Colors.length == 0)
            return undefined;

        const stops: string[] = [];
        let pos: number = 0;
        gradient.Colors.forEach(c =>
        {
            const stop: string = `${c} ${pos}px ${pos + gradient.Width * ColorGradient.SolidStripeRatio}px`;
            stops.push(stop);
            pos += gradient.Width;
        });
        const lastStop: string = `${gradient.Colors[0]} ${pos}px`;  //Repeat of the 1st stop to complete the cycle
        stops.push(lastStop);

        return `repeating-linear-gradient(${gradient.Angle}deg, ${stops.join(", ")})`;
    }
}

export class Panel extends PanelBase<IPanelProps, IFrameworkElementState>
{
}