import * as React from 'react';
import { ControlTemplate } from '../FrameworkTemplate';
import { Style } from '../Style';
import { StackPanel } from './StackPanel';
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
            Template: new ControlTemplate((templatedParent: ToastControl) => templatedParent.Template)

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
            maxWidth: "800px",
            zIndex: 1000,
            marginBottom: "10px"
        };
        return Object.assign(super.getCSSStyles(), styles);
    }

}