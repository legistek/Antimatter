import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { Style } from '../Style';
import { Shimmer } from '@fluentui/react';
import { StackPanel } from './StackPanel';
import { ControlTemplate } from '../FrameworkTemplate';

export interface ILoadingShimmerProps extends IControlProps
{
    Lines?: number,
    LineHeight?: number
}
export interface ILoadingShimmerState extends IControlState
{
    Lines?: number,
    LineHeight?: number
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
                    var percent = (30 + (Math.random() * 70)).toString() + "%";
                    shimmers.push((<Shimmer
                        key={i}
                        className="shimmer"
                        style={{ lineHeight: templatedParent.state.LineHeight }}
                        width={percent}/>));
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