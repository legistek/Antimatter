import * as React from 'react';
import { Binding, BindingMode } from "@antimatterjs/react";
import { FrameworkElement } from '../FrameworkElement';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { ISelectorProps, ISelectorState, Selector } from './Primitives/Selector';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { Style } from '../Style';
import { PlacementMode, Popup } from './Popup';
import { Panel } from './Panel';
import { ItemsStackPanel } from './ItemsStackPanel';
import { TextBox } from './TextBox';
import { TextBlock } from './TextBlock';
import { ISelectableItemControlProps, SelectableItemControl } from './Primitives/SelectableItemControl';
import { SelectionMode } from '../Enums';


export interface IComboBoxProps extends ISelectorProps {
}

export interface IComboBoxState extends ISelectorState {
    PopupIsOpen: boolean
}

export class ComboBox_NotFluent extends Selector<IComboBoxProps, IComboBoxState>
//class ComboBoxBase<P extends IComboBoxProps = {}, S extends IComboBoxState = {}> extends ItemsControl<P, S>
{
    public static DefaultBindings = {
        ItemsSource: {
            FallbackValue: []
        },
        SelectedItem: {
            Mode: BindingMode.TwoWay
        }
    };

    public static DefaultStyle: Style<IComboBoxProps> = new Style<IComboBoxProps>(
        {
            SelectionMode: SelectionMode.Single,
            ItemsSource: [],
            //Template: new ControlTemplate((templatedParent: ComboBoxBase) => templatedParent.controlTemplate),
            Template: new ControlTemplate((templatedParent: ComboBox_NotFluent) => templatedParent.controlTemplate),
            ItemTemplate: new DataTemplate((item: string) => (
                <TextBlock Text={item} />
            )),
            //ItemTemplate: new DataTemplate((item: any) => (
            //    <TextBlock Text={item?.FullName} />
            //)),
            ItemContainerStyle: new Style<ISelectableItemControlProps>(
                {
                    Template: new ControlTemplate((templatedParent: SelectableItemControl) =>
                        (
                            <>
                                {templatedParent.props.children}
                            </>
                        ))
                },
                {
                    Rules: {
                        cursor: "pointer"
                    }
                }
            )
        }
    );

    /* override */ OnRenderItem(item: any, props?: IComboBoxProps) {
        props = props || {};
        return super.OnRenderItem(item);
    }

    private get controlTemplate(): JSX.Element {
        return (
            <>

                <TextBox
                    ref={r => this._button = r}
                    OnClick={() => this.setPopupState(true)}
                    //Text={this.state.SelectedItem?.FullName}
                    Text={this.state.SelectedItem}
                />
                <Popup
                    IsOpen={this.state.PopupIsOpen}
                    Target={() => this._button}
                    Placement={PlacementMode.Below}
                >

                    <ItemsStackPanel ItemsParent={this} />

                </Popup>
            </>
        );
    }

    /* protected override */ OnSelectionChanged() {
        this.setPopupState(false);
    }

    private setPopupState(open: boolean): void {
        this.setState({
            PopupIsOpen: open
        });
    }
    private _button?: FrameworkElement | null;
}

//export class ComboBox_NotFluent extends ComboBoxBase<IComboBoxProps, IComboBoxState> { }


export interface ComboBoxOption_NotFluent {
    key: string;
    displayText: string;
    infotip?: string;
}