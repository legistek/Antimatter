import * as React from 'react';

import { PanelBase, IPanelProps, IPanelState } from './Panel';
import { HorizontalAlignment, Orientation, ScrollBarVisibility } from '../Enums';
import { CSSClasses } from '../CSSClasses';
import { Style, TemplateProp, WebStyle } from '../Style';
import { ThemeLayout } from '../Theme';
import { IFrameworkElementState } from '../FrameworkElement';
import { Binding } from '@antimatterjs/react';

export interface IStackPanelProps extends IPanelProps
{
    Orientation?: Orientation|Binding
}

export class StackPanelBase<P extends IStackPanelProps = {}, S extends IFrameworkElementState = {}>
    extends PanelBase<P, S>
{
    public static DefaultStyle = new WebStyle<IStackPanelProps>(
        {
            ItemSpacing: ThemeLayout.ControlSpacing
        },
        {
            //[`@.${CSSClasses.HStack} > .${CSSClasses.Base}:not(.amx-ptn-fe:first-child)`]: {
            //    marginLeft: TemplateProp(nameof<IStackPanelProps>(p => p.ItemSpacing)),
            //},
            [`@.${CSSClasses.HStack} > .${CSSClasses.Base}:not(.amx-ptn-fe:last-child)`]: {
                marginRight: TemplateProp(nameof<IStackPanelProps>(p => p.ItemSpacing)),
            },
            [`@.${CSSClasses.VStack} > .${CSSClasses.Base}:not(.amx-ptn-fe:first-child)`]: {
                marginTop: TemplateProp(nameof<IStackPanelProps>(p => p.ItemSpacing)),
            },
            [`@.${CSSClasses.VStack} > .${CSSClasses.Base}:not(.amx-ptn-fe:last-child)`]: {
                marginBottom: TemplateProp(nameof<IStackPanelProps>(p => p.ItemSpacing)),
            }
        });

    public static UnspacedStyle = new WebStyle<IStackPanelProps>(
        {
            ItemSpacing: 0
        },
        {},
        StackPanelBase.DefaultStyle
    );

    public static UnspacedHorzStyle = new WebStyle<IStackPanelProps>(
        {
            ItemSpacing: 0,
            Orientation: Orientation.Horizontal
        },
        {},
        StackPanelBase.DefaultStyle
    );

    public static VScrollStyle = new WebStyle<IStackPanelProps>(
        {
            VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
        },
        {},
        StackPanelBase.DefaultStyle
    );

    public static UnspacedVScrollStyle = new WebStyle<IStackPanelProps>(
        {
            ItemSpacing: 0,
            VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
        },
        {},
        StackPanelBase.DefaultStyle
    );

    public static DoubleScrollStyle = new WebStyle<IStackPanelProps>(
        {
            HorizontalScrollBarVisibility: ScrollBarVisibility.Auto,
            VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
        },
        {},
        StackPanelBase.DefaultStyle
    );

    public static VerticalHALeftStyle = new WebStyle<IStackPanelProps>(
        {
            HorizontalAlignment: HorizontalAlignment.Left
        },
        {},
        StackPanelBase.DefaultStyle
    );

    public static DefaultHorizontalStyle = new WebStyle<IStackPanelProps>(
        {
            Orientation: Orientation.Horizontal
        },
        {
        },
        StackPanelBase.DefaultStyle
    )

    public get Orientation(): Orientation
    {
        return this.GetValue(nameof(this.props.Orientation), Orientation.Vertical);
    }

    override constructClasses(): string
    {
        return (this.Orientation === Orientation.Horizontal ? CSSClasses.HStack : CSSClasses.VStack)
            + " " + super.constructClasses();
    }
}

export class StackPanel extends StackPanelBase<IStackPanelProps, IFrameworkElementState>
{
}