import * as React from 'react';
import { Binding, BindingMode, PropertyChangedEventArgs, RelativeSourceMode, Utilities } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { Style } from '../Style';
import { StackPanel } from './StackPanel';
import { ControlTemplate } from '../FrameworkTemplate';
import { Grid, IGridChildPosition } from './Grid';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { CommandButton } from './CommandButton';
import { HorizontalAlignment, Side, VerticalAlignment } from '../Enums';
import { ResizePanel } from './ResizePanel';
import { DefaultEffects, getTheme, MotionAnimations } from '@fluentui/react';
import { FrameworkElement } from '../FrameworkElement';
import { template } from '@babel/core';

export enum PinnablePanelState
{
    Collapsed = 0,
    Floating = 1,
    Pinned = 2,
}

export interface IPinnablePanelProps extends IControlProps
{
    State?: PinnablePanelState | Binding,
    IsModal?: boolean,
    Side?: Side,
    Size?: number | Binding,
    CanResizeWhenPinned?: boolean | Binding,
    OnCollapse?: () => void,
    CollapseButtonIcon?: number | string | Binding,
}

export interface IPinnablePanelState extends IControlState
{
    State?: PinnablePanelState,
    IsModal?: boolean,
    Side?: Side,
    Size?: number,
    CanResizeWhenPinned?: boolean,
    OnCollapse?: () => void,
    CollapseButtonIcon?: number | string,
}

export class PinnablePanelBase<P extends IPinnablePanelProps,
    S extends IPinnablePanelState> extends Control<P, S>
{
    static theme = getTheme();

    public static DefaultStyle: Style<IPinnablePanelProps> = new Style<IPinnablePanelProps>(
        {
            State: PinnablePanelState.Pinned,
            Size: 200,
            IsModal: true,
            BorderThickness: "1px",
            BorderBrush: PinnablePanelBase.theme.semanticColors.bodyFrameDivider,
            CanResizeWhenPinned: true,
            Background: PinnablePanelBase.theme.semanticColors.bodyBackground,
            Template: (templatedParent: PinnablePanel) =>
            {
                if (!templatedParent.state.State)
                {
                    // Collapsed             
                    return (<></>);
                }

                if (templatedParent.state.State === PinnablePanelState.Pinned)
                {
                    return (
                        <ResizePanel
                            Background={templatedParent.state.Background}
                            BorderBrush={templatedParent.state.BorderBrush}
                            BorderThickness={templatedParent.state.BorderThickness}
                            BoxShadow={templatedParent.state.BoxShadow}
                            Thickness={7}
                            Size={new Binding({
                                Source: templatedParent,
                                Path: nameof(templatedParent.state.Size),
                                Mode: BindingMode.TwoWay
                            })}
                            ResizerSide={templatedParent.state.Side ? ResizePanel.Opposite(templatedParent.state.Side) : Side.Right}
                            CanResize={templatedParent.state.CanResizeWhenPinned}>
                            {templatedParent.props.children}
                            <CommandButton
                                Margin="5px"
                                Style={CommandButton.IconButtonStyle}
                                Icon={templatedParent.GetCollapseButtonIcon()}
                                Overlaps={true}
                                Padding="0"
                                HorizontalAlignment={templatedParent.GetCollapseButtonHAlign()}
                                VerticalAlignment={templatedParent.GetCollapseButtonVAlign()}
                                Command={() => templatedParent.Collapse(false)} />
                        </ResizePanel>
                    );
                }
                
                return (
                    <Grid ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}>
                        {templatedParent.state.IsModal &&
                            (<Panel
                                ref={(r) => templatedParent._modalPanel = r}
                                ClassName="modal-panel"
                                Background="rgba(255,255,255,0.5"
                                Grid={{ Column: 0 }} />)}
                        <Panel
                            Grid={{Column: 1}}
                            ref={(r) =>
                            {
                                templatedParent._floatPanel = r;
                                if (r?.Container)
                                {
                                    r.Container.tabIndex = 0;
                                    r.Container.focus();
                                    r.Container.onblur = (e) =>
                                    {
                                        if (!e.currentTarget)
                                            return;
                                        if (!(e.currentTarget as any).contains(e.relatedTarget))
                                            templatedParent.Collapse(true);
                                    };
                                }
                            }}
                            ClassName={templatedParent.GetFloatPanelClassName()}
                            Background={templatedParent.state.Background}
                            Width={(templatedParent.state.Side === Side.Left || templatedParent.state.Side === Side.Right)
                                    ? templatedParent.Size
                                : undefined}
                            Height={(templatedParent.state.Side === Side.Top || templatedParent.state.Side === Side.Bottom)
                                ? templatedParent.Size
                                : undefined}
                            BorderBrush={templatedParent.state.BorderBrush}
                            BorderThickness={templatedParent.state.BorderThickness}>
                            {templatedParent.props.children}
                            <CommandButton
                                Margin="5px"
                                Style={CommandButton.IconButtonStyle}
                                Icon="pin"
                                Overlaps={true}
                                Padding="0"
                                HorizontalAlignment={templatedParent.GetCollapseButtonHAlign()}
                                VerticalAlignment={templatedParent.GetCollapseButtonVAlign()}
                                Command={() => templatedParent.SetValue(nameof(templatedParent.state.State), PinnablePanelState.Pinned)} />
                        </Panel>
                    </Grid>);
            }
        },
        {
            Selector: "@.amx-ptn-overlaps",
            Rules: {
                zIndex: 99999,                
            },
        },
        {
            Selector: "@ .float-panel-left",
            Rules: {
                animation: `${MotionAnimations.slideRightIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`,
                boxShadow: "4.5px 0px 14.4px 0 rgb(0 0 0 / 13%)",
                //marginRight: "20px",
                zIndex: 99999
            }
        },
        {
            Selector: "@ .float-panel-right",
            Rules: {
                animation: `${MotionAnimations.slideLeftIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`,
                boxShadow: "-4.5px 0px 14.4px 0 rgb(0 0 0 / 13%)",                
                //marginLeft: "20px",
                zIndex: 99999
            }
        },
        {
            Selector: "@ .modal-panel",
            Rules: {
                animation: `${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            }
        }
    );

    public get Size(): number
    {
        return this.state.Size as number;
    }
    public set Size(value: number)
    {
        this.SetValue(nameof(this.state.Size), value);
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.state.Size)));
    }
    
    private async Collapse(floating: boolean)
    {        
        if (floating)
        {
            if (this._floatPanel?.Container)
            {
                this._floatPanel.Container.style.animation = `${MotionAnimations.slideRightOut.replace("100ms", "400ms")}, ${MotionAnimations.fadeOut.replace("100ms", "400ms")}`;
                this._floatPanel.Container.style.animationFillMode = 'forwards';
            }
            if (this._modalPanel?.Container)
            {
                this._modalPanel.Container.style.animation = `${MotionAnimations.fadeOut.replace("100ms", "400ms")}`;
                this._modalPanel.Container.style.animationFillMode = 'forwards';
            }
            await Utilities.SleepAsync(400);
        }               
        
        this.SetValue(nameof(this.state.State), PinnablePanelState.Collapsed);
    }
    
    private GetFloatPanelClassName(): string
    {
        switch (this.state.Side)
        {
            case Side.Top:
                return "float-panel-top";
            case Side.Right:
                return "float-panel-right";
            case Side.Left:
                return "float-panel-left";
            case Side.Bottom:
                return "float-panel-bottom";            
        }
        return '';
    }

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

    constructClasses()
    {
        return super.constructClasses() +
            (this.state.State === PinnablePanelState.Floating ? "amx-ptn-overlaps " : "");
    }

    getCSSStyles()
    {
        var styles = super.getCSSStyles();
        if (this.state.State === PinnablePanelState.Floating)
        {
            styles.gridColumn = undefined;
            styles.gridRow = undefined;
        }
        return styles;
    }

    private _floatPanel: Panel | null = null;
    private _modalPanel: Panel | null = null;
}

export class PinnablePanel extends PinnablePanelBase<IPinnablePanelProps, IPinnablePanelState>
{
}