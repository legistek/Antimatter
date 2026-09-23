import * as React from 'react';
import { Binding, BindingMode, Point, PropertyChangedEventArgs, RelativeSourceMode, Utilities, RGB } from '@antimatterjs/react';
import { HorizontalAlignment, SelectionMode, VerticalAlignment } from '../Enums';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { WebStyle } from '../Style';
import { Ellipse } from '../Shapes/Ellipse';
import { ComboBox, ComboBoxBase, IComboBoxProps } from './ComboBox';
import { Glyph } from './Glyph';
import { Panel } from './Panel';
import { PlacementMode, Popup } from './Popup';
import { WrapPanel } from './WrapPanel';
import { ISelectableItemControlProps, SelectableItemControl } from './Primitives/SelectableItemControl';
import { ThemeColor, SemanticColor, Theme, FontStyle, ThemeLayout } from '../Theme';
import { FrameworkElement } from '../FrameworkElement';
import { IControlState } from './Control';
import { StackPanel } from './StackPanel';
import { Image } from './Image';
import { Slider } from './Slider';
import { Grid } from './Grid';
import { TextBox } from './TextBox';
import { MultitouchTransform, Transform, TranslateTransform } from '../Media/MultitouchTransform';
import { CommandButton } from './CommandButton';


export interface IColorPickerProps extends IComboBoxProps
{
    DefaultIcon?: number | string | Binding,
    AllowCustom?: boolean | Binding,
    IsCustomMode?: boolean | Binding
}

export class ColorPicker extends ComboBoxBase<IColorPickerProps, IControlState>
{
    public get DefaultIcon(): number | string
    {        
        return this.GetValue(nameof(this.props.DefaultIcon));
    }

    public get AllowCustom(): boolean
    {
        return this.GetValue(nameof(this.props.AllowCustom), false);
    }

    public static DefaultStyle: WebStyle<IComboBoxProps> = new WebStyle<IComboBoxProps>(
        {
            SelectionMode: SelectionMode.Single,
            ItemsSource: [
                '#950500', '#D32A24', '#FD4640', '#A90068', '#D324A0',
                '#FF36C1', '#8100A9', '#9A24D3', '#BC4DFF', '#1F00A7',
                '#4537E6', '#5159FF', '#00538E', '#0088DB', '#17A4FF',
                '#00746D', '#099D7A', '#00BBAA', '#00740F', '#0B9F08',
                '#00BB03', '#615800', '#8D8105', '#D4B000', '#9A6100',
                '#C66000', '#F16D00'              
            ],
            IsEditable: true,
            CloseOnSelect: true,
            Foreground: ThemeColor.White,
            Padding: "0px",
            FontSize: FontStyle.Glyph1x,
            Template: new ControlTemplate((templatedParent: ColorPicker) => templatedParent.template),
            ItemTemplate: (item: any) => ColorPicker.DefaultItemTemplate(item),
            ItemContainerStyle: new WebStyle<ISelectableItemControlProps>(
                {
                    // Margin: "0px",
                    Template: new ControlTemplate((templatedParent: SelectableItemControl) =>
                    (
                        <>
                            <>{templatedParent.props.children}</>
                            {templatedParent.IsSelected && (
                                <Glyph
                                    Icon={"CheckMark"}
                                    FontSize={templatedParent.FontSize}
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
                userSelect: 'none'
            }
        },
    );

    protected get template(): JSX.Element
    {
        const icon: number | string = this.IsEnabled ? "Color" : this.DefaultIcon;

        const root: JSX.Element = (
            <>
                <Panel Cursor={this.IsEditable ? "pointer" : "unset"}>
                    <Ellipse
                        ref={r => { this._pickerButton = r; } }
                        OnClick={(e, target) =>
                        {
                            if (!this.IsEditable)
                                return;
                            this.TogglePopup();
                        }}
                        Fill={this.SelectedItem}
                        VerticalAlignment={VerticalAlignment.Center}
                        HorizontalAlignment={HorizontalAlignment.Center}
                        Width={ColorPicker.ELLIPSE_SIZE}
                        Height={ColorPicker.ELLIPSE_SIZE} />
                    {
                        this.IsEditable &&
                        <Glyph
                            Icon={icon}
                            IsHitTestVisible={false}
                            FontSize={this.FontSize}
                            Foreground={this.Foreground}
                            Overlaps={true}
                            VerticalAlignment={VerticalAlignment.Center}
                            HorizontalAlignment={HorizontalAlignment.Center} />
                    }
                </Panel>
                <Popup
                    IsOpen={new Binding({
                        Source: this,
                        Path: nameof(this.PopupIsOpen),
                        Mode: BindingMode.TwoWay
                    })}
                    Target={() => this._pickerButton}
                    Placement={PlacementMode.Below}
                    MinWidth={ColorPicker.COLUMN_COUNT * ColorPicker.COLUMN_WIDTH }
                    Padding="4px">
                    <StackPanel>
                        {
                            !this.IsCustomMode &&
                            <WrapPanel ItemsParent={this} />
                        }                        
                        {
                            this.IsCustomMode && this.RenderCustomSection()
                        }
                        {
                            !this.IsCustomMode && this.AllowCustom && (
                                <>
                                    <CommandButton
                                        TabIndex={1}
                                        Command={() =>
                                        {                                            
                                            this.IsCustomMode = true;
                                        }}
                                        Icon="color"
                                        Label="Custom Color"
                                        PreventBlurOnClick={true}
                                        ToolTip="Choose a custom color value not listed"
                                        Style={CommandButton.IconButtonStyle} />
                                </>
                            )
                        }
                    </StackPanel>
                </Popup>
            </>
        );
        return root;
    }

    private RenderCustomSection(): JSX.Element
    {
        return (
            <>
                <Grid ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}>
                    <Image
                        ref={r => { this._customPicker = r; } }
                        OnLoad={() => this.ResetCustomPickerCoordinates()}
                        Cursor="crosshair"
                        OnClick={(e) =>
                        {
                            if (!this._customPicker?.Image)
                                return;
                            var rc = this._customPicker.Image.getBoundingClientRect();

                            var coords = {
                                X: e.clientX - rc.left,
                                Y: e.clientY - rc.top
                            };

                            this.CustomColor = this.GetColorFromCoordinates(
                                coords.X,
                                rc.width,
                                coords.Y,
                                rc.height);
                        }}
                        Uri="spectrum.png" />

                    <Ellipse
                        Overlaps={true}
                        IsHitTestVisible={false}
                        StrokeThickness={3}
                        Stroke={ThemeColor.White}
                        Width={15}
                        Height={15}
                        Transform={this._colorIndicatorTransform}
                    />

                    <StackPanel
                        VerticalAlignment={VerticalAlignment.Center}
                        Grid={{ Column: 1 }}>
                        <Panel
                            Margin={ThemeLayout.MarginStandardLTRB}
                            BorderBrush={ThemeColor.Black}
                            BorderThickness={1}
                            VerticalAlignment={VerticalAlignment.Center}
                            HorizontalAlignment={HorizontalAlignment.Center}
                            Width={75}
                            Height={75}
                            Background={new Binding({
                                Source: this,
                                Path: nameof(this.CSSColor)
                            })}
                        />
                        <TextBox
                            MaxWidth={100}
                            Margin={ThemeLayout.MarginStandardLTRB}
                            Text={new Binding({
                                Source: this,
                                Path: nameof(this.CSSColor),
                            })} />
                    </StackPanel>
                </Grid>

                <Grid ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}>
                    <Slider
                        Grid={{ Column: 0 }}
                        Label="Red"
                        MaxValue={255}
                        Value={new Binding({
                            Path: nameof(this.CustomRed),
                            Source: this,
                            Mode: BindingMode.TwoWay
                        })} />
                    <TextBox
                        Grid={{ Column: 1 }}
                        MaxWidth={50}
                        VerticalAlignment={VerticalAlignment.Bottom}
                        Text={new Binding({
                            Path: nameof(this.CustomRed),
                            Source: this,
                            Mode: BindingMode.TwoWay
                        })} />
                </Grid>

                <Grid ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}>
                    <Slider
                        Grid={{ Column: 0 }}
                        Label="Green"
                        MaxValue={255}
                        Value={new Binding({
                            Path: nameof(this.CustomGreen),
                            Source: this,
                            Mode: BindingMode.TwoWay
                        })} />
                    <TextBox
                        Grid={{ Column: 1 }}
                        VerticalAlignment={VerticalAlignment.Bottom}
                        MaxWidth={50}
                        Text={new Binding({
                            Path: nameof(this.CustomGreen),
                            Source: this,
                            Mode: BindingMode.TwoWay
                        })} />
                </Grid>

                <Grid ColumnDefinitions={[Grid.ColumnDefinition(1, true), Grid.ColumnDefinition()]}>
                    <Slider
                        Grid={{ Column: 0 }}
                        Label="Blue"
                        MaxValue={255}
                        Value={new Binding({
                            Path: nameof(this.CustomBlue),
                            Source: this,
                            Mode: BindingMode.TwoWay
                        })} />
                    <TextBox
                        VerticalAlignment={VerticalAlignment.Bottom}
                        Grid={{ Column: 1 }}
                        MaxWidth={50}
                        Text={new Binding({
                            Path: nameof(this.CustomBlue),
                            Source: this,
                            Mode: BindingMode.TwoWay
                        })} />
                </Grid>

                <CommandButton
                    Icon={0xE90C}
                    Label="Preset Colors"
                    PreventBlurOnClick={true}
                    Style={CommandButton.IconButtonStyle}
                    ToolTip="Choose from available preset colors"
                    Command={() => this.IsCustomMode = false} />
            </>);
    }

    private _customPicker?: Image | null;

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

    public get IsCustomMode(): boolean
    {
        return this.GetValue(nameof(this.props.IsCustomMode), false);
    }
    public set IsCustomMode(value: boolean)
    {        
        this.SetValue(nameof(this.props.IsCustomMode), value, true);
    }

    private _customColor?: RGB;
    public get CustomColor(): RGB
    {
        return this._customColor ||
            (this._customColor = RGB.ParseCSSColor(this.SelectedItem) || new RGB());            
    }
    public set CustomColor(value: RGB)
    {
        this._customColor = value;
        this.PropertyChanged.invoke(this, new PropertyChangedEventArgs(nameof(this.CustomColor)));
        this.PropertyChanged.invoke(this, new PropertyChangedEventArgs(nameof(this.CSSColor)));
        this.PropertyChanged.invoke(this, new PropertyChangedEventArgs(nameof(this.CustomRed)));
        this.PropertyChanged.invoke(this, new PropertyChangedEventArgs(nameof(this.CustomGreen)));
        this.PropertyChanged.invoke(this, new PropertyChangedEventArgs(nameof(this.CustomBlue)));
        if (this.SelectedItem !== value.CSSValue)
            this.SelectedItem = value.CSSValue;
        this.ResetCustomPickerCoordinates();
    }

    private ResetCustomPickerCoordinates()
    {
        var rcImageContainer = this._customPicker?.Container?.getBoundingClientRect();
        var rcImage = this._customPicker?.Image?.getBoundingClientRect();
        if (!rcImage || !rcImageContainer)
            return;
        var pt = this.GetCoordinatesFromColor(this.CustomColor, rcImage.width, rcImage.height);
        this._colorIndicatorTransform.Translate(
            {
                X: pt.X + rcImage.left - rcImageContainer.left - 7.5,
                Y: pt.Y + rcImage.top - rcImageContainer.top - 7.5
            }
        );
    }

    public get CustomRed(): number
    {
        return this.CustomColor.Red;
    }
    public set CustomRed(value: number)
    {
        this.CustomColor = new RGB(
            value,
            this.CustomColor.Green,
            this.CustomColor.Blue);              
    }

    public get CustomGreen(): number
    {
        return this.CustomColor.Green;
    }
    public set CustomGreen(value: number)
    {
        this.CustomColor = new RGB(
            this.CustomColor.Red,
            value,
            this.CustomColor.Blue);
    }

    public get CustomBlue(): number
    {
        return this.CustomColor.Blue;
    }
    public set CustomBlue(value: number)
    {
        this.CustomColor = new RGB(
            this.CustomColor.Red,
            this.CustomColor.Green,
            value);
    }

    public get CSSColor(): string
    {
        return this.CustomColor.CSSValue;
    }
    public set CSSColor(value: string)
    {
        var c = RGB.ParseCSSColor(value);
        if (!c)
            return;
        this.CustomColor = c;
    }

    protected override OnSelectionChanged()
    {
        super.OnSelectionChanged();
        var c = RGB.ParseCSSColor(this.SelectedItem);
        if (c)
            this.CustomColor = c;
    }

    protected override OnOpen()
    {
        this.IsCustomMode = false;
    }
    
    private GetColorFromCoordinates(x: number, width: number, y: number, height: number): RGB
    {
        var baseColor = RGB.RGBFromHue(360 * x / width);
        baseColor.AdjustBrightness(-2 * (y / height - 0.5));
        baseColor.Red = Math.round(baseColor.Red);
        baseColor.Green = Math.round(baseColor.Green);
        baseColor.Blue = Math.round(baseColor.Blue);
        return baseColor;
    }

    private GetCoordinatesFromColor(color: RGB, width: number, height: number): Point
    {
        return {
            X: width * color.Hue / 360,
            Y: height * (1 - (color.Luminance) / 2)
        }
    }

    private static COLUMN_COUNT: number = 6;
    private static COLUMN_WIDTH: number = 44;
    private static get ELLIPSE_SIZE() { return ColorPicker.COLUMN_WIDTH - 10; }
    private _colorIndicatorTransform: MultitouchTransform = new MultitouchTransform();
    private _pickerButton?: FrameworkElement | null;
}