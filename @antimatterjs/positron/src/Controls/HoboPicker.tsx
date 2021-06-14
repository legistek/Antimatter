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
import { ListBoxItem, IListBoxItemProps, IListBoxItemState } from './ListBox';
import { Glyph } from './Glyph';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';

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
                    <Ellipse
                        Color={color}
                        Size={HoboPicker.ELLIPSE_SIZE}
                        Margin="5px"
                    />
                );
            }
        }
    );

    /* virtual */ GetContainerForItemOverride(): typeof FrameworkElement {
        return SelectedItemContainer;
    }

}

export class SelectedItemContainer<P extends IListBoxItemProps = {}, S extends IListBoxItemState = {}>
    extends Control<P, S>
{

    glyph(): JSX.Element | null {
        if (!this.state.IsSelected)
            return null;
        return (
            <Glyph
                Icon={0xE9A4}
                FontSize="20px"
                FontWeight="bold"
                Foreground="#FFFFFF"
                VerticalAlignment={VerticalAlignment.Center}
                HorizontalAlignment={HorizontalAlignment.Center}
                Overlaps={true}
            />
            );
    }


    static DefaultStyle: Style<IListBoxItemProps> = new Style<IListBoxItemProps>(
        {
            Margin: "0px",
            Template: (templatedParent: SelectedItemContainer) =>
                (
                    <>
                        <>{templatedParent.props.children}</>
                        {templatedParent.glyph()}
                    </>
                )
        },
        {
            Rules: {
                cursor: "pointer"
            }
        },
        {
            Selector: "@:hover",
            Rules: {
                background: ListBoxItem.theme.semanticColors.listItemBackgroundHovered
            }
        }
    );

    /* override */ constructClasses() {
        return super.constructClasses() +
            "listboxitem " +
            (this.props.IsSelected ? "selected " : "");
    }
}
