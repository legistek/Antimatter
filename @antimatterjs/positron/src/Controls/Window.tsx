import * as React from 'react';
import { Binding, ModelObjectReference } from '@antimatterjs/react';

import { IPanelProps, IPanelState, Panel } from './Panel';
import { HorizontalAlignment, VerticalAlignment } from '../Enums';
import { ItemsControl } from './ItemsControl';
import { DialogBox } from './DialogBox';

export interface IWindowProps extends IPanelProps
{
    Dialogs?: ModelObjectReference[] | Binding;
}

export interface IWindowState extends IPanelState
{
    Dialogs?: ModelObjectReference[];
}

export class Window<P extends IWindowProps = {}, S extends IWindowState = {}> extends Panel<IWindowProps, IWindowState>
{


    constructor(props)
    {
        super(props);
        (this.state as any)["HorizontalAlignment"] = HorizontalAlignment.Stretch;
        (this.state as any)["VerticalAlignment"] = VerticalAlignment.Stretch;
    }

    /* override */ constructClasses() : string
    {
        return super.constructClasses() + "amx-ptn-root ";
    }

    /* override */ renderElement(): JSX.Element | null
    {
        return (
            <>
                {super.renderElement()}
                <ItemsControl ItemsSource={this.state.Dialogs || []}
                    ItemTemplate={(item) =>
                    (
                        <DialogBox ViewModel={item}/>                        
                    )}>
                </ItemsControl>
            </>
        );
    }
}