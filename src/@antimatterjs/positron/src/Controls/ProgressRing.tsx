import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Spinner, SpinnerSize } from '@fluentui/react'
import { Control, IControlProps, IControlState } from './Control';
import { WebStyle } from '../Style';
import { ControlTemplate } from '../FrameworkTemplate';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';

export enum RingSize
{
    ExtraSmall = 0,
    Small = 1,
    Medium = 2,
    Large = 3,
}

export interface IProgressRingProps extends IControlProps
{
    Size?: RingSize | Binding;
}

export class ProgressRing extends Control<IProgressRingProps, IControlState>
{
    static DefaultStyle: WebStyle<IControlProps> = new WebStyle<IProgressRingProps>(
        {
            Size: RingSize.Large,
            HorizontalAlignment: HorizontalAlignment.Center,
            VerticalAlignment: VerticalAlignment.Center,
            Template: new ControlTemplate((templatedParent: ProgressRing) =>
            (
                <Spinner size={templatedParent.Size as any} />
            ))
        },
        {
            "@ .ms-Spinner": {
                overflow: "hidden"
            }
        });

    public get Size(): RingSize
    {
        return this.GetValue(nameof(this.props.Size), RingSize.Large);
    }
}