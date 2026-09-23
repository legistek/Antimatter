import * as React from 'react';
import { IStyle, Separator as FluentSeparator } from '@fluentui/react';
import { Control, IControlProps, IControlState } from './Control';
import { TemplateProp, WebStyle } from '../Style';
import { Orientation } from '../Enums';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../FrameworkElement';
import { Binding } from '@antimatterjs/react';
import { SemanticColor, Theme, ThemeColor, ThemeLayout } from '../Theme';
import { CSSClasses } from '../CSSClasses';

export interface ISeparatorProps extends IFrameworkElementProps
{
    Orientation?: Orientation|Binding,
    BorderBrush?: string | Binding | ThemeColor | SemanticColor,
    BorderThickness?: string | Binding,
    Padding?: string | ThemeLayout
}

export class Separator extends FrameworkElement<ISeparatorProps, IFrameworkElementState>
{    
    public static DefaultStyle: WebStyle<ISeparatorProps> = new WebStyle<ISeparatorProps>(
        {
            BorderBrush: Theme.Value(SemanticColor.BodyDivider),
            BorderThickness: "1px"
        },
        {
            [`@.${CSSClasses.HSeparator}`]: {
                width: "100%",
                height: "0",                
                borderTop: TemplateProp(nameof<ISeparatorProps>(p => p.BorderThickness)),
                margin: Theme.Value(ThemeLayout.MarginStandardTB),
            },
            [`@.${CSSClasses.VSeparator}`]: {
                width: "0",
                height: "auto",
                borderLeft: TemplateProp(nameof<ISeparatorProps>(p => p.BorderThickness)),
                margin: Theme.Value(ThemeLayout.MarginStandardLR),
            }
        }
    );

    public get BorderBrush(): string | undefined
    {
        return this.GetValue(nameof(this.props.BorderBrush));
    }
    public get BorderThickness(): string | undefined
    {
        return this.GetValue(nameof(this.props.BorderThickness));
    }
    public get Padding(): string | undefined
    {
        return this.GetValue(nameof(this.props.Padding));
    }
    public get Orientation(): Orientation
    {
        return this.GetValue(nameof(this.props.Orientation), Orientation.Horizontal);
    }

    protected override renderElement(): JSX.Element | null
    {
        return (<></>);
    }

    /* override */ constructClasses(): string
    {
        return (this.Orientation === Orientation.Vertical ? CSSClasses.VSeparator : CSSClasses.HSeparator)
            + " " + super.constructClasses();
    }

    /* override */ getCSSStyles(): React.CSSProperties
    {
        var styles: React.CSSProperties = {
            borderColor: this.BorderBrush,
            //borderWidth: "0px",
            borderStyle: "solid",
            padding: this.Padding,
            margin: this.Margin
        };
        return Object.assign(super.getCSSStyles(), styles);
    }
}