import * as React from 'react';
import { ControlTemplate } from '../FrameworkTemplate';
import { WebStyle } from '../Style';
import { IStackPanelProps, StackPanel } from './StackPanel';
import { VerticalAlignment } from '../Enums';
import { IItemsControlProps, ItemsControlBase } from './ItemsControl';
import { IFrameworkElementState } from '../FrameworkElement';

export class ToastControl extends ItemsControlBase<IItemsControlProps, IFrameworkElementState>
{
    public static DefaultBindings = {
        ItemsSource: {
            NotifyCollectionChanged: true
        }
    };

    public static DefaultStyle: WebStyle<IItemsControlProps> = new WebStyle<IItemsControlProps>(
        {            
            ItemsPanel: StackPanel,
            ItemsPanelStyle: new WebStyle<IStackPanelProps>({
                VerticalAlignment: VerticalAlignment.Bottom
            })
        },
        {
            "@": {                
                //top: "auto",
                //bottom: 0,
                minWidth: "50vw",
                maxWidth: "75vw",
                zIndex: 1000,
                marginBottom: "10px"
            }
        }
    );
}