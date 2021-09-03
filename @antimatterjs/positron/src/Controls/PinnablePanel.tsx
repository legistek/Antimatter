import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { Style } from '../Style';
import { StackPanel } from './StackPanel';
import { ControlTemplate } from '../FrameworkTemplate';
import { IGridChildPosition } from './Grid';
import { IPanelProps, IPanelState, PanelBase } from './Panel';
import { CommandButton } from './CommandButton';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';

export interface IPinnablePanelProps extends IControlProps
{
    //PinnedGridPosition?: IGridChildPosition,
    IsPinned?: boolean | Binding,
    IsOpen?: boolean | Binding,
}

export interface IPinnablePanelState extends IControlState
{
    //PinnedGridPosition: IGridChildPosition,
    IsPinned?: boolean,
    IsOpen?: boolean
}

export class PinnablePanelBase<P extends IPinnablePanelProps,
    S extends IPinnablePanelState> extends Control<P, S>
{
    public static DefaultStyle: Style<IPinnablePanelProps> = new Style<IPinnablePanelProps>(
        {
            Template: (templatedParent: PinnablePanel) =>
            {
                if (templatedParent.state.IsPinned)
                    return (
                        <>
                            {templatedParent.props.children}
                            <CommandButton
                                Icon="Close"
                                Overlaps={true}
                                HorizontalAlignment={HorizontalAlignment.Right}
                                VerticalAlignment={VerticalAlignment.Top}
                                Command={() => templatedParent.Collapse()}
                            />
                        </>
                    );
                else
                    return (<></>);
            }
        }
    );

    getCSSStyles()
    {
        var styles = super.getCSSStyles();
        if (this.state.IsPinned !== true)
        {
            styles.position = "absolute";
        }
        return styles;
    }

    private Collapse(): void
    {
        this.SetValue(nameof(this.state.IsOpen), false);
    }
}

export class PinnablePanel extends PinnablePanelBase<IPinnablePanelProps, IPinnablePanelState>
{
}