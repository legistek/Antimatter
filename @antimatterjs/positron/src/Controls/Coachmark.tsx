import * as React from 'react';
import { } from '@fluentui/react'
import { Binding, BindingMode } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { ControlTemplate } from '../FrameworkTemplate';
import { Style } from '../Style';

export class Coachmark extends Control<IControlProps, IControlState>
{
    static DefaultStyle: Style<IControlProps> = new Style<IControlProps>(
        {
            Template: new ControlTemplate((templatedParent: Coachmark) => templatedParent.Template)
        });

    private get Template(): JSX.Element
    {
        return <>COACHMARK</>;
    }
}