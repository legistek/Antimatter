import { Binding, BindingMode } from '@antimatterjs/react';
import { Callout, Target } from '@fluentui/react';
import * as React from 'react';
import { FrameworkElement } from '../FrameworkElement';
import { WebStyle } from '../Style';
import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { ButtonBase } from './Primitives/ButtonBase';

export enum PlacementMode
{
    Mouse = 1,
    Below = 2,
    Cover = 3,
}

export interface IPopupProps extends IPanelProps
{
    IsOpen?: boolean | Binding,
    Blur?: number,
    Target?: () => FrameworkElement | undefined | null,
    Placement?: PlacementMode,
    StaysOpen?: boolean,
    MaxHeight?: number,
    Width?: number | Binding,
    MaxWidth?: number | Binding,
    OnOpened?: () => void
}
export interface IPopupState extends IPanelState
{
    IsOpen?: boolean,
    Blur?: number,
    Target?: () => FrameworkElement | undefined | null,
    Placement?: PlacementMode,
    StaysOpen?: boolean,
    MaxHeight?: number,
    Width?: number,
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
            Placement: PlacementMode.Below
        });


    public static DefaultBindings = {
        IsOpen: {
            Mode: BindingMode.TwoWay
        }
    };

    public get IsOpen(): boolean
    {
        return this.GetValue(nameof(this.props.IsOpen), false);
    }

    /* override */ renderElement()
    {
        return this.state.IsOpen ? (
            <Callout                
                target={this.ComputeTarget()}
                styles={{
                    root: {
                        backdropFilter: this.state.Blur
                            ? `blur(${this.state.Blur}px)`
                            : undefined
                    }
                }}
                style={{
                    background: this.Background,
                    padding: this.Padding,
                }}
                isBeakVisible={false}
                coverTarget={this.state.Placement === PlacementMode.Cover}
                onDismiss={() =>
                {
                    if (!this.state.StaysOpen)
                        this.SetValue(nameof(this.state.IsOpen), false)
                }}
                calloutWidth={this.state.Width}
                calloutMinWidth={Math.max(this.state.MinWidth || 0, this.TargetWidth || 0)}
                calloutMaxHeight={this.state.MaxHeight}
                minPagePadding={0}
                setInitialFocus>
                {this.props.children}
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
                position: "absolute"
            });
    }

    public override OnPropertyChanged(property: string, value: any, oldValue: any)
    {
    }

    private get TargetWidth(): number | undefined
    {
        if (!this.state.Target)
            return undefined;
        return this.state.Target()?.ActualWidth;
    }

    /* private */ ComputeTarget(): Target
    {        
        if (this.state.Placement === PlacementMode.Mouse &&
            ButtonBase.LastMouseEvent)
            return ButtonBase.LastMouseEvent;
        else if (this.state.Placement !== PlacementMode.Mouse && this.state.Target)
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