import * as React from 'react';
import {
    AntimatterComponent,
    Binding,
    BindingMode,
    ModelObjectReference
} from '@antimatterjs/react';
import {
    Callout,
    IStyleFunctionOrObject,
    ISwatchColorPickerStyles
} from '@fluentui/react';

import { Style } from '@antimatterjs/positron/src/Style';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { Control, IControlProps, IControlState } from './Control';
import { FrameworkElement } from '../FrameworkElement';
import { CommandButton } from './CommandButton';
import { IPanelProps, IPanelState, Panel } from './Panel';
import { TextBlock } from './TextBlock';
import { PlacementMode, Popup } from './Popup';
import { Ellipse } from './Ellipse';
import { WrapPanel } from './WrapPanel';

//export interface IHoboPickerProps extends IItemsControlProps {
export interface IHoboPickerProps extends IControlProps {
    ItemsSource: any[] | Binding,
    SelectedColor?: string | Binding
}
//export interface IHoboPickerState extends IItemsControlState {
export interface IHoboPickerState extends IControlState {
    PopupIsOpen: boolean,
    ItemsSource: any[],
    SelectedColor?: string
}

//export class HoboPicker extends AntimatterComponent<IHoboPickerProps, IHoboPickerState>
//export class HoboPicker extends ItemsControl<IHoboPickerProps, IHoboPickerState>
export class HoboPicker extends Control<IHoboPickerProps, IHoboPickerState>
{
    private static COLUMNS_SIZE: number = 8;
    private static COLUMN_WIDTH: number = 40;
    private static get ELLIPSE_SIZE() { return HoboPicker.COLUMN_WIDTH - 10; }

    public static DefaultBindings = {
        ItemsSource: {
            //NotifyCollectionChanged: true,
            FallbackValue: []
        },
        SelectedColor: {
            Mode: BindingMode.TwoWay
        }
    };

    private togglePopup(): void {
        console.log(`POPUP CURRENTLY OPEN? ${this.state.PopupIsOpen}`);

        this.setState({
            PopupIsOpen: !this.state.PopupIsOpen
        });
    }


    //public /* virtual */ renderElement(): JSX.Element {
    //    return (
    //        <>
    //            <Ellipse
    //                OnClick={() => this.togglePopup()}
    //                Color={this.state.SelectedColor}
    //                Size={30}
    //                Icon={0xE928}
    //            />
    //            <Popup IsOpen={this.state.PopupIsOpen}
    //                Placement={PlacementMode.Mouse}
    //            >
    //                <WrapPanel>
    //                    {this.renderAllEllipses}
    //                </WrapPanel>

    //            </Popup>

    //        </>
    //    );
    //}

    private renderEllipse(color: string): JSX.Element {
        const isSelected: boolean = color == this.state.SelectedColor;

        return (
            <Ellipse
                Icon={isSelected ? 0xE9A4 : undefined}
                Color={color}
                Size={HoboPicker.ELLIPSE_SIZE}
                Margin="5px"
                OnClick={() => this.onColorChange(color)} />
        );
    }

    private get renderAllEllipses(): JSX.Element[] {
        const circles: JSX.Element[] = [];
        for (const color of this.state.ItemsSource)
            circles.push(this.renderEllipse(color));
        return circles;
    }

    private static Template: (control: any) => JSX.Element = (templatedParent: HoboPicker) => {
        const popupWidth: number = HoboPicker.COLUMNS_SIZE * HoboPicker.COLUMN_WIDTH;

        //const style: Style<WrapPanel> = new Style<WrapPanel>({
        //const style: Style<WrapPanel> = new Style({
        //const style = new Style<WrapPanel>({
        const style = new Style({

        },
            {
                Selector: "@",
                Rules:
                {
                    maxWidth: `${popupWidth}px`
                }
            },
        );

        const elem: JSX.Element = (
            <>
                <Ellipse
                    OnClick={() => templatedParent.togglePopup()}
                    Color={templatedParent.state.SelectedColor}
                    Size={HoboPicker.ELLIPSE_SIZE}
                    Icon={0xE928}
                />


                {templatedParent.renderPopup()}


                <Popup
                    IsOpen={templatedParent.state.PopupIsOpen}
                    Placement={PlacementMode.Below}
                >
                    <WrapPanel
                        Style={style}
                    >
                        {templatedParent.renderAllEllipses}
                    </WrapPanel>

                </Popup>
            </>
        );
        return elem;
    }

    static DefaultStyle: Style<IHoboPickerProps> = new Style<IHoboPickerProps>(
        {
            ItemsSource: [],
            Template: HoboPicker.Template
        }
    );

    private renderPopup(): JSX.Element {
        const popupWidth: number = HoboPicker.COLUMNS_SIZE * HoboPicker.COLUMN_WIDTH;
        const style = new Style({ },
            {
                Selector: "@",
                Rules: { maxWidth: `${popupWidth}px` }
            },
        );

        const popup: JSX.Element = (
            <Popup
                IsOpen={new Binding(nameof(this.state.PopupIsOpen))}
                Placement={PlacementMode.Below}
            >
                <WrapPanel
                    Style={style}
                >
                    {this.renderAllEllipses}
                </WrapPanel>

            </Popup>
        );
        //return popup;
        return <></>
    }


    private onColorChange(color?: string): void {
        if (!color)
            return;

        //this.OnTargetChanged(nameof(this.state.SelectedColor), color);
        this.SetValue(nameof(this.state.SelectedColor), color);


        this.setState({
            PopupIsOpen: false
        });
    }

}