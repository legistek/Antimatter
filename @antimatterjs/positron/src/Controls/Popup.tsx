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
    Width?: number
}
export interface IPopupState extends IPanelState
{
    IsOpen?: boolean,
    Blur?: number,
    Target?: () => FrameworkElement | undefined | null,
    Placement?: PlacementMode,
    StaysOpen?: boolean,
    MaxHeight?: number,
    Width?: number
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
                    padding: this.state.Padding,
                }}
                isBeakVisible={false}
                coverTarget={this.state.Placement === PlacementMode.Cover}
                onDismiss={() =>
                {
                    if (!this.state.StaysOpen)
                        this.SetValue(nameof(this.state.IsOpen), false)
                }}
                calloutWidth={this.state.Width}
                calloutMaxHeight={this.state.MaxHeight}
                minPagePadding={0}
                setInitialFocus>
                {this.props.children}
            </Callout>
        ) : null;
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