import * as React from 'react';
import { Control, IControlProps, IControlState } from './Control';
import { Style } from '../Style';

import { Separator as FluentSeparator } from '@fluentui/react'
import { ControlTemplate } from '../FrameworkTemplate';

export interface ISeparatorProps extends IControlProps
{
}
export interface ISeparatorState extends IControlState
{
}

export class Separator extends Control<ISeparatorProps, ISeparatorState>
{
    public static DefaultStyle: Style<ISeparatorProps> = new Style<ISeparatorProps>(
        {
            Template: (templatedParent: Separator) =>
            (
                <FluentSeparator styles={{
                    root: {
                        width: "100%",
                        lineHeight: "0",
                        padding: "0px"
                    },
                }} />
            )
        });
}