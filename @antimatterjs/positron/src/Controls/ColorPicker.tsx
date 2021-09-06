import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { HorizontalAlignment, SelectionMode, VerticalAlignment } from '../Enums';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { Style } from '../Style';
import { Ellipse } from '../Shapes/Ellipse';
import { ComboBox, IComboBoxProps, IComboBoxState } from './ComboBox';
import { Glyph } from './Glyph';
import { Panel } from './Panel';
import { PlacementMode, Popup } from './Popup';
import { WrapPanel } from './WrapPanel';
import { ISelectableItemControlProps, SelectableItemControl } from './Primitives/SelectableItemControl';

export class ColorPicker extends ComboBox<IComboBoxProps, IComboBoxState>
{
    public static DefaultStyle: Style<IComboBoxProps> = new Style<IComboBoxProps>(
        {
            SelectionMode: SelectionMode.Single,
            ItemsSource: [],
            Template: new ControlTemplate((templatedParent: ColorPicker) => templatedParent.Template),
            ItemTemplate: new DataTemplate((item: any) => ColorPicker.DefaultItemTemplate(item)),
            ItemContainerStyle: new Style<ISelectableItemControlProps>(
                {
                    Margin: "0px",
                    Template: new ControlTemplate((templatedParent: SelectableItemControl) =>
                    (
                        <>
                            <>{templatedParent.props.children}</>
                            {templatedParent.state.IsSelected && (
                                <Glyph
                                    Icon={"CheckMark"}
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
                        background: ComboBox.theme.semanticColors.listItemBackgroundHovered
                    }
                }
            )
        },
        {
            Rules: {
                cursor: 'pointer',
                userSelect: 'none'
            }
        },
    );

    protected get Template(): JSX.Element
    {
        const root: JSX.Element = (
            <>
                <Panel>
                    <Ellipse
                        ref={r => this._button = r}
                        OnClick={() => this.TogglePopup()}
                        Fill={this.state.SelectedItem}
                        VerticalAlignment={VerticalAlignment.Center}
                        HorizontalAlignment={HorizontalAlignment.Center}
                        Width={ColorPicker.ELLIPSE_SIZE}
                        Height={ColorPicker.ELLIPSE_SIZE} />
                    <Glyph
                        Icon={"Edit"}
                        IsHitTestVisible={false}
                        Foreground={ComboBox.theme.palette.white}
                        Overlaps={true}
                        VerticalAlignment={VerticalAlignment.Center}
                        HorizontalAlignment={HorizontalAlignment.Center} />
                </Panel>
                <Popup
                    IsOpen={new Binding({
                        Source: this,
                        Path: nameof(this.state.PopupIsOpen),
                        Mode: BindingMode.TwoWay
                    })}
                    Target={() => this._button}
                    Placement={PlacementMode.Below}
                    Width={ColorPicker.COLUMNS_SIZE * ColorPicker.COLUMN_WIDTH + 8}
                    Padding="4px">
                    <WrapPanel ItemsParent={this} />
                </Popup>
            </>
        );
        return root;
    }

    protected static DefaultItemTemplate(color: string): JSX.Element
    {
        const elem: JSX.Element = (
            <Ellipse
                Fill={color}
                Width={ColorPicker.ELLIPSE_SIZE}
                Height={ColorPicker.ELLIPSE_SIZE}
                Margin="5px" />
        );
        return elem;
    }

    private static COLUMNS_SIZE: number = 6;
    private static COLUMN_WIDTH: number = 40;
    private static get ELLIPSE_SIZE() { return ColorPicker.COLUMN_WIDTH - 10; }
}