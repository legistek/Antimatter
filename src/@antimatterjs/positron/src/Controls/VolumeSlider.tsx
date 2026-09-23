import * as React from 'react';
import { Antimatter, Binding, BindingMode, PropertyChangedEventArgs } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { ControlTemplate } from '../FrameworkTemplate';
import { Panel } from './Panel';
import { Slider } from './Slider';
import { HorizontalAlignment, Orientation, VerticalAlignment } from '../Enums';
import { WebStyle } from '../Style';
import { FontStyle, SemanticColor, ThemeColor, ThemeLayout } from '../Theme';
import { CommandButton } from './CommandButton';
import { StackPanel } from './StackPanel';

export interface IVolumeSliderProps extends IControlProps
{
    Value?: number | Binding
}

const FluentIconNames = //Relevant subset of Fluent's IconNames enum, which isn't itself usable
{
    VolumeDisabled: "VolumeDisabled",
    Volume0: "Volume0",
    Volume1: "Volume1",
    Volume2: "Volume2",
    Volume3: "Volume3"
};

export class VolumeSliderBase<P extends IVolumeSliderProps = {}, S extends IControlState = {}>
    extends Control<P, S>
{
    private static readonly PART_Slider: string = Antimatter.Identifier("vs-slider");

    private _isMuted: boolean = false;
    private unmutedValue: number = 1;

    public static DefaultBindings = {
        Value: {
            Mode: BindingMode.TwoWay,
            FallbackValue: 0
        }
    };

    public get Value(): number
    {
        return this.GetValue(nameof(this.props.Value), 0);
    }

    //Work in terms of integer percentages inside the slider to avoid decimal precision-related weirdness
    public get SliderValue(): number
    {
        return this.Value * 100;
    }
    public set SliderValue(value: number)
    {
        if (!this.IsEnabled)
            return;
        this._isMuted = false;
        this.unmutedValue = value;
        this.SetValue(nameof(this.props.Value), Math.round(value) / 100);
    }

    protected ToggleMute(): void
    {
        if (!this.IsEnabled)
            return;

        if (this._isMuted)
        {
            this.SetValue(nameof(this.props.Value), this.unmutedValue);
        }
        else
        {
            this.unmutedValue = this.Value;
            this.SetValue(nameof(this.props.Value), 0);
        }

        this._isMuted = !this._isMuted;
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(nameof(this.SliderValue))
        );
    }

    public get Icon(): string
    {
        if (this._isMuted)
            return FluentIconNames.VolumeDisabled;
        if (this.Value <= 0)
            return FluentIconNames.Volume0;
        else if (this.Value * 3 < 1)
            return FluentIconNames.Volume1;
        else if (this.Value * 3 < 2)
            return FluentIconNames.Volume2;
        else
            return FluentIconNames.Volume3;
    }

    static DefaultStyle: WebStyle<IVolumeSliderProps> = new WebStyle<IVolumeSliderProps>(
        {
            FontSize: FontStyle.Glyph1pt25x,
            Foreground: SemanticColor.InputIcon,
            Background: ThemeColor.Transparent,
            BorderThickness: "0",
            Padding: ThemeLayout.MarginSmallLTRB,
            VerticalAlignment: VerticalAlignment.Center,
            HorizontalAlignment: HorizontalAlignment.Center,
            Template: new ControlTemplate((templatedParent: VolumeSliderBase) => templatedParent.TemplateElem)
        }, {}
    );

    private get TemplateElem(): JSX.Element
    {
        return (
            <StackPanel
                Orientation={Orientation.Horizontal}
                Style={StackPanel.UnspacedStyle}
                Background={this.Background}
                BorderBrush={this.BorderBrush}
                BorderThickness={this.BorderThickness}
            >
                <CommandButton
                    Command={() => this.ToggleMute()}
                    Icon={this.Icon}
                    Style={CommandButton.IconButtonTightStyle}
                    IconSize={this.FontSize}
                    IconForeground={this.Foreground}
                />
                <Slider
                    Value={new Binding({
                        Source: this,
                        Path: nameof(this.SliderValue),
                        Mode: BindingMode.TwoWay
                    })}
                    MinValue={0}
                    MaxValue={100}
                    StepIncrement={5}
                    Length={80}
                    ValueFormat={(value: number) => `${Math.round(value)}%`}
                    Padding={ThemeLayout.MarginStandardTB}
                    Margin={ThemeLayout.MarginWideR}
                    VerticalAlignment={VerticalAlignment.Center}
                />
            </StackPanel>
        );
    }
}

export class VolumeSlider extends VolumeSliderBase<IVolumeSliderProps, IControlState> {}
