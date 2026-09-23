import * as React from 'react';
import { HorizontalAlignment, UITransitionState, VerticalAlignment } from '../Enums';
import { Style, WebStyle } from '../Style';
import { Control, IControlProps, IControlState } from './Control';
import { ProgressRing } from './ProgressRing';
import { Panel } from './Panel';
import { ThemeEffect } from '../Theme';

export class BusyPanel extends Control<IControlProps, IControlState>
{
    public static DefaultStyle = new WebStyle<IControlProps>(
        {
            ZIndex: 9999999,
            Overlaps: true,
            Background: "rgba(255,255,255,0.75)",
            TransitionState: UITransitionState.New,
            EntranceAnimation: ThemeEffect.AnimateQuickFadeIn,
            ExitAnimation: ThemeEffect.AnimateQuickFadeOut,            
            Template: (templatedParent: Control) =>
                <Panel Background={templatedParent.Background}>
                    <ProgressRing
                        HorizontalAlignment={HorizontalAlignment.Center}
                        VerticalAlignment={VerticalAlignment.Center}
                    />
                </Panel>            
        });

    public static DelayedStyle = new WebStyle<IControlProps>(
        {
            EntranceAnimation: ThemeEffect.AnimateDelayedQuickFadeIn,
            Opacity: 0,
        },
        {
        },
        BusyPanel.DefaultStyle);
}