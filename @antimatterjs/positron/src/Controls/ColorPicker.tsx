import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Style } from '@antimatterjs/positron/src/Style';
import { PlacementMode, Popup } from './Popup';
import { Ellipse } from '../Shapes/Ellipse';
import { WrapPanel } from './WrapPanel';
import { ISelectorProps, ISelectorState, Selector } from './Primitives/Selector';
import { SelectionMode } from '../Enums';
import { Glyph } from './Glyph';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { ISelectableItemControlProps, SelectableItemControl, SelectableItemControlBase } from './Primitives/SelectableItemControl';
import { getTheme } from '@fluentui/react';
import { FrameworkElement } from '../FrameworkElement';

export interface IColorPickerProps extends ISelectorProps
{
    IconForeground?: string|Binding,
}

export interface IColorPickerState extends ISelectorState
{
    IconForeground?: string,
    PopupIsOpen: boolean
}

export class ColorPicker extends Selector<IColorPickerProps, IColorPickerState>
{
    private static theme = getTheme();

    public static DefaultBindings = {
        ItemsSource: {
            FallbackValue: []
        },
        SelectedItem: {
            Mode: BindingMode.TwoWay
        }
    };

    public static DefaultStyle: Style<IColorPickerProps> = new Style<IColorPickerProps>(
        {
            SelectionMode: SelectionMode.Single,
            ItemsSource: [],
            IconForeground: "white",
            Template: new ControlTemplate((templatedParent: ColorPicker) => (
                <>
                    <Ellipse
                        ref={r => templatedParent._button = r}
                        OnClick={() => templatedParent.setPopupState(true)}
                        Fill={templatedParent.state.SelectedItem}
                        Width={ColorPicker.ELLIPSE_SIZE}
                        Height={ColorPicker.ELLIPSE_SIZE} />
                    <Glyph
                        Icon={0xE928}
                        IsHitTestVisible={false}
                        Foreground={templatedParent.state.IconForeground}
                        Overlaps={true}
                        VerticalAlignment={VerticalAlignment.Center}
                        HorizontalAlignment={HorizontalAlignment.Center} />
                    <Popup
                        IsOpen={templatedParent.state.PopupIsOpen}
                        Target={() => templatedParent._button}
                        Placement={PlacementMode.Below}>
                        <div style={{ maxWidth: `${ColorPicker.COLUMNS_SIZE * ColorPicker.COLUMN_WIDTH}px` }}>
                            <WrapPanel ItemsParent={templatedParent} />
                        </div>
                    </Popup>
                </>)),
            ItemTemplate: new DataTemplate((color: string) => (
                <Ellipse
                    Fill={color}
                    Width={ColorPicker.ELLIPSE_SIZE}
                    Height={ColorPicker.ELLIPSE_SIZE}
                    Margin="5px" />)),
            ItemContainerStyle: new Style<ISelectableItemControlProps>(
                {
                    Margin: "0px",
                    Template: new ControlTemplate((templatedParent: SelectableItemControl) =>
                    (
                        <>
                            <>{templatedParent.props.children}</>
                            {templatedParent.state.IsSelected && (
                                <Glyph
                                    Icon={0xE9A4}
                                    FontSize="16px"
                                    FontWeight="bold"
                                    Foreground="#FFFFFF"
                                    VerticalAlignment={VerticalAlignment.Center}
                                    HorizontalAlignment={HorizontalAlignment.Center}
                                    Overlaps={true} />)}
                        </>
                    ))
                },
                {
                    Rules: {
                        cursor: "pointer"
                    }
                },
                {
                    Selector: "@:hover",
                    Rules: {
                        background: ColorPicker.theme.semanticColors.listItemBackgroundHovered
                    }
                }
            ),
        },
        {
            Rules:
            {
                cursor: "pointer"
            }
        }
    );

    /* protected override */ OnSelectionChanged()
    {
        this.setPopupState(false);
    }

    private setPopupState(open: boolean): void
    {
        this.setState({
            PopupIsOpen: open
        });
    }

    private static COLUMNS_SIZE: number = 6;
    private static COLUMN_WIDTH: number = 40;
    private static get ELLIPSE_SIZE() { return ColorPicker.COLUMN_WIDTH - 10; }
    private _button?: FrameworkElement | null;
}