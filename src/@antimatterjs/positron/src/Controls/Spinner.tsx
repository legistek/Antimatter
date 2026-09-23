import * as React from 'react';
import { Antimatter, Binding, BindingMode } from '@antimatterjs/react';
import { IStyle, Position, SpinButton } from '@fluentui/react';
import { Control, IControlProps, IControlState } from './Control';
import { ControlTemplate } from '../FrameworkTemplate';
import { TemplateProp, WebStyle } from '../Style';
import { FontStyle, SemanticColor, Theme, ThemeColor, ThemeLayout } from '../Theme';
import { StackPanel } from './StackPanel';
import { Grid, IGridChildPosition } from './Grid';
import { Glyph } from './Glyph';
import { TextBlock } from './TextBlock';
import { VerticalAlignment } from '../Enums';

interface ISpinnerProps extends IControlProps {
    Value?: number | Binding,
    MaxValue?: number | Binding,
    MinValue?: number | Binding,
    StepIncrement?: number | Binding,
    Label?: string | Binding,
    LabelIsInline?: boolean | Binding
}
interface ISpinnerState extends IControlState {
    Value?: number,
    MaxValue?: number,
    MinValue?: number,
    StepIncrement?: number,
    Label?: string,
    LabelIsInline?: boolean
}
export class Spinner extends Control<ISpinnerProps, ISpinnerState>
{
    public static readonly PART_Label: string = Antimatter.Identifier("sp-label");
    public static readonly PART_InputGrid: string = Antimatter.Identifier("sp-input-grid");
    public static readonly PART_Infotip: string = Antimatter.Identifier("sp-infotip");

    public static DefaultStyle: WebStyle<ISpinnerProps> = new WebStyle<ISpinnerProps>(
        {
            Value: 0,
            Background: SemanticColor.BodyBackground,
            FontFamily: FontStyle.FontFamily,
            Template: new ControlTemplate((templatedParent: Spinner) => templatedParent.template)
        },
        {
            [`@ .${this.PART_Infotip}`]: {
                cursor: "pointer"
            },
            [`@ .${this.PART_InputGrid}`]: {
                backgroundColor: TemplateProp(nameof<ISpinnerProps>(p => p.Background))
            },
            [Control.DisabledElement(this.PART_Label)]: {
                color: `${Theme.Value(SemanticColor.DisabledBodyText)} !important`
            },
            [Control.DisabledElement(this.PART_InputGrid)]: {
                backgroundColor: `${Theme.Value(SemanticColor.DisabledBackground)}`
            }
        }
    );

    private get template(): JSX.Element
    {
        const textValue: string = this.state.Value?.toString() || '0';
        const labelGrid: IGridChildPosition =
            this.props.LabelIsInline ? { Row: 1, Column: 0 } : { Row: 0, Column: 1, ColumnSpan: 2 };
        const labelMargin: string | ThemeLayout = this.props.LabelIsInline ? ThemeLayout.MarginSmallR : "0";

        return (
            <Grid
                RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition(1, true)]}
                ColumnDefinitions={[Grid.Column_Auto, Grid.Column_Auto, Grid.Column_Star]}
            >
                {
                    this.state.Label &&
                    (<TextBlock
                        ClassName={Spinner.PART_Label}
                        FontWeight="bold"
                        Foreground={TemplateProp(nameof<ISpinnerProps>(p => p.Foreground))}
                        Grid={labelGrid}
                        Text={this.state.Label}
                        VerticalAlignment={VerticalAlignment.Center}
                        Margin={labelMargin}
                    />)
                }

                <Grid Grid={{ Row: 1, Column: 1 }}
                    ClassName={Spinner.PART_InputGrid}
                >
                    <SpinButton
                        value={textValue}
                        onChange={(event, newValue?: string) => this.OnChange(newValue)}
                        max={this.state.MaxValue}
                        min={this.state.MinValue}
                        step={this.state.StepIncrement}
                        styles={{
                            label: {
                                fontFamily: this.FontFamily,
                                color: this.Foreground,
                                fontSize: this.FontSize,
                                lineHeight: "unset",
                                alignSelf: "center",
                                padding: "0px"
                            },
                            input: {
                                fontFamily: this.FontFamily,
                                color: this.Foreground,
                                backgroundColor: Theme.Value(ThemeColor.Transparent),
                                fontSize: this.FontSize,
                                lineHeight: "unset",
                                alignSelf: "center"
                            },
                            spinButtonWrapper: {
                                height: "fit-content",
                                maxWidth: "90px",
                                paddingBottom: "1px",
                                selectors: {
                                    ':after': {
                                        borderColor: Theme.Value(SemanticColor.InputBorder),
                                    },
                                    ':hover': {
                                        selectors: {
                                            ':after': {
                                                borderColor: Theme.Value(SemanticColor.InputBorderHovered),
                                            }
                                        }
                                    }
                                },
                            }
                        }}
                        disabled={!this.IsEnabled}
                    />
                </Grid>

                {this.props.InfoTip && (
                    <Glyph Grid={{ Row: 1, Column: 2 }}
                        Style={Glyph.ControlInfoTipStyle}
                        ClassName={Spinner.PART_Infotip}
                        ToolTip={this.props.InfoTip}
                    />)
                }
            </Grid>
        );
    }

    public static DefaultBindings = {
        Value: {
            FallbackValue: 0,
            Mode: BindingMode.TwoWay
        }
    };

    private OnChange(newValue?: string): void {
        if (!newValue)
            return;
        const numericValue: number = +newValue;
        this.SetValue(nameof(this.state.Value), numericValue);
    }
}