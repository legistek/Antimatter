import * as React from 'react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { HorizontalAlignment, SelectionMode, VerticalAlignment } from '../Enums';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { WebStyle } from '../Style';
import { Ellipse } from '../Shapes/Ellipse';
import { ComboBox, ComboBoxBase, IComboBoxProps, IComboBoxState } from './ComboBox';
import { Glyph } from './Glyph';
import { Panel } from './Panel';
import { PlacementMode, Popup } from './Popup';
import { WrapPanel } from './WrapPanel';
import { ISelectableItemControlProps, SelectableItemControl } from './Primitives/SelectableItemControl';
import { ThemeColor, SemanticColor, Theme } from '../Theme';
import { FrameworkElement } from '../FrameworkElement';

export class ColorPicker extends ComboBoxBase<IComboBoxProps, IComboBoxState>
{
    public static DefaultStyle: WebStyle<IComboBoxProps> = new WebStyle<IComboBoxProps>(
        {
            SelectionMode: SelectionMode.Single,
            ItemsSource: [],
            Padding: "0px",
            Template: new ControlTemplate((templatedParent: ColorPicker) => templatedParent.template),
            ItemTemplate: new DataTemplate((item: any) => ColorPicker.DefaultItemTemplate(item)),
            ItemContainerStyle: new WebStyle<ISelectableItemControlProps>(
                {
                    // Margin: "0px",
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
                    "@": {
                        cursor: "pointer"
                    },
                    "@:hover": {
                        background: Theme.Value(SemanticColor.ListItemBackgroundHovered)
                    }
                }
            )
        },
        {
            "@": {
                cursor: 'pointer',
                userSelect: 'none'
            }
        },
    );

    protected get template(): JSX.Element
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
                        Foreground={ThemeColor.White}
                        Overlaps={true}                        
                        VerticalAlignment={VerticalAlignment.Center}
                        HorizontalAlignment={HorizontalAlignment.Center} />
                </Panel>
                <Popup
                    IsOpen={new Binding({
                        Source: this,
                        Path: nameof(this.PopupIsOpen),
                        Mode: BindingMode.TwoWay
                    })}
                    Target={() => this._button}
                    Placement={PlacementMode.Below}
                    Width={ColorPicker.COLUMN_COUNT * ColorPicker.COLUMN_WIDTH }
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
                Height={ColorPicker.ELLIPSE_SIZE}/>
        );
        return elem;
    }

    private static COLUMN_COUNT: number = 6;
    private static COLUMN_WIDTH: number = 40;
    private static get ELLIPSE_SIZE() { return ColorPicker.COLUMN_WIDTH - 10; }

    private _button?: FrameworkElement | null;
}