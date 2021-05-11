import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { Style } from '../Style';
import { Grid, IGridDefinition, IGridProps, IGridState } from './Grid';
import { HorizontalAlignment, Orientation, VerticalAlignment } from '../Enums';

export interface ISizerProps extends IControlProps
{
    GridParent?: Grid<IGridProps, IGridState>,
    TargetRowOrColumn?: number,
    Orientation?: Orientation,
    Thickness?: number
}
export interface ISizerState extends IControlState
{
    GridParent?: Grid<IGridProps, IGridState>,
    TargetRowOrColumn?: number,
    Orientation?: Orientation,
    Thickness?: number
}

export class Sizer<P extends ISizerProps = {},
    S extends ISizerState = {}>
    extends Control<P,S>
{
    /* private */ _isDragging: boolean = false;
    /* private */ _element: HTMLElement | null = null;
    /* private */ _capturedPointerID?: number;
    /* private */ _dragStartOffset?: number;
    /* private */ _activeGridElement?: IGridDefinition;

    public static VerticalStyle: Style<ISizerProps> = new Style<ISizerProps>(
        {
            VerticalAlignment: VerticalAlignment.Stretch,
            HorizontalAlignment: HorizontalAlignment.Center,
            Template: (templatedParent: Sizer<ISizerProps, ISizerState>) => 
            (
                <div
                    ref={r => templatedParent._element = r}
                    style={{
                        background: templatedParent.state.Background,
                        width: templatedParent.state.Thickness,
                    }}
                    onPointerDown={e => templatedParent.OnPointerDown(e.nativeEvent)}
                    onPointerMove={e => templatedParent.OnPointerMove(e.nativeEvent)}
                    onPointerUp={e => templatedParent.OnPointerUp(e.nativeEvent)}
                    onLostPointerCapture={e => templatedParent.OnPointerUp(e.nativeEvent)}>

                </div>
            ),
            Orientation: Orientation.Vertical,
        },
        {            
            Selector: "@ .resizing",
            Rules:
            {
                background: "black"
            }
        },
        {
            Selector: "@",
            Rules:
            {
                cursor: "col-resize"
            }
        }
    );

    /* private */ OnPointerDown(e: PointerEvent)
    {
        if (this._isDragging ||
            !this._element)
            return; // should be impossible
        this._element?.setPointerCapture(e.pointerId);
        this._capturedPointerID = e.pointerId;

        if (this.state.Orientation === Orientation.Horizontal)
        {
            if (!this.state.GridParent?.state?.RowDefinitions || 
                !this.state.Grid?.Row)
                return;
            if (this.state.VerticalAlignment === VerticalAlignment.Top)
            {
                this._dragStartOffset = this._element.offsetTop;
                this._activeGridElement = this.state.GridParent
                    .state
                    .RowDefinitions[this.state.Grid.Row - 1];
            }
            else
            {
                this._dragStartOffset = this._element.offsetTop + this._element.clientHeight;
                this._activeGridElement = this.state.GridParent
                    .state
                    .RowDefinitions[this.state.Grid.Row + 1];
            }
        }
        else
        {
            if (!this.state.GridParent?.state?.ColumnDefinitions ||
                !this.state.Grid?.Column)
                return;
            if (this.state.HorizontalAlignment === HorizontalAlignment.Left)
            {
                this._dragStartOffset = this._element.offsetLeft;
                this._activeGridElement = this.state.GridParent
                    .state
                    .ColumnDefinitions[this.state.Grid.Column - 1];
            }
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
}

