import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { Style } from '../Style';
import { StackPanel } from './StackPanel';
import { ControlTemplate } from '../FrameworkTemplate';
import { Grid, IGridChildPosition } from './Grid';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { CommandButton } from './CommandButton';
import { HorizontalAlignment, Side, VerticalAlignment } from '../Enums';
import { ResizePanel } from './ResizePanel';

export interface IPinnablePanelProps extends IControlProps
{
    IsPinned?: boolean | Binding,
    IsOpen?: boolean | Binding,
    Side?: Side,
    Size?: number | Binding,
    CanResizeWhenPinned?: boolean | Binding,
    CollapseButtonIcon?: number | string | Binding,
}

export interface IPinnablePanelState extends IControlState
{
    IsPinned?: boolean,
    IsOpen?: boolean,
    Side?: Side,
    Size?: number,
    CanResizeWhenPinned?: boolean,
    CollapseButtonIcon?: number | string,
}

export class PinnablePanelBase<P extends IPinnablePanelProps,
    S extends IPinnablePanelState> extends Control<P, S>
{
    public static DefaultStyle: Style<IPinnablePanelProps> = new Style<IPinnablePanelProps>(
        {
            IsOpen: true,
            IsPinned: true,            
            Size: 200,
            BorderThickness: "1px",
            BorderBrush: "gray",
            CanResizeWhenPinned: true,
            Template: (templatedParent: PinnablePanel) =>
            {
                if (!templatedParent.state.IsOpen)
                    return (<></>);
                if (templatedParent.state.IsPinned)
                    return (
                        <ResizePanel
                            BorderBrush={templatedParent.state.BorderBrush}
                            BorderThickness={templatedParent.state.BorderThickness}
                            BoxShadow={templatedParent.state.BoxShadow}
                            Thickness={7}
                            Size={templatedParent.state.Size}
                            ResizerSide={templatedParent.state.Side ? ResizePanel.Opposite(templatedParent.state.Side) : Side.Right}
                            CanResize={templatedParent.state.CanResizeWhenPinned}>
                            {templatedParent.props.children}
                            <CommandButton
                                Margin={"0"}
                                Style={CommandButton.IconButtonStyle}
                                Icon={templatedParent.GetCollapseButtonIcon()}
                                Overlaps={true}
                                Padding="0"
                                HorizontalAlignment={templatedParent.GetCollapseButtonHAlign()}
                                VerticalAlignment={templatedParent.GetCollapseButtonVAlign()}
                                Command={() => templatedParent.Collapse()} />
                        </ResizePanel>
                    );                

                // TODO: Render shadowed floating item 
                return (<></>);
            }
        }
    );

    private GetCollapseButtonVAlign(): VerticalAlignment
    {
        switch (this.state.Side)
        {
            case Side.Top:
                return VerticalAlignment.Bottom;
            case Side.Right:
            case Side.Left:
            case Side.Bottom:
            default:
                return VerticalAlignment.Top;
        }
    }

    private GetCollapseButtonHAlign(): HorizontalAlignment
    {
        switch (this.state.Side)
        {
            case Side.Right:
            case Side.Bottom:
                return HorizontalAlignment.Left;
            case Side.Top:            
            case Side.Left:
            default:
                return HorizontalAlignment.Right;            
        }
    }

    private GetCollapseButtonIcon(): string | number
    {
        if (this.state.CollapseButtonIcon)
            return (this.state.CollapseButtonIcon as string | number);

        switch (this.state.Side)
        {
            case Side.Top:
                return "ChevronUp";
            case Side.Bottom:
                return "ChevronDown";            
            case Side.Right:                
                return "ChevronRight";
            case Side.Left:
            default:
                return "ChevronLeft";
        }
    }

    getCSSStyles()
    {
        var styles = super.getCSSStyles();
        if (!this.state.IsOpen)
            styles.display = "none";
        else if (this.state.IsPinned !== true)
            styles.position = "absolute";
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