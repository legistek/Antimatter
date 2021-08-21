import * as React from 'react';
import { ControlTemplate } from '../FrameworkTemplate';
import { Style } from '../Style';
import { IStackPanelProps, StackPanel } from './StackPanel';
import { VerticalAlignment } from '../Enums';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';

export class ToastControl extends ItemsControl<IItemsControlProps, IItemsControlState>
{
    public static DefaultBindings = {
        ItemsSource: {
            NotifyCollectionChanged: true
        }
    };

    public static DefaultStyle: Style<IItemsControlProps> = new Style<IItemsControlProps>(
        {            
            ItemsPanel: StackPanel,
            ItemsPanelStyle: new Style<IStackPanelProps>({
                VerticalAlignment: VerticalAlignment.Bottom
            })
        },
        {
            Selector: "@",
            Rules: {
                position: "fixed",
                top: "auto",
                bottom: 0,
                width: "75vw",
                maxWidth: "800px",
                zIndex: 1000,
                marginBottom: "10px"
            }
        }
    );
}