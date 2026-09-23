import { Binding, BindingMode, Point } from '@antimatterjs/react';
import { Callout, DirectionalHint, Rectangle, Target } from '@fluentui/react';
import * as React from 'react';
import { FrameworkElement, IFrameworkElementState } from '../FrameworkElement';
import { WebStyle } from '../Style';
import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { ButtonBase } from './Primitives/ButtonBase';
import { Window } from './Window';


export const PopupDirection = DirectionalHint;
export declare type PopupDirection = typeof PopupDirection[keyof typeof PopupDirection];

export enum PlacementMode
{
    MouseOverElement = 1,
    Below = 2,
    Cover = 3,
    MouseAbsolute = 4,
}

export interface IPopupProps extends IPanelProps
{
    SetInitialFocus?: boolean,
    IsOpen?: boolean | Binding,
    Target?: () => FrameworkElement | undefined | null,
    Placement?: PlacementMode,
    Direction?: PopupDirection,
    StaysOpen?: boolean,
    FitContent?: boolean,        
    OnOpened?: () => void,
    PlacementOffset?: Point,
    AlignWidthToTarget?: boolean,
}
export interface IPopupState extends IFrameworkElementState
{
    IsOpen?: boolean,
    Target?: () => FrameworkElement | undefined | null,
    Placement?: PlacementMode,
    StaysOpen?: boolean,        
    OnOpened?: () => void
}

export class PopupBase<
    P extends IPopupProps,
    S extends IPopupState>
    extends PanelBase<P, S>
{
    public static DefaultStyle: WebStyle<IPopupProps> = new WebStyle<IPopupProps>(
        {
            Padding: "10px",
            Placement: PlacementMode.Below,
            SetInitialFocus: true,
            AlignWidthToTarget: true,
        });


    public static DefaultBindings = {
        IsOpen: {
            Mode: BindingMode.TwoWay
        },
        IsClickFocused: {
            Mode: BindingMode.TwoWay
        }
    };

    public get AlignWidthToTarget(): boolean
    {
        return this.GetValue(nameof(this.props.AlignWidthToTarget), false);
    }

    public get SetInitialFocus(): boolean
    {
        return this.GetValue(nameof(this.props.SetInitialFocus), false);
    }

    public get IsOpen(): boolean
    {
        return this.GetValue(nameof(this.props.IsOpen), false);
    }

    public get Direction(): PopupDirection
    {
        return this.GetValue(nameof(this.props.Direction), PopupDirection.bottomCenter);
    }

    public get FitContent(): boolean
    {
        return this.GetValue(nameof(this.props.FitContent), false);
    }

    public get PlacementOffset(): Point | undefined
    {
        return this.GetValue(nameof(this.props.PlacementOffset));        
    }

    /* override */ renderElement()
    {
        var target = this.ComputeTarget();
        return this.state.IsOpen ? (
            <Callout
                shouldRestoreFocus={false}
                onRestoreFocus={(e) =>
                {
                    // apparently this is the only way to prevent the popup
                    // from taking focus again on render
                }}                
                target={target}
                styles={{
                    calloutMain: {
                        display: "flex"
                    },
                    root: {
                        maxHeight: "10000px !important",
                        backdropFilter: this.BackgroundBlur ? `blur(${this.BackgroundBlur})` : undefined,
                        WebkitBackdropFilter: this.BackgroundBlur ? `blur(${this.BackgroundBlur})` : undefined
                    }
                }}
                style={{
                    background: this.Background,
                    padding: this.Padding                  
                }}
                isBeakVisible={false}
                coverTarget={this.state.Placement === PlacementMode.Cover}
                directionalHint={this.Direction}
                onDismiss={() =>
                {
                    if (!this.StaysOpen)
                        this.SetValue(nameof(this.state.IsOpen), false)
                }}
                calloutWidth={
                    Math.max(this.Width as number || 0, (this.AlignWidthToTarget && this.TargetWidth as number) || 0) || undefined
                }
                calloutMinWidth={Math.max((this.MinWidth as number) || 0, this.TargetWidth || 0)}
                calloutMaxHeight={this.MaxHeight as number}
                minPagePadding={0}
                setInitialFocus={this.SetInitialFocus}>
                <div className="amx-ptn-fe amx-ptn-ha-stretch amx-ptn-va-stretch"
                    ref={r =>
                    {
                        if (!r) return;
                        r.ondragenter = (e) =>
                        {
                            if (!e || !e.dataTransfer)
                                return;
                            e.dataTransfer.dropEffect = 'none';
                            e.stopPropagation();
                            e.preventDefault();    
                        };
                        r.ondragover = (e) =>
                        {
                            if (!e || !e.dataTransfer)
                                return;
                            e.dataTransfer.dropEffect = 'none';
                            e.stopPropagation();
                            e.preventDefault();
                        };
                        r.oncontextmenu = (e) =>
                        {
                            e.preventDefault();
                        };
                    }}>
                    {this.props.children}
                </div>                
            </Callout>
        ) : null;
    }

    override OnElementRendered()
    {
        if (!this.IsOpen)
            return;
        if (this.state.OnOpened)
            this.state.OnOpened();
    }

    /* override */ getCSSStyles()
    {
        return Object.assign(
            super.getCSSStyles(),
            {
                padding: "0px",
                position: "absolute",
            });
    }

    public override OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
    }

    public get StaysOpen(): boolean
    {
        return this.GetValue(nameof(this.props.StaysOpen), false);
    }

    private get TargetWidth(): number | undefined
    {
        if (!this.state.Target || this.FitContent)
            return undefined;
        return this.state.Target()?.ActualWidth;
    }

    /* private */ ComputeTarget(): Target
    {
        if (this.state.Placement === PlacementMode.MouseAbsolute)
        {
            var left = FrameworkElement.LastMouseEvent.X + (this.PlacementOffset?.X || 0);
            var top = FrameworkElement.LastMouseEvent.Y + (this.PlacementOffset?.Y || 0);
            return new Rectangle(left, left + 10, top, top + 10);                
        }
        else if (this.state.Placement === PlacementMode.MouseOverElement)
        {
            var left = FrameworkElement.LastMouseEvent.X + (this.PlacementOffset?.X || 0);
            var top = FrameworkElement.LastMouseEvent.Y + (this.PlacementOffset?.Y || 0);       
            return document.elementFromPoint(left, top);
        }
        else if (this.state.Placement !== PlacementMode.MouseOverElement && this.state.Target)
        {
            var target = this.state.Target()?.Container as Target;
            return target;
        }
        return null;
    }
}

export class Popup extends PopupBase<IPopupProps, IPopupState>
{
}