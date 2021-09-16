import * as React from 'react';

import { PanelBase, IPanelProps, IPanelState } from './Panel';
import { Orientation } from '../Enums';
import { CSSClasses } from '../CSSClasses';
import { Style, TemplateProp, WebStyle } from '../Style';
import { ThemeLayout } from '../Theme';

export interface IStackPanelProps extends IPanelProps
{
    Orientation?: Orientation
}

export interface IStackPanelState extends IPanelState
{
    Orientation?: Orientation
}

export class StackPanelBase<P extends IStackPanelProps = {}, S extends IStackPanelState = {}>
    extends PanelBase<P, S>
{
    public static DefaultStyle = new WebStyle<IStackPanelProps>(
        {
            ItemSpacing: ThemeLayout.ControlSpacing
        },
        {
            [`@.${CSSClasses.HStack} > .${CSSClasses.Base}:not(.amx-ptn-fe:first-child)`]: {
                marginLeft: TemplateProp(nameof<IStackPanelProps>(p => p.ItemSpacing)),
            },
            [`@.${CSSClasses.HStack} > .${CSSClasses.Base}:not(.amx-ptn-fe:last-child)`]: {
                marginRight: TemplateProp(nameof<IStackPanelProps>(p => p.ItemSpacing)),
            },
            [`@.${CSSClasses.VStack} > .${CSSClasses.Base}:not(.amx-ptn-fe:first-child):not(.amx-ptn-panel)`]: {
                marginTop: TemplateProp(nameof<IStackPanelProps>(p => p.ItemSpacing)),
            },
            [`@.${CSSClasses.VStack} > .${CSSClasses.Base}:not(.amx-ptn-fe:last-child):not(.amx-ptn-panel)`]: {
                marginBottom: TemplateProp(nameof<IStackPanelProps>(p => p.ItemSpacing)),
            }
        });

    /* override */ constructClasses(): string
    {
        return (this.state.Orientation === Orientation.Horizontal ? CSSClasses.HStack : CSSClasses.VStack)
            + " " + super.constructClasses();
    }

    /* override */ renderElement(): JSX.Element
    {
        if (this.state.ItemsParent)
        {
            let i = 0;
            var list = this.state.ItemsParent?.state?.ItemsSource?.map(item =>
            {
                return this.state.ItemsParent?.OnRenderItem(item, i++);
            });
            return (<>{list}</>);
        }
        else
        {
            return (<>{ this.props.children }</>);
        }
    }    
}

export class StackPanel extends StackPanelBase<IStackPanelProps, IStackPanelState>
{
}