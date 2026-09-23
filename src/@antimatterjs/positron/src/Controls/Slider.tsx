import * as React from 'react';
import { Antimatter, Binding, BindingMode } from '@antimatterjs/react';
import { Slider as FluentSlider } from '@fluentui/react';
import { Control, IControlProps, IControlState } from './Control';
import { Grid } from './Grid';
import { ControlTemplate } from '../FrameworkTemplate';
import { TemplateProp, WebStyle } from '../Style';
import { SemanticColor, Theme, ThemeColor, ThemeLayout } from '../Theme';
import { Panel } from './Panel';
import { TextBlock } from './TextBlock';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';

interface ISliderProps extends IControlProps {
    Value?: number | Binding,
    MaxValue?: number | Binding,
    MinValue?: number | Binding,
    StepIncrement?: number | Binding,
    Label?: string | Binding,
    IsVertical?: boolean,
    ShowValue?: boolean,
    ValueFormat?: (value: number) => string,
    Length?: number     //Pixel width/height of line (Fluent control tends to get deformed w/o explicitly setting size)
}
export class Slider extends Control<ISliderProps, IControlState>
{
    public static readonly PART_InputPanel: string = Antimatter.Identifier("sl-input-panel");

    public get Value(): number
    {
        return this.GetValue(nameof(this.props.Value), 0);
    }
    public get MinValue(): number | undefined
    {
        return this.GetValue(nameof(this.props.MinValue));
    }
    public get MaxValue(): number | undefined
    {
        return this.GetValue(nameof(this.props.MaxValue));
    }
    public get Increment(): number
    {
        return this.GetValue(nameof(this.props.StepIncrement), 1);
    }
    public get Label(): string
    {
        return this.GetValue(nameof(this.props.Label));
    }
    public get IsVertical(): boolean
    {
        return this.GetValue(nameof(this.props.IsVertical), false);
    }
    public get ShowValue(): boolean
    {
        return this.GetValue(nameof(this.props.ShowValue), false);
    }
    public get Length(): number
    {
        return this.GetValue(nameof(this.props.Length), 120);
    }

    private get OutlineColor(): string
    {
        const key: SemanticColor = this.IsEnabled ? SemanticColor.SmallInputBorder : SemanticColor.DisabledSubtext;
        return Theme.Value(key);
    }

    public static DefaultBindings = {
        Value: {
            FallbackValue: 0,
            Mode: BindingMode.TwoWay
        }
    };

    public static DefaultStyle: WebStyle<ISliderProps> = new WebStyle<ISliderProps>(
        {
            Length: 120,
            Template: new ControlTemplate((templatedParent: Slider) => templatedParent.TemplateElem)
        },
        {
            '@': {
                cursor: 'pointer',
                userSelect: 'none'
            }
        }
    );

    private get TemplateElem(): JSX.Element
    {
        return (
            <Grid
                RowDefinitions={[Grid.Row_Auto, Grid.Row_Star]}
                Background={this.Background}
                BorderBrush={this.BorderBrush}
                BorderThickness={this.BorderThickness}
            >
                <TextBlock Grid={{ Row: 0 }}
                    Text={this.Label}
                    IsVisible={!!this.Label}
                    Foreground={this.IsEnabled ? this.Foreground : SemanticColor.DisabledBodyText}
                    FontFamily={this.FontFamily}
                    FontSize={this.FontSize}
                    FontWeight="bold"
                    HorizontalAlignment={this.IsVertical ? HorizontalAlignment.Center : HorizontalAlignment.Stretch}
                />

                <Panel Grid={{ Row: 1 }}
                    ClassName={Slider.PART_InputPanel}
                    HorizontalAlignment={this.IsVertical ? HorizontalAlignment.Center : HorizontalAlignment.Stretch}
                    Padding={this.IsVertical ? ThemeLayout.MarginStandardTB : ThemeLayout.MarginStandardLR}
                >
                    <FluentSlider
                        value={this.Value}
                        onChange={(value: number) => this.OnValueChanged(value)}
                        min={this.MinValue}
                        max={this.MaxValue}
                        step={this.Increment}
                        vertical={this.IsVertical}
                        showValue={this.ShowValue}
                        valueFormat={this.props.ValueFormat}
                        disabled={!this.IsEnabled}
                        styles={{
                            root: {
                                //margin: '0',
                                width: '100%',
                                userSelect: 'none'
                            },
                            container: {
                                margin: 0
                            },
                            thumb: {
                                borderColor: this.OutlineColor
                            },
                            activeSection: {
                                backgroundColor: this.OutlineColor
                            },
                            inactiveSection: {
                                backgroundColor: Theme.Value(SemanticColor.PrimaryButtonTextDisabled)
                            },
                            slideBox: {
                                minHeight: this.IsVertical ? `${this.Length}px` : '24px',
                                minWidth: this.IsVertical ? '24px' : `${this.Length}px`,
                                //marginTop: this.IsVertical ? Theme.Value(ThemeLayout.GridSpacing) : '0',
                                selectors: {
                                    ':hover .ms-Slider-thumb': {
                                        borderColor: Theme.Value(SemanticColor.PrimaryButtonBackground)
                                    },
                                    ':hover .ms-Slider-active': {
                                        backgroundColor: Theme.Value(SemanticColor.PrimaryButtonBackground)
                                    },
                                    ':hover .ms-Slider-inactive': {
                                        backgroundColor: Theme.Value(ThemeColor.ThemeLight)
                                    },
                                    ':focus::after': {
                                        display: 'none'
                                    }
                                }
                            },
                            valueLabel: {
                                fontFamily: this.FontFamily,
                                fontSize: this.FontSize,
                                color: this.Foreground,
                                marginTop: Theme.Value(ThemeLayout.ThickBorder)
                            }
                        }}
                    />
                </Panel>
            </Grid>
        );
    }

    private OnValueChanged(value: number): void
    {
        if (!this.IsEnabled)
            return;
        this.SetValue(nameof(this.props.Value), value);
    }
}