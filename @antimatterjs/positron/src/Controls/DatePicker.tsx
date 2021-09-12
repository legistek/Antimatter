import * as React from 'react';
import
{
    //IDatePickerStyles, ITextFieldStyles,
    DatePicker as FluentDatePicker, IStyle, TextField
} from '@fluentui/react';
import { Binding, BindingMode } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { StackPanel } from './StackPanel';
import { ControlTemplate } from '../FrameworkTemplate';
import { Orientation } from '../Enums';
import { Style } from '../Style';
import { FontStyle, Theme } from '../Theme';

export interface IDatePickerProps extends IControlProps
{
    Date?: Date | Binding,
    HasTime?: boolean | Binding,
    Label?: string | Binding,
    MinDate?: Date | Binding,
    MaxDate?: Date | Binding,
    Required?: boolean | Binding,
    UseInternationalFormat?: boolean | Binding
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
    public static DefaultBindings = {
        Date: {
            Mode: BindingMode.TwoWay,
        }
    };

    private static get Template(): ControlTemplate
    {
        return new ControlTemplate((templatedParent: DatePicker) =>
        {
            return (
                <StackPanel Orientation={Orientation.Horizontal}>
                    <FluentDatePicker
                        value={templatedParent.state.Date}
                        label={templatedParent.state.Label}
                        onSelectDate={(date: Date | null | undefined) => templatedParent.OnSelectDate(date)}
                        formatDate={(date?: Date) => templatedParent.FormatDate(date)}
                        allowTextInput={true}
                        disableAutoFocus={true}
                        disabled={templatedParent.state.IsEnabled == false}
                        minDate={templatedParent.state.MinDate}
                        maxDate={templatedParent.state.MaxDate}
                        isRequired={templatedParent.state.Required}
                        styles={{
                            //Align bottom in case of label (which for some reason yields a small whitespace below w/ time input present)
                            root: {
                                display: 'flex',
                                fontFamily: Theme.Value(FontStyle.FontFamily),
                            },
                            wrapper: {
                                fontFamily: Theme.Value(FontStyle.FontFamily),
                            },
                            //Align bottom in case of label (which for some reason yields a small whitespace below w/ time input present)
                            textField: {
                                display: 'flex',
                                fontFamily: Theme.Value(FontStyle.FontFamily),
                            },
                            //Prevent huge red "Invalid date..." message from appearing to the left after unparseable text input
                            statusMessage: {
                                display: 'none'
                            }
                        }}
                    />
                    {templatedParent.TimeTemplate}
                </StackPanel>
            );
        });
    }

    private get TimeTemplate(): JSX.Element | null
    {
        if (!this.state.HasTime)
            return null;
        let timeString: string = '';
        if (this.state.Date)
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
                onChange={(event, newValue?: string) => this.OnSelectTime(newValue)}
                required={this.state.Required}
                styles={{
                    root: {
                        //Align bottom, in case datepicker has label
                        marginTop: 'auto',
                    },
                    field: {
                        fontFamily: Theme.Value(FontStyle.FontFamily)
                    }
                }}
            />
        );
    }

    static DefaultStyle: Style<IDatePickerProps> = new Style<IDatePickerProps>(
        {
            FontFamily: FontStyle.FontFamily,
            Template: DatePickerBase.Template
        },
        {
            Selector: "@ .ms-Label",
            Rules: {
                padding: "0px",
                fontFamily: Theme.Value(FontStyle.FontFamily),
            }            
        },
        {
            Selector: "@ .ms-TextField-field",
            Rules: {
                fontFamily: Theme.Value(FontStyle.FontFamily),
            }
        }
    );

    private FormatDate(date?: Date): string
    {
        if (!date)
            return '';
        const m: number = (date.getMonth() + 1);
        const d: number = date.getDate();
        const y = date.getFullYear();
        return this.state.UseInternationalFormat ? `${d}/${m}/${y}` : `${m}/${d}/${y}`;
    }

    private OnSelectDate(date: Date | null | undefined): void
    {
        if (date)
        {
            const h: number = this.state.Date?.getHours() ?? 0;
            const m: number = this.state.Date?.getMinutes() ?? 0;
            const SOD: number = date.setHours(0,0,0);
            const combined: number = SOD + (((h * 60) + m) * 60000);
            date = new Date(combined);
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
}

export class DatePicker extends DatePickerBase<IDatePickerProps, IDatePickerState> { }