import * as React from 'react';
import { Binding } from '@antimatterjs/react';
import { ProgressIndicator } from '@fluentui/react'
import { Control, IControlProps, IControlState } from './Control';
import { Style } from '@antimatterjs/positron/src/Style';

export interface IProgressBarProps extends IControlProps
{
    Progress?: number | Binding,
    Denominator?: number | Binding,
    Indeterminate?: boolean | Binding
}

interface IProgressBarState extends IControlState
{
    Progress?: number,
    Denominator?: number,
    Indeterminate?: boolean
}

//class ProgressBarBase<P extends IProgressBarProps = {}, S extends IProgressBarState = {}> extends Control<P, S>
export class ProgressBar extends Control<IProgressBarProps, IProgressBarState>
{
    static DefaultStyle: Style<IProgressBarProps> = new Style<IProgressBarProps>(
        {
            Denominator: 1,
            Template: (templatedParent: ProgressBar) =>
                <ProgressIndicator percentComplete={templatedParent.percentComplete} />
        }
    );

    private get percentComplete(): number | undefined {
        if (this.state.Indeterminate)
            return undefined;

        const numerator: number = this.state.Progress ?? 0;
        const denominator: number = this.state.Denominator ?? 1;
        return numerator / denominator;
    }
}

//export class ProgressBar extends ProgressBarBase<IProgressBarProps, IProgressBarState> { }