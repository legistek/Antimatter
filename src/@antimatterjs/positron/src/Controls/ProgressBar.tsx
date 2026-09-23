import * as React from 'react';
import { Binding } from '@antimatterjs/react';
import { ProgressIndicator } from '@fluentui/react'
import { Control, IControlProps, IControlState } from './Control';
import { WebStyle } from '../Style';
import { ControlTemplate } from '../FrameworkTemplate';
import { SemanticColor, ThemeLayout } from '../Theme';

export interface IProgressBarProps extends IControlProps
{
    Progress?: number | null | Binding,
    Denominator?: number | Binding,
    Indeterminate?: boolean | Binding,
    Height?: string | ThemeLayout,
}

interface IProgressBarState extends IControlState
{
    Progress?: number | null,
    Denominator?: number,
    Indeterminate?: boolean
}

//class ProgressBarBase<P extends IProgressBarProps = {}, S extends IProgressBarState = {}> extends Control<P, S>
export class ProgressBar extends Control<IProgressBarProps, IProgressBarState>
{
    static DefaultStyle: WebStyle<IProgressBarProps> = new WebStyle<IProgressBarProps>(
        {
            Denominator: 1,
            Background: SemanticColor.BodyFrameDivider,
            Foreground: "#37c337",
            Height: "3px",
            Template: new ControlTemplate((templatedParent: ProgressBar) =>
                <ProgressIndicator
                    styles={{
                        root: {
                            width: "100%"
                        },
                        itemProgress: {
                            padding: "0px",
                            height: templatedParent.Height,
                        },
                        progressTrack: {
                            background: templatedParent.Background,
                            height: templatedParent.Height,
                        },
                        progressBar: {
                            background: templatedParent.Foreground,
                            height: templatedParent.Height,
                        }
                    }}
                    percentComplete={templatedParent.percentComplete} />)
        }
    );

    public get Height(): string
    {
        return this.GetValue(nameof(this.props.Height), "2px");
    }

    private get percentComplete(): number | undefined
    {
        if (this.state.Indeterminate ||
            this.state.Progress === null ||
            this.state.Progress === undefined )
            return undefined;

        const numerator: number = this.state.Progress ?? 0;
        const denominator: number = this.state.Denominator ?? 1;
        return numerator / denominator;
    }
}

//export class ProgressBar extends Progres7sBarBase<IProgressBarProps, IProgressBarState> { }