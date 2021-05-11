import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { Style } from '../Style';
import { Grid, IColumNDefinition, IGridChildPosition, IGridDefinition, IGridProps, IGridState, IRowDefinition } from './Grid';
import { HorizontalAlignment, Orientation, Side, VerticalAlignment } from '../Enums';
import { Panel } from './Panel';
import { sizeBoolean } from '@fluentui/react';

export interface IResizePanelProps extends IControlProps
{
    ResizerSide?: Side,
    Size?: number | Binding,            
    Thickness?: number
}
export interface IResizePanelState extends IControlState
{
    ResizerSide?: Side,
    Size?: number,
    Thickness?: number
}

export class ResizePanel<P extends IResizePanelProps = {},
    S extends IResizePanelState = {}>
    extends Control<P,S>
{
    /* private */ _isDragging: boolean = false;
    /* private */ _element: HTMLElement | null = null;
    /* private */ _capturedPointerID?: number;
    /* private */ _dragStartSize?: number;
    /* private */ _activeGridElement?: IGridDefinition;

    public static DefaultStyle: Style<IResizePanelProps> = new Style<IResizePanelProps>(
        {
            Thickness: 5,
            Template: (templatedParent: ResizePanel<IResizePanelProps, IResizePanelState>) => 
            (
                <Grid
                    ColumnDefinitions={templatedParent.ComputeColumnDefinitions()}
                    RowDefinitions={templatedParent.ComputeRowDefinitions()}> 

                    <Grid Grid={templatedParent.ComputeChildGridPosition()}>
                        {templatedParent.props.children}
                    </Grid>
                    <Grid
                        ClassName={"sizer " + (templatedParent._isDragging ? "resizing" : "")}
                        Grid={templatedParent.ComputeResizerGridPosition()}
                        Background={templatedParent.state.Background}
                        OnPointerDown={e => templatedParent.OnPointerDown(e)}
                        OnPointerUp={e => templatedParent.OnPointerUp(e)}
                        OnLostPointerCapture={e => templatedParent.OnPointerUp(e)}
                        OnPointerMove={e => templatedParent.OnPointerMove(e)} />

                </Grid>
            ),
        },
        {            
            Selector: "@ .sizer.resizing",
            Rules:
            {
                background: "black"
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

    /* private */ OnPointerDown(e: PointerEvent)
    {
        if (this._isDragging)
            return; // should be impossible

        this._element = e.target as HTMLElement;
        if (!this._element)
            return;

        this._element?.setPointerCapture(e.pointerId);
        this._capturedPointerID = e.pointerId;
        this._dragStartSize = this.state.Size;

        switch (this.state.ResizerSide)
        {
            case Side.Top:
                break;
            case Side.Bottom:
                break;
            case Side.Left:
                break;
            case Side.Right:
                break;
        }

        switch (this.state.ResizerSide)
        {
            case Side.Top:
                break;
            case Side.Bottom:
                break;
            case Side.Left:
                break;
            case Side.Right:
                break;
        }
    }

    /* private */ OnPointerMove(e: PointerEvent)
    {
        if (!this._isDragging)
            return;

    }

    /* private */ OnPointerUp(e: PointerEvent)
    {
        if (!this._isDragging || !this._capturedPointerID)
            return;

        this._element?.releasePointerCapture(this._capturedPointerID);
        this._isDragging = false;
        this._capturedPointerID = undefined;
    }

    /* private */ ComputeColumnDefinitions(): IColumNDefinition[]
    {
        if (this.state.ResizerSide === Side.Left)
            return [Grid.ColumnDefinition(this.state.Thickness), Grid.ColumnDefinition(this.state.Size)];
        else if (this.state.ResizerSide === Side.Right)
            return [Grid.ColumnDefinition(this.state.Size), Grid.ColumnDefinition(this.state.Thickness)];
        else
            return [];
    }

    /* private */ ComputeRowDefinitions(): IRowDefinition[]
    {
        if (this.state.ResizerSide === Side.Top)
            return [Grid.RowDefinition(this.state.Thickness), Grid.RowDefinition(this.state.Size)];
        else if (this.state.ResizerSide === Side.Bottom)
            return [Grid.RowDefinition(this.state.Size), Grid.RowDefinition(this.state.Thickness)];
        else
            return [];
    }

    /* private */ ComputeResizerGridPosition(): IGridChildPosition       
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

    /* private */ ComputeChildGridPosition(): IGridChildPosition
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
}

