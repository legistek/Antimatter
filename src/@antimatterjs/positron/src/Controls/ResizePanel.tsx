import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { WebStyle } from '../Style';
import { Grid, IColumnDefinition, IGridChildPosition, IGridDefinition, IGridProps, IRowDefinition } from './Grid';
import { HorizontalAlignment, Side, VerticalAlignment } from '../Enums';
import { ControlTemplate } from '../FrameworkTemplate';
import { SemanticColor, Theme, ThemeColor } from '../Theme';

export interface IResizePanelProps extends IControlProps
{
    children?: React.ReactNode;
    IsSizerSeamless?: boolean,
    SizerFill?: string | ThemeColor | SemanticColor,
    ResizerSide?: Side,
    Size?: number | string | Binding,
    CanResize?: boolean | Binding,
    Thickness?: number,
}
export interface IResizePanelState extends IControlState
{
    ResizerSide?: Side,
    Size?: number | string,
    CanResize?: boolean,
    Thickness?: number
}

export class ResizePanelBase<P extends IResizePanelProps = {},
    S extends IResizePanelState = {}>
    extends Control<P, S>
{
    public static Opposite(side: Side): Side
    {
        switch (side)
        {
            case Side.Bottom:
                return Side.Top;
            case Side.Top:
                return Side.Bottom;
            case Side.Left:
                return Side.Right;
            case Side.Right:
                return Side.Left;
        }
    }

    constructor(props)
    {
        super(props);
        switch (this.state.ResizerSide)
        {
            case Side.Top:
                (this.state as any)["VerticalAlignment"] = VerticalAlignment.Bottom;
                break;
            case Side.Bottom:
                (this.state as any)["VerticalAlignment"] = VerticalAlignment.Top;
                break;
            case Side.Left:
                (this.state as any)["HorizontalAlignment"] = HorizontalAlignment.Right;
                break;
            case Side.Right:
                (this.state as any)["HorizontalAlignment"] = HorizontalAlignment.Left;
                break;
        }
    }

    public static DefaultBindings = {
        Size: {
            Mode: BindingMode.TwoWay
        }
    };

    public static DefaultStyle: WebStyle<IResizePanelProps> = new WebStyle<IResizePanelProps>(
        {
            Thickness: 5,
            CanResize: true,
            SizerFill: "transparent",
            ObserveResize: true,
            Template: new ControlTemplate((templatedParent: ResizePanelBase<IResizePanelProps, IResizePanelState>) =>
            {
                return (
                    <Grid                        
                        Background={templatedParent.Background}
                        ColumnDefinitions={templatedParent.ComputeColumnDefinitions()}
                        RowDefinitions={templatedParent.ComputeRowDefinitions()}>
                        {
                            // For some f-ed up reason CSS requires the grid children
                            // to be in order even if you specify the grid-row/column explicitly
                            templatedParent.state.ResizerSide === Side.Left || templatedParent.state.ResizerSide === Side.Top
                                ? (<>
                                    {templatedParent.ConstructChildElement(templatedParent)}
                                    {templatedParent.ConstructSizerElement(templatedParent)}
                                </>)
                                : (<>
                                    {templatedParent.ConstructChildElement(templatedParent)}
                                    {templatedParent.ConstructSizerElement(templatedParent)}
                                </>)
                        }
                    </Grid>
                );
            }),
        },
        {
            "@ .sizer.resizing": {
                background: Theme.Value(SemanticColor.MenuItemBackgroundPressed)
            },
            "@ .sizer.sizer-ew": {
                cursor: "ew-resize"
            },
            "@ .sizer.sizer-ns": {
                cursor: "ns-resize"
            }
        }
    );

    override getCSSStyles()
    {
        var styles = super.getCSSStyles();
        styles.boxShadow = this.BoxShadow;
        return styles;
    }

    protected /* virtual */ OnResize()
    {       
        this.CheckNoOverflow();
    }

    private CheckNoOverflow()
    {
        //if (this.MaxWidth === undefined)
            //return;

        var container = this.Container;
        if (!container?.parentElement?.clientWidth || this.Size === undefined)
            return;

        if (this.Size > container.parentElement.clientWidth - (this.Thickness || 0))
            this.SetValue(
                nameof(this.props.Size),
                container.parentElement.clientWidth - (this.Thickness || 0));
    }

    public get ResizerSide(): Side
    {
        return this.GetValue(nameof(this.props.ResizerSide), Side.Top);
    }

    public get Size(): number | undefined
    {
        return this.GetValue(nameof(this.props.Size));
    }

    public get SizerFill(): string | undefined
    {
        //if (this.IsSizerSeamless)
        //    return "transparent";
        return this.GetValue(nameof(this.props.SizerFill));
    }

    public get CanResize(): boolean
    {
        return this.GetValue(nameof(this.props.CanResize), true);
    }

    public get Thickness(): number | undefined
    {
        if (!this.CanResize)
            return 0;
        return this.GetValue(nameof(this.props.Thickness));
    }

    public get IsSizerSeamless(): boolean
    {
        return this.GetValue(nameof(this.props.IsSizerSeamless), false);
    }

    protected override OnContainerMounted(container: HTMLElement)
    {
        this.CheckNoOverflow();
    }

    /* private */ OnSizerPointerDown(e: PointerEvent)
    {
        if (!this.state.CanResize)
            return;
        if (this._isDragging)
            return; // should be impossible

        this._element = e.target as HTMLElement;
        if (!this._element)
            return;

        this._isDragging = true;
        this._element?.setPointerCapture(e.pointerId);
        this._capturedPointerID = e.pointerId;
        this._dragStartSize =
            Math.min(
                this.Container?.parentElement?.clientWidth || Number.MAX_VALUE,
                this.state.Size as number);

        switch (this.state.ResizerSide)
        {
            case Side.Top:
            case Side.Bottom:
                this._dragStartCoord = e.pageY;
                break;
            case Side.Left:
            case Side.Right:
                this._dragStartCoord = e.pageX;
                break;
        }

        //this.InvalidateRender();
    }

    /* private */ OnSizerPointerMove(e: PointerEvent)
    {
        if (!this._isDragging || !this._dragStartSize || !this._dragStartCoord)
            return;

        let newSize: number = 0;

        let delta: number = 0;
        switch (this.state.ResizerSide)
        {
            case Side.Top:
                delta = e.pageY - this._dragStartCoord;
                newSize = this._dragStartSize - delta;
                break;
            case Side.Bottom:
                delta = e.pageY - this._dragStartCoord;
                newSize = this._dragStartSize + delta;
                break;
            case Side.Left:
                delta = e.pageX - this._dragStartCoord;
                newSize = this._dragStartSize - delta;
                break;
            case Side.Right:
                delta = e.pageX - this._dragStartCoord;
                newSize = this._dragStartSize + delta;
                break;
        }

        this.SetValue(nameof(this.props.Size), newSize);
    }

    /* private */ OnSizerPointerUp(e: PointerEvent)
    {
        if (!this._isDragging || !this._capturedPointerID)
            return;

        this._element?.releasePointerCapture(this._capturedPointerID);
        this._isDragging = false;
        this._capturedPointerID = undefined;
        this.InvalidateRender();
    }

    private ComputeColumnDefinitions(): IColumnDefinition[]
    {
        if (this.state.ResizerSide === Side.Left)
            return [Grid.ColumnDefinition(this.Thickness), Grid.ColumnDefinition(this.Size)];
        else if (this.state.ResizerSide === Side.Right)
            return [Grid.ColumnDefinition(this.Size), Grid.ColumnDefinition(this.Thickness)];
        else
            return [];
    }

    private ComputeRowDefinitions(): IRowDefinition[]
    {
        if (this.state.ResizerSide === Side.Top)
            return [Grid.RowDefinition(this.Thickness), Grid.RowDefinition(this.Size)];
        else if (this.state.ResizerSide === Side.Bottom)
            return [Grid.RowDefinition(this.Size), Grid.RowDefinition(this.Thickness)];
        else
            return [];
    }

    private ComputeResizerGridPosition(): IGridChildPosition
    {
        switch (this.state.ResizerSide)
        {
            default:
            case Side.Top:
                return {
                    Row: 0
                };
            case Side.Bottom:
                return {
                    Row: 1
                };
            case Side.Left:
                return {
                    Column: 0,
                    ColumnSpan: this.IsSizerSeamless ? 2 : 1
                };
            case Side.Right:
                return {
                    Column: 1,
                };
        }
    }

    private ComputeChildGridPosition(): IGridChildPosition
    {
        switch (this.state.ResizerSide)
        {
            default:
            case Side.Top:
                return {
                    Row: 1
                };
            case Side.Bottom:
                return {
                    Row: 0
                };
            case Side.Left:
                return {
                    Column: this.IsSizerSeamless ? 0 : 1,
                    ColumnSpan: this.IsSizerSeamless ? 2 : 1,
                    Row: 0
                };
            case Side.Right:
                return {
                    Column: 0
                };
        }
    }

    private ConstructSizerElement(templatedParent: ResizePanelBase<IResizePanelProps, IResizePanelState>): JSX.Element
    {
        return (
            <Grid
                Grid={templatedParent.ComputeResizerGridPosition()}
                Overlaps={templatedParent.IsSizerSeamless}
                Width={templatedParent.IsSizerSeamless ? templatedParent.Thickness : undefined}
                Background={templatedParent.SizerFill}
                OnPointerDown={e => templatedParent.OnSizerPointerDown(e)}
                OnPointerUp={e => templatedParent.OnSizerPointerUp(e)}
                OnLostPointerCapture={e => templatedParent.OnSizerPointerUp(e)}
                OnPointerMove={e => templatedParent.OnSizerPointerMove(e)} >
                <div className={"sizer "
                    + (templatedParent._isDragging ? "resizing" : "")
                    + (templatedParent.ResizerSide === Side.Left || templatedParent.ResizerSide === Side.Right
                            ? "sizer-ew"
                            : "sizer-ns")
                } />
            </Grid>
        );
    }

    private ConstructChildElement(templatedParent: ResizePanelBase<IResizePanelProps, IResizePanelState>): JSX.Element
    {
        return (<Grid
            ClassName="resize-panel-content"
            Width={
                templatedParent.ResizerSide === Side.Left || templatedParent.ResizerSide === Side.Right
                    ? templatedParent.Size
                    : undefined
            }
            Height={
                templatedParent.ResizerSide === Side.Top || templatedParent.ResizerSide === Side.Bottom
                    ? templatedParent.Size
                    : undefined
            }
            BorderBrush={templatedParent.BorderBrush}
            BorderThickness={templatedParent.BorderThickness}            
            Grid={templatedParent.ComputeChildGridPosition()}>
            {templatedParent.props.children}
        </Grid>);
    }

    private _isDragging: boolean = false;
    private _element: HTMLElement | null = null;
    private _capturedPointerID?: number;
    private _dragStartSize?: number;
    private _dragStartCoord?: number;
    private _activeGridElement?: IGridDefinition;
}

export class ResizePanel extends ResizePanelBase<IResizePanelProps, IResizePanelState>
{
}