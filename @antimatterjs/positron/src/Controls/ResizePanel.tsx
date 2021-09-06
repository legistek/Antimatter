import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { Style } from '../Style';
import { Grid, IColumnDefinition, IGridChildPosition, IGridDefinition, IGridProps, IGridState, IRowDefinition } from './Grid';
import { HorizontalAlignment, Side, VerticalAlignment } from '../Enums';
import { getTheme } from '@fluentui/react';
import { ControlTemplate } from '../FrameworkTemplate';

export interface IResizePanelProps extends IControlProps
{
    ResizerSide?: Side,
    Size?: number | Binding,
    CanResize?: boolean | Binding,
    Thickness?: number
}
export interface IResizePanelState extends IControlState
{
    ResizerSide?: Side,
    Size?: number,
    CanResize?: boolean,
    Thickness?: number
}

export class ResizePanelBase<P extends IResizePanelProps = {},
    S extends IResizePanelState = {}>
    extends Control<P,S>
{
    static theme = getTheme();

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
   
    public static DefaultStyle: Style<IResizePanelProps> = new Style<IResizePanelProps>(
        {
            Thickness: 5,
            CanResize: true,
            Template: new ControlTemplate((templatedParent: ResizePanelBase<IResizePanelProps, IResizePanelState>) =>
            {
                console.log(`Width now: ${templatedParent.state.Size}`);
                return (
                    <Grid
                        ColumnDefinitions={templatedParent.ComputeColumnDefinitions()}
                        RowDefinitions={templatedParent.ComputeRowDefinitions()}>
                        {
                            // For some f-ed up reason CSS requires the grid children
                            // to be in order even if you specify the grid-row/column explicitly
                            templatedParent.state.ResizerSide === Side.Left || templatedParent.state.ResizerSide === Side.Top
                                ? (<>
                                    {templatedParent.ConstructSizerElement(templatedParent)}
                                    {templatedParent.ConstructChildElement(templatedParent)}
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
            Selector: "@ .sizer.resizing",
            Rules:
            {
                background: ResizePanelBase.theme.semanticColors.menuItemBackgroundPressed
            }
        },
        {
            Selector: "@ .sizer",
            Rules:
            {
                cursor: "col-resize"
            }
        }
    );

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
        this._dragStartSize = this.state.Size;

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

        let delta: number = 0;
        switch (this.state.ResizerSide)
        {
            case Side.Top:
                delta = e.pageY - this._dragStartCoord;
                this.SetValue(nameof(this.state.Size), this._dragStartSize - delta);
                break;
            case Side.Bottom:
                delta = e.pageY - this._dragStartCoord;
                this.SetValue(nameof(this.state.Size), this._dragStartSize + delta);
                break;
            case Side.Left:
                delta = e.pageX - this._dragStartCoord;
                this.SetValue(nameof(this.state.Size), this._dragStartSize - delta);
                break;
            case Side.Right:
                delta = e.pageX - this._dragStartCoord;
                this.SetValue(nameof(this.state.Size), this._dragStartSize + delta);
                break;
        }        
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
            return [Grid.ColumnDefinition(this.state.Thickness), Grid.ColumnDefinition(this.state.Size)];
        else if (this.state.ResizerSide === Side.Right)
            return [Grid.ColumnDefinition(this.state.Size), Grid.ColumnDefinition(this.state.Thickness)];
        else
            return [];
    }

    private ComputeRowDefinitions(): IRowDefinition[]
    {
        if (this.state.ResizerSide === Side.Top)
            return [Grid.RowDefinition(this.state.Thickness), Grid.RowDefinition(this.state.Size)];
        else if (this.state.ResizerSide === Side.Bottom)
            return [Grid.RowDefinition(this.state.Size), Grid.RowDefinition(this.state.Thickness)];
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
                    Column: 0
                };
            case Side.Right:
                return {
                    Column: 1
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
                    Column: 1
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
                Background={templatedParent.state.Background}
                OnPointerDown={e => templatedParent.OnSizerPointerDown(e)}
                OnPointerUp={e => templatedParent.OnSizerPointerUp(e)}
                OnLostPointerCapture={e => templatedParent.OnSizerPointerUp(e)}
                OnPointerMove={e => templatedParent.OnSizerPointerMove(e)} >
                <div className={"sizer " + (templatedParent._isDragging ? "resizing" : "")}/>
            </Grid>
        );
    }

    private ConstructChildElement(templatedParent: ResizePanelBase<IResizePanelProps, IResizePanelState>): JSX.Element
    {
        return (<Grid
            BorderBrush={templatedParent.state.BorderBrush}
            BorderThickness={templatedParent.state.BorderThickness}
            BoxShadow={templatedParent.state.BoxShadow}
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