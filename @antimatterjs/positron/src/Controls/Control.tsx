import * as React from 'react';
import { Binding } from '@antimatterjs/react';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { WindowLayoutContext } from './Window';
import { WindowLayout } from '../Enums';
import { ControlTemplate } from '../FrameworkTemplate';

interface IControlCommon
{
    FontWeight?: undefined | "bold" | "normal",
    Padding?: string,
    Template?: ControlTemplate,
    Layout?: WindowLayout
}

export interface IControlProps extends IFrameworkElementProps, IControlCommon
{
    IsEnabled?: boolean | Binding,
    Foreground?: string | Binding,
    Background?: string | Binding,
    BorderBrush?: string | Binding,
    BorderThickness?: string | Binding,
    FontFamily?: string | Binding,
    FontSize?: number | Binding,
}

export interface IControlState extends IFrameworkElementState, IControlCommon
{
    IsEnabled?: boolean,
    Background?: string,
    Foreground?: string,
    BorderBrush?: string,
    BorderThickness?: string,
    FontFamily?: string,
    FontSize?: number
}

export class Control<P extends IControlProps = {}, S extends IControlState = {}>
    extends FrameworkElement<P,S>
{
    /* override sealed */ renderElement(): JSX.Element | null
    {
        return (
            <WindowLayoutContext.Consumer>
                {
                    (layout) =>
                    {
                        if (!this.state.Template)
                            return null;
                        (this.state as any).Layout = layout;
                        return this.state.Template.GetVisualTree(layout)(this);
                    }
                }
            </WindowLayoutContext.Consumer>);        
    }
}