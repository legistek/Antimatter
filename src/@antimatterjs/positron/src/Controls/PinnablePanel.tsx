import * as React from 'react';
import { Binding, BindingMode, PropertyChangedEventArgs, RelativeSourceMode, Utilities } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { WebStyle } from '../Style';
import { StackPanel } from './StackPanel';
import { ControlTemplate } from '../FrameworkTemplate';
import { Grid, IColumnDefinition, IGridChildPosition } from './Grid';
import { IPanelProps, IPanelState, Panel, PanelBase } from './Panel';
import { CommandButton } from './CommandButton';
import { HorizontalAlignment, Side, VerticalAlignment } from '../Enums';
import { ResizePanel } from './ResizePanel';
import { DefaultEffects, MotionAnimations } from '@fluentui/react';
import { FrameworkElement } from '../FrameworkElement';
import { CSSClasses } from '../CSSClasses';
import { SemanticColor, Theme, ThemeColor, ThemeEffect, ThemeLayout } from '../Theme';
import { Window } from './Window';

export interface IPinnablePanelProps extends IControlProps
{
    children?: React.ReactNode;
    IsCollapsed?: Binding | boolean,
    IsPinned?: Binding | boolean,
    IsModal?: boolean | Binding,
    Side?: Side,
    Size?: number | string | null | Binding,
    SizerThickness?: number,
    SizerFill?: string | SemanticColor | ThemeColor| Binding,
    CanResize?: boolean | Binding,
    OnCollapse?: () => void,
    IsCollapseButtonVisible?: boolean | Binding,
    CollapseButtonIcon?: number | string | Binding,
    IsPinButtonVisible?: boolean | Binding,
    PinButtonIcon?: number | string | Binding,

    IsSizerSeamless?: boolean,
    CanPinOrUnpin?: boolean,
}

export interface IPinnablePanelState extends IControlState
{
    IsCollapsed?: Binding | boolean,
    IsPinned?: Binding | boolean,
    IsModal?: boolean,
    Side?: Side,
    Size?: number,
    SizerFill?: string,
    CanResize?: boolean,
    OnCollapse?: () => void,
    CollapseButtonIcon?: number | string,
    IsCollapseButtonVisible?: boolean,
    PinButtonIcon?: number | string,
    IsPinButtonVisible?: boolean,
}

export class PinnablePanelBase<P extends IPinnablePanelProps,
    S extends IPinnablePanelState> extends Control<P, S>
{
    public static DefaultStyle: WebStyle<IPinnablePanelProps> = new WebStyle<IPinnablePanelProps>(
        {
            IsPinned: true,
            IsCollapsed: false,
            IsModal: false,
            IsCollapseButtonVisible: true,
            IsPinButtonVisible: true,
            BorderThickness: ThemeLayout.StandardBorder,
            PinButtonIcon: "pin",
            SizerThickness: 10,
            BorderBrush: SemanticColor.BodyFrameDivider,
            CanResize: true,
            Background: SemanticColor.BodyBackground,
            IsHitTestVisible: true,
            Template: (templatedParent: PinnablePanel) =>
            {
                var resizePanel = (
                    <ResizePanel
                        Grid={{ Column: templatedParent.GetResizePanelColumn() }}
                        ref={(r) =>
                        {
                            templatedParent._floatPanel = r;
                            r?.OnClickOutsideMe(() =>
                            {
                                if (templatedParent.IsPinned || templatedParent.IsModal || templatedParent.IsCollapsed)
                                    return;
                                templatedParent.Collapse(true);
                            });
                        }}
                        IsHitTestVisible={templatedParent.IsHitTestVisible}
                        ClassName={templatedParent.IsPinned ? "float-panel" : templatedParent.GetFloatPanelClassName()}
                        Background={templatedParent.Background}
                        Size={new Binding({
                            Source: templatedParent,
                            Path: nameof(templatedParent.Size),
                            Mode: BindingMode.TwoWay
                        })}
                        SizerFill={templatedParent.SizerFill}
                        BoxShadow={templatedParent.BoxShadow}
                        ResizerSide={templatedParent.state.Side ? ResizePanel.Opposite(templatedParent.state.Side) : Side.Right}
                        CanResize={templatedParent.CanResize}
                        BorderBrush={templatedParent.BorderBrush}
                        BorderThickness={templatedParent.BorderThickness}
                        IsSizerSeamless={templatedParent.IsSizerSeamless}
                    >
                        <React.Fragment key="panel-content">
                            {templatedParent.props.children}
                        </React.Fragment>
                        {
                            !templatedParent.IsPinned &&
                            templatedParent.state.IsPinButtonVisible &&
                            templatedParent.CanPinOrUnpin &&
                            <CommandButton
                                Margin="5px"
                                Style={CommandButton.IconButtonStyle}
                                Icon={templatedParent.state.PinButtonIcon}
                                Overlaps={true}
                                Padding="0"
                                HorizontalAlignment={templatedParent.GetCollapseButtonHAlign()}
                                VerticalAlignment={templatedParent.GetCollapseButtonVAlign()}
                                Command={() => templatedParent.SetValue(nameof(templatedParent.state.IsPinned), true)} />
                        }
                        {
                            templatedParent.IsPinned &&
                            templatedParent.state.IsCollapseButtonVisible &&
                            templatedParent.CanPinOrUnpin &&
                            (<CommandButton
                                Margin="5px"
                                Style={CommandButton.IconButtonStyle}
                                Icon={templatedParent.GetCollapseButtonIcon()}
                                Overlaps={true}
                                Padding="0"
                                HorizontalAlignment={templatedParent.GetCollapseButtonHAlign()}
                                VerticalAlignment={templatedParent.GetCollapseButtonVAlign()}
                                Command={() => templatedParent.Collapse(false)} />)
                        }
                    </ResizePanel>);

                if (templatedParent.IsModal && !templatedParent.IsPinned)
                {
                    return (
                        <Grid
                            ColumnDefinitions={templatedParent.GetColumnDefinitions()}>
                            {
                                templatedParent.IsModal && !templatedParent.IsPinned &&
                                (<Panel
                                    ref={(r) => { templatedParent._modalPanel = r; } }
                                    ClassName="modal-panel"
                                    Background="rgba(255,255,255,0.5)"
                                    Grid={{ Column: templatedParent.GetModalCoverColumn() }} />)
                            }
                            {resizePanel}
                        </Grid>);
                }
                else
                {
                    return resizePanel;
                }
            }
        },
        {
            "@.amx-ptn-overlaps": {
                zIndex: "99999 !important" as any,
            },
            "@ .float-panel": {
                //pointerEvents: "all"
            },
            "@ .float-panel.fp-left": {
                //boxShadow: "4.5px 0px 14.4px 0 rgb(0 0 0 / 13%)",
                //marginRight: "20px",
                opacity: "0%",
                zIndex: 99999
            },
            "@ .float-panel.fp-right": {
                //boxShadow: "-4.5px 0px 14.4px 0 rgb(0 0 0 / 13%)",
                //marginLeft: "20px",
                opacity: "0%",
                zIndex: 99999
            },
            "@ .modal-panel": {
                pointerEvents: "all",
                animation: `${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            }
        }
    );

    private _lastPinPreference: boolean = false;

    public override OnBoundPropertyUpdate(property: string, value: any, oldValue: any)
    {
        if (property === nameof(this.props.CanPinOrUnpin) && value === false ||
            property === nameof(this.props.IsPinned) && value == true && !this.CanPinOrUnpin)
        {
            if (property === nameof(this.props.IsPinned))
                this._lastPinPreference = value;
            this.SetValue(nameof(this.props.IsPinned), false, false, false);
            this.SetValue(nameof(this.props.IsCollapsed), true, true, false);
        }
        else if (property === nameof(this.props.IsPinned))
            this._lastPinPreference = value;
        else if (property === nameof(this.props.CanPinOrUnpin) &&
            value === true &&
            oldValue !== true &&
            this._lastPinPreference)
        {
            this.SetValue(nameof(this.props.IsPinned), true, true, false);
        }
    }

    public get CanPinOrUnpin(): boolean
    {
        return this.GetValue(nameof(this.props.CanPinOrUnpin), true);
    }

    private GetModalCoverColumn(): number
    {
        if (this.Side === Side.Left)
            return 1;
        else
            return 0;
    }

    private GetResizePanelColumn(): number
    {
        if (this.Side === Side.Left)
            return 0;
        else
            return 1;
    }

    private GetColumnDefinitions(): IColumnDefinition[]
    {
        if (this.Side === Side.Left)
            return [Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)];
        else
            return [Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()];
    }

    protected /* virtual */ async OnElementRendered()
    {
        //await Utilities.SleepAsync(1); // hack for Safari naturally

        if (!this._floatPanel?.Container || this.IsPinned || this.IsCollapsed)
        {
            if (this._floatPanel?.Container)
                this._floatPanel.Container.style.animation = '';
            return;
        }

        if (this.Side == Side.Right)
            this._floatPanel.Container.style.animation = Theme.Value(ThemeEffect.AnimateEntranceFromRight);
        else if (this.Side == Side.Left)
            this._floatPanel.Container.style.animation = Theme.Value(ThemeEffect.AnimateEntranceFromLeft);
    }

    public get Side(): Side
    {
        return this.GetValue(nameof(this.props.Side), Side.Left);
    }

    public get Size(): number|undefined|null
    {
        return this.GetValue(nameof(this.props.Size));
    }
    public set Size(value: number|undefined|null)
    {
        this.SetValue(nameof(this.props.Size), value);
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.Size)));
    }


    public get IsSizerSeamless(): boolean {
        return this.GetValue(nameof(this.props.IsSizerSeamless), true);
    }

    public get CanResize(): boolean
    {
        return this.GetValue(nameof(this.props.CanResize), true);
    }

    public get IsModal(): boolean
    {
        return this.GetValue(nameof(this.props.IsModal), false);
    }

    public get SizerFill(): string
    {
        return this.GetValue(nameof(this.props.SizerFill));
    }

    public get SizerThickness(): string
    {
        return this.GetValue(nameof(this.props.SizerThickness));
    }

    public get IsCollapsed(): boolean
    {
        return this.GetValue(nameof(this.props.IsCollapsed), false);
    }

    public get IsPinned(): boolean
    {
        return this.GetValue(nameof(this.props.IsPinned), true);
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
            //if (this._floatPanel?.Container)
            //{
            //    this._floatPanel.Container.style.animation = "unset";
            //}
            //if (this._modalPanel?.Container)
            //{
            //    this._modalPanel.Container.style.animation = "unset";
            //}
        }

        this.SetValue(nameof(this.state.IsCollapsed), true);
    }

    private GetFloatPanelClassName(): string
    {
        switch (this.state.Side)
        {
            case Side.Top:
                return "float-panel fp-top";
            case Side.Right:
                return "float-panel fp-right";
            case Side.Left:
                return "float-panel fp-left";
            case Side.Bottom:
                return "float-panel fp-bottom";
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
        return super.constructClasses() + (this.IsFloating ? `${CSSClasses.Overlaps} ` : "");
    }

    getCSSStyles()
    {
        var styles = super.getCSSStyles();
        styles.pointerEvents = "none";
        if (this.IsCollapsed)
            styles.display = "none";
        if (this.IsFloating)
        {
            if (this.state.Side === Side.Left || this.state.Side === Side.Right)
                styles.gridColumn = undefined;
            else
                styles.gridRow = undefined;
        }
        if (!this.IsEnabled)
            styles.opacity = 0.5;
        return styles;
    }

    private get IsFloating(): boolean
    {
        return !this.state.IsCollapsed && !this.state.IsPinned;
    }

    private _floatPanel: ResizePanel | null = null;
    private _modalPanel: Panel | null = null;
}

export class PinnablePanel extends PinnablePanelBase<IPinnablePanelProps, IPinnablePanelState>
{
}