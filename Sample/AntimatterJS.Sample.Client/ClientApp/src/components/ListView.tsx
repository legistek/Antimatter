import { Component } from 'react';
import * as React from 'react';
import { Antimatter, DataContext, Binding, ModelObjectReference, AntimatterComponent } from '@antimatterjs/react';
import { List, PrimaryButton } from '@fluentui/react';
import { ModelValue } from '@antimatterjs/react/src/ModelValue';

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
    render()
    {
        return (
            <div style={{ display: "block", overflowY: "auto" }}>
                <List items={this.state.ItemsSource}
                    onRenderCell={(item, index) =>
                    (
                        <React.Fragment key={item?.IsModelObjectReference ? item.Handle : null}>{this.props.ItemTemplate(item)}</React.Fragment>
                    )} />
            </div>
        )
    }
}