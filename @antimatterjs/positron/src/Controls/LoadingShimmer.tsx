import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { Style } from '../Style';
import { Shimmer } from '@fluentui/react';
import { StackPanel } from './StackPanel';

export interface ILoadingShimmerProps extends IControlProps
{
    Lines?: number,
}
export interface ILoadingShimmerState extends IControlState
{
    Lines?: number
}

export class LoadingShimmer<
    P extends ILoadingShimmerProps = {},
    S extends IControlState = {}> extends Control<ILoadingShimmerProps, ILoadingShimmerState>
{
    public static DefaultStyle: Style<ILoadingShimmerProps> = new Style<ILoadingShimmerProps>(
        {
            Template: (templatedParent: LoadingShimmer) =>
            {
                if (!templatedParent.state.Lines)
                    return (<></>);
                let shimmers: any[] = [];
                const step = 100 / templatedParent.state.Lines;
                for (let i: number = 0; i < (templatedParent.state.Lines || 0); i++)
                {
                    var percent = (100 - i * step).toString() + "%";
                    shimmers.push((<Shimmer className="shimmer" width={percent} />));
                }
                return (<StackPanel>{shimmers}</StackPanel>);
            }
        },
        {
            Selector: "@ .shimmer",
            Rules: {
                margin: "5px"
            }
        });
}