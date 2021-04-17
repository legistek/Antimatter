import * as React from 'react';
import { Binding, AntimatterComponent } from '@antimatterjs/react';
import { List } from '@fluentui/react';

export interface IListViewProps
{
    ItemsSource: any[] | Binding,
    ItemTemplate: (item?: any) => JSX.Element
}
export interface IListViewState
{
    ItemsSource: any[]
}
export class ListView extends AntimatterComponent<IListViewProps, IListViewState>
{
    public static DefaultBindings = {
        ItemsSource: {
            NotifyCollectionChanged: true
        }
    };

    render()
    {
        return (
            <div style={{ display: "block", overflowY: "auto" }}>
                <List
                    items={this.state.ItemsSource}                   
                    getKey={(item, index) => item?.IsModelObjectReference ? item.Handle : null}
                    onRenderCell={(item, index) =>
                        this.props.ItemTemplate(item)} />
            </div>
        )
    }
}