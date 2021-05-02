import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Spinner, SpinnerSize } from '@fluentui/react'
import { Control, IControlProps, IControlState } from './Control';
import { Style } from '../Style';

export class ProgressRing extends Control<IControlProps, IControlState>
{
    static DefaultStyle: Style<IControlProps> = new Style<IControlProps>(
        {            
            Template: (templatedParent: ProgressRing) =>
            (
                <Spinner size={SpinnerSize.large} />
            )
        });
}