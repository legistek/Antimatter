import * as React from 'react';
import
{
    //IDatePickerStyles, ITextFieldStyles,
    DatePicker as FluentDatePicker, IDatePicker, IStyle, TextField, values
} from '@fluentui/react';
import { Antimatter, Binding, BindingMode, Utilities } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { Grid, IColumnDefinition } from './Grid';
import { StackPanel } from './StackPanel';
import { ITextBlockProps, TextBlock } from './TextBlock';
import { ControlTemplate } from '../FrameworkTemplate';
import { Orientation, VerticalAlignment } from '../Enums';
import { TemplateProp, WebStyle } from '../Style';
import { FontStyle, SemanticColor, Theme, ThemeEffect, ThemeLayout } from '../Theme';
import { WrapPanel } from './WrapPanel';

export interface IDatePickerProps extends IControlProps
{
    Date?: Date | Binding,
    HasTime?: boolean | Binding,
    Label?: string | Binding,
    MinDate?: Date | Binding,
    MaxDate?: Date | Binding,
    Required?: boolean | Binding,
    UseInternationalFormat?: boolean | Binding,
    AutoFocus?: boolean | Binding,
}
export interface IDatePickerState extends IControlState
{
    Date?: Date,
    HasTime?: boolean,
    Label?: string,
    MinDate?: Date,
    MaxDate?: Date,
    Required?: boolean,
    UseInternationalFormat?: boolean
}

class DatePickerBase<P extends IDatePickerProps = {}, S extends IDatePickerState = {}>  extends Control<P, S>
{
    _datePickder: HTMLElement | undefined | null;

    public static DefaultBindings = {
        Date: {
            Mode: BindingMode.TwoWay,
        }
    };

    public get AutoFocus(): boolean
    {
        return this.GetValue(nameof(this.props.AutoFocus), false);
    }

    private static get template(): ControlTemplate
    {
        return new ControlTemplate((templatedParent: DatePicker) =>
        {
            return (
                <Grid                    
                    OnDblClick={e => e.stopPropagation()}
                    RowDefinitions={[Grid.Row_Auto, Grid.Row_Star]}>
                    {
                        templatedParent.state.Label &&
                        (<TextBlock
                            ClassName="tb-label"
                            FontWeight="bold"
                            Foreground={TemplateProp(nameof<IDatePickerProps>(p => p.Foreground))}
                            Grid={{ Row: 0 }}
                            Text={templatedParent.state.Label}
                            VerticalAlignment={VerticalAlignment.Center}
                            Margin={ThemeLayout.MarginStandardR}
                        />)
                    }

                    <WrapPanel
                        Grid={{ Row: 1 }}
                        IsHitTestVisible={templatedParent.IsEnabled}
                        ItemSpacing="0">
                        <FluentDatePicker
                            ref={r => { templatedParent._datePickder = r; } }
                            //tabIndex={0}
                            value={
                                templatedParent.state.HasTime
                                    ? templatedParent.state.Date
                                    : (templatedParent.state.Date
                                        ? Utilities.ToTimelessDate(templatedParent.state.Date)
                                        : undefined)
                            }
                            //label={templatedParent.state.Label}
                            //onKeyDown={e =>
                            //{
                                //if (e.key == "Tab")
                                    //templatedParent?._datePickder?.blur();
                            //}}
                            onSelectDate={(date: Date | null | undefined) => templatedParent.OnSelectDate(date)}
                            formatDate={(date?: Date) => templatedParent.FormatDate(date)}
                            parseDateFromString={(date?: string) =>
                            {
                                if (!date)
                                    return new Date(1, 1, 1);
                                var dt = Antimatter.Server.ParseLocallyFormattedDate(date);
                                return dt;
                            }}
                            textField={{
                                autoFocus: templatedParent.AutoFocus,
                            }}
                            allowTextInput={true}
                            disableAutoFocus={true}
                            disabled={!templatedParent.IsEnabled}
                            minDate={templatedParent.state.MinDate}
                            maxDate={templatedParent.state.MaxDate}
                            isRequired={templatedParent.state.Required}
                            style={{
                                margin: Theme.Value(ThemeLayout.MarginSmallR)
                            }}
                            styles={{
                                //Align bottom in case of label (which for some reason yields a small whitespace below w/ time input present)
                                root: {
                                    display: 'flex',
                                    fontFamily: Theme.Value(FontStyle.FontFamily),
                                },
                                wrapper: {
                                    fontFamily: Theme.Value(FontStyle.FontFamily),
                                },
                                textField: {
                                    display: 'flex',
                                    maxWidth: "100%",
                                    padding: 0,
                                    margin: Theme.Value(ThemeLayout.MarginSmallL),
                                    fontFamily: Theme.Value(FontStyle.FontFamily),
                                    fontSize: templatedParent.FontSize + " !important",
                                    height: templatedParent.StretchVertical ? "100%" : "33px",
                                    selectors: {
                                        " .ms-TextField-fieldGroup": {
                                            height: templatedParent.StretchVertical ? "100%" : "33px",
                                            padding: templatedParent.Padding,
                                        },
                                        "input": {
                                            fontSize: templatedParent.FontSize + " !important",
                                            width: "80px",
                                        },
                                        "i": {
                                            fontSize: templatedParent.FontSize + " !important",
                                            margin: "0px 7px 0 0",
                                            alignSelf: "center",
                                            padding: "0px",
                                            position: "unset",
                                        }
                                    }
                                },
                                //Prevent huge red "Invalid date..." message from appearing to the left after unparseable text input
                                statusMessage: {
                                    display: 'none'
                                }
                            }}
                        />
                        {templatedParent.TimeTemplate}
                    </WrapPanel>
                </Grid>


            );
        });
    }

    private get TimeTemplate(): JSX.Element | null
    {
        if (!this.state.HasTime)
            return null;
        let timeString: string = '';
        if (this.state.Date && !Utilities.IsTimelessDate(this.state.Date))
        {
            //Convert to string format recognized by browser's built-in time-type input ("hh:mm", according to spec)
            const h: number = this.state.Date?.getHours() ?? 0;
            const hString: string = h.toLocaleString('en-US', { minimumIntegerDigits: 2 });
            const m: number = this.state.Date?.getMinutes() ?? 0;
            const mString: string = m.toLocaleString('en-US', { minimumIntegerDigits: 2 });
            timeString = `${hString}:${mString}`;
        }

        return (
            <TextField
                type="time"
                value={timeString}
                tabIndex={0}
                onChange={(event, newValue?: string) => this.OnSelectTime(newValue)}
                disabled={!this.IsEnabled}
                required={this.state.Required}
                styles={{
                    root: {
                        //Align bottom, in case datepicker has label
                        //marginTop: 'auto',
                        display: "flex",
                    },
                    wrapper: {
                        display: "flex",
                        height: "100%"
                    },
                    fieldGroup: {
                        height: this.StretchVertical ? '100%' : '33px'
                    },
                    field: {
                        fontFamily: Theme.Value(FontStyle.FontFamily),
                        fontSize: this.FontSize + " !important",
                    }
                }}
            />
        );
    }

    static DefaultStyle: WebStyle<IDatePickerProps> = new WebStyle<IDatePickerProps>(
        {
            FontFamily: FontStyle.FontFamily,
            Padding: ThemeLayout.MarginSmallLTRB,
            Template: DatePickerBase.template,
            BorderBrush: SemanticColor.ButtonBorder,
            Background: SemanticColor.BodyBackground,
            BorderThickness: ThemeLayout.StandardBorder,
            FontSize: FontStyle.Medium,
        },
        {
            "@ .ms-Label": {
                padding: "0px",
                fontFamily: Theme.Value(FontStyle.FontFamily),
            },
            "@ .ms-DatePicker": {
                //maxWidth: "120px"
            },
            //"@ .ms-DatePicker input": {
            //    fontSize: TemplateProp(nameof<IDatePickerProps>(p => p.FontSize)) + " !important",
            //    width: "64px",
            //},
            "@ .ms-TextField-field": {
                margin: Theme.Value(ThemeLayout.MarginSmallL),
                fontFamily: Theme.Value(FontStyle.FontFamily),
                padding: "0px",
                color: 'unset',
                background: 'unset'
            },
            "@ .ms-TextField-fieldGroup": {
                color: TemplateProp(nameof<IDatePickerProps>(p => p.Foreground)),
                background: TemplateProp(nameof<IDatePickerProps>(p => p.Background)),
                borderWidth: TemplateProp(nameof<IDatePickerProps>(p => p.BorderThickness)),
                borderColor: TemplateProp(nameof<IDatePickerProps>(p=>p.BorderBrush)),
                boxShadow: Theme.Value(ThemeEffect.ControlInnerShadow),
                borderRadius: Theme.Value(ThemeLayout.StandardBorderRadius)
            },
            "@ .ms-TextField-fieldGroup:hover": {
                borderColor: Theme.Value(SemanticColor.InputBorderHovered)
            },
            [Control.DisabledElement("msDatePickerDisabled")]: {
                pointerEvents: "none !important" as any
            },
            [Control.DisabledElement()]: {
                pointerEvents: "none !important" as any
            },
            [Control.DisabledElement("ms-TextField-fieldGroup")]: {
                color: Theme.Value(SemanticColor.DisabledBodyText),
                background: Theme.Value(SemanticColor.DisabledBackground),
                pointerEvents: "none !important" as any
            },
        }
    );

    private FormatDate(date?: Date): string
    {
        return date?.toLocaleDateString() || '';
        //if (!date)
        //    return '';
        //const m: number = (date.getMonth() + 1);
        //const d: number = date.getDate();
        //const y = date.getFullYear();
        //return this.state.UseInternationalFormat ? `${d}/${m}/${y}` : `${m}/${d}/${y}`;
    }

    private OnSelectDate(date: Date | null | undefined): void
    {
        if (date)
        {
            if (this.state.HasTime)
            {
                if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0)
                {
                    if (this.state.Date && !Utilities.IsTimelessDate(this.state.Date))
                    {
                        // Coming from calendar picker or manually entering in a
                        // calendar date with no time. Just add the
                        // local time value
                        const h: number = this.state.Date.getHours();
                        const m: number = this.state.Date.getMinutes();
                        date = new Date(date.getTime() + (h * 60 + m) * 60000);
                    }
                    else
                    {
                        date = Utilities.ToTimelessDate(date);
                    }
                }
                // else just keep the date+time unchanged from what was provided
            }
            else
            {
                // We just want the provided month/day/year stored as a timeless date
                date = Utilities.ToTimelessDate(date);
            }
        }
        this.SetValue(nameof(this.state.Date), date);
    }

    private OnSelectTime(timeString?: string): void
    {
        if (!this.state.Date)
            return;
        const combined: number = this.state.Date.setHours(0, 0, 0, 0) + this.ConvertTimeString(timeString);
        const date = new Date(combined);
        this.SetValue(nameof(this.state.Date), date);
    }

    //Convert time-type input's formatted string value ("hh:mm", provided browser follows spec) to numeric ms value
    private ConvertTimeString(timeString?: string): number
    {
        if (!timeString)
            return 0;
        const splitString: string[] = timeString.split(':');
        if (!splitString || splitString.length != 2)
            return 0;
        const h: number = +splitString[0];
        const m: number = +splitString[1];
        return ((h * 60) + m) * 60000;
    }

    //Used to force Fluent control to mimic vertical stretching behavior of similar inputs (e.g., TextBox)
    private get StretchVertical(): boolean
    {
        return this.ActualVerticalAlignment == VerticalAlignment.Stretch;
    }
}

export class DatePicker extends DatePickerBase<IDatePickerProps, IDatePickerState> { }