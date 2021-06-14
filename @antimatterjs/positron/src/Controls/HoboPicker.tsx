import * as React from 'react';
import {
    AntimatterComponent,
    Binding,
    BindingMode,
    ModelObjectReference
} from '@antimatterjs/react';
import {
    Callout,
    Icon,
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
import { Ellipse, IEllipseProps, IEllipseState } from './Ellipse';
import { IWrapPanelProps, WrapPanel } from './WrapPanel';
import { ISelectorProps, ISelectorState, Selector, ISelectableItemProps, ISelectableItemState } from './Primitives/Selector';
import { SelectionMode } from '../Enums';

//export interface IHoboPickerProps extends IItemsControlProps {
export interface IHoboPickerProps extends ISelectorProps {
//export interface IHoboPickerProps extends IControlProps {
    //ItemsSource: any[] | Binding,
    //SelectedColor?: string | Binding
}
//export interface IHoboPickerState extends IItemsControlState {
export interface IHoboPickerState extends ISelectorState {
//export interface IHoboPickerState extends IControlState {
    PopupIsOpen: boolean,
    //ItemsSource: any[],
    //SelectedColor?: string
}

//export class HoboPicker extends AntimatterComponent<IHoboPickerProps, IHoboPickerState>
//export class HoboPicker extends ItemsControl<IHoboPickerProps, IHoboPickerState>
export class HoboPicker extends Selector<IHoboPickerProps, IHoboPickerState>
//export class HoboPicker extends Control<IHoboPickerProps, IHoboPickerState>
{
    private static COLUMNS_SIZE: number = 6;
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

    private static Template = (templatedParent: HoboPicker) => (
            <>
                <Ellipse
                    OnClick={() => templatedParent.togglePopup()}
                    Color={templatedParent.state.SelectedItem}
                    Size={HoboPicker.ELLIPSE_SIZE}
                    Icon={0xE928}/>

                <Popup
                    IsOpen={templatedParent.state.PopupIsOpen}
                    Placement={PlacementMode.Below}>
                    <div style={{ maxWidth: `${HoboPicker.COLUMNS_SIZE * HoboPicker.COLUMN_WIDTH}px` }}>
                        <WrapPanel ItemsParent={templatedParent}/>
                    </div>

                </Popup>
            </>
        );

    static DefaultStyle: Style<IHoboPickerProps> = new Style<IHoboPickerProps>(
        {
            SelectionMode: SelectionMode.Single,
            ItemsSource: [],
            Template: HoboPicker.Template,
            ItemTemplate: (color: string) => {
                return (
                    <SelectableEllipse
                        Color={color}
                        Size={HoboPicker.ELLIPSE_SIZE}
                        Margin="5px"
                    />
                );
            }
        }
    );

}

class SelectableEllipse<P extends ISelectableEllipseProps = {}, S extends ISelectableEllipseState = {}> extends Ellipse<P, S> {
    /* override */ renderElement(): JSX.Element | null {
        const numericSize: number = (this.state.Size as number);
        //const numericSize: number = (this.state.Size as number) ?? 30;

        const fontSize: number = numericSize * 0.5;
        const fontSizeCSS: string = `${fontSize}px`;

        const iconNameString: string = this.state.IsSelected ? "e9a4" : "";
        //const iconNameString: string = "e9a4";

        const fluentIconStyle: React.CSSProperties = {
            fontSize: fontSizeCSS,
            fontWeight: "bold",
            color: "#FFFFFF",
            height: "100%",
            //width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        };
        const fluentElem: JSX.Element = (
            <Icon
                iconName={iconNameString}
                style={fluentIconStyle}
            />
        );

        return fluentElem;

        //return super.renderElement();
    }
}

//interface ISelectableEllipseProps extends IEllipseProps, ISelectableItemProps { }
interface ISelectableEllipseProps extends IEllipseProps {
    IsSelected?: boolean,
}

//interface ISelectableEllipseState extends IEllipseState, ISelectableItemState { }
interface ISelectableEllipseState extends IEllipseState {
    IsSelected?: boolean
}