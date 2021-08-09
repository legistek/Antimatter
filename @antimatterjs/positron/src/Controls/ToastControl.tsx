import * as React from 'react';
import { Binding, BindingMode, ModelObjectReference } from '@antimatterjs/react';
import { IStyle, MessageBar as FluentMessageBar, MessageBarType as FluentMessageBarType } from '@fluentui/react';
import { Control, IControlProps, IControlState } from './Control';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { Style } from '../Style';
import { CommandButton } from './CommandButton';
import { MessageBar, MessageBarParams } from './MessageBar';
import { StackPanel } from './StackPanel';
import { HorizontalAlignment, Orientation, ScrollBarVisibility, VerticalAlignment } from '../Enums';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { WrapPanel } from './WrapPanel';
import { PanelBase, IPanelProps, IPanelState, Panel } from './Panel';
import { VirtualizedPanel } from './VirtualizedPanel';

interface IToastControlProps extends IItemsControlProps
{

}
interface IToastControlState extends IItemsControlState
{

}

export class ToastControl extends ItemsControl<IToastControlProps, IToastControlState>
{
    public static DefaultBindings = {
        ItemsSource: {
            NotifyCollectionChanged: true
        }
    };

    public static DefaultStyle: Style<IItemsControlProps> = new Style<IItemsControlProps>(
        {
            Template: new ControlTemplate((templatedParent: ToastControl) => templatedParent.Template),
            ItemTemplate: new DataTemplate((params: ModelObjectReference) => (
                <MessageBar
                    Params={params}
                    Animate={true}
                    Margin="1px"
                />)),
        }
    );

    public get Template(): JSX.Element
    {
        return (
            <StackPanel
                ItemsParent={this}
                VerticalAlignment={VerticalAlignment.Bottom}
            />
        );
    }

    /* override */ getCSSStyles(): React.CSSProperties
    {
        var styles: React.CSSProperties = {
            position: "fixed",
            top: "auto",
            bottom: 0,
            width: "75vw",
            zIndex: 1000,
            marginBottom: "10px"
        };
        return Object.assign(super.getCSSStyles(), styles);
    }

}