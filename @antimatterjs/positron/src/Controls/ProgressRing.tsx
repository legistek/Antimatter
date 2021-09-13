import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Spinner, SpinnerSize } from '@fluentui/react'
import { Control, IControlProps, IControlState } from './Control';
import { WebStyle } from '../Style';
import { ControlTemplate } from '../FrameworkTemplate';

export class ProgressRing extends Control<IControlProps, IControlState>
{
    static DefaultStyle: WebStyle<IControlProps> = new WebStyle<IControlProps>(
        {
            Template: new ControlTemplate((templatedParent: ProgressRing) =>
            (
                <Spinner size={SpinnerSize.large} />
            ))
        });
}