import * as React from 'react';
import { } from '@fluentui/react'
import { Binding, BindingMode } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from '@antimatterjs/positron/src/Controls/Control';
import { Style } from '@antimatterjs/positron/src/Style';
import { ControlTemplate } from '@antimatterjs/positron/src/FrameworkTemplate';

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