import * as React from 'react';
import { Binding, BindingMode, ModelObjectReference } from '@antimatterjs/react';

import { Control, IControlProps, IControlState } from './Control';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { Style } from '../Style';
import { Grid } from './Grid';
import { StackPanel } from './StackPanel';
import { ScrollBarVisibility } from '../Enums';

export interface ITreeViewCommon
{
    ChildrenPath?: string,
    IsContentEnabledPath?: string,
    IsExpandedPath?: string
}
export interface ITreeViewProps extends IItemsControlProps, ITreeViewCommon
{
    SelectionChangedCommand?: ModelObjectReference | Binding
}
export interface ITreeViewState extends IItemsControlState, ITreeViewCommon
{
    SelectionChangedCommand?: ModelObjectReference
}
export class TreeView<
    P extends ITreeViewProps = {},
    S extends ITreeViewState = {}>
    extends ItemsControl<P, S>
{
    public static DefaultStyle: Style<ITreeViewProps> = new Style<ITreeViewProps>(
        {}
    );

    /* override */ GetContainerForItemOverride()
    {       
        return TreeViewItem;
    }

    /* override */ OnRenderItem(item: any, props?: ITreeViewItemProps)
    {
        props = props || {};
        props.TreeViewParent = this;
        props.ItemsSource = new Binding(this.state.ChildrenPath);
        
        return super.OnRenderItem(item, props);
    }
}

interface ITreeViewItemCommon
{
    TreeViewParent?: TreeView<ITreeViewProps, ITreeViewState>,
}
interface ITreeViewItemProps extends IItemsControlProps, ITreeViewItemCommon
{
    IsExpanded?: boolean | Binding,
}
interface ITreeViewItemState extends IItemsControlState, ITreeViewItemCommon
{
    IsExpanded?: boolean
}
class TreeViewItem<
    P extends ITreeViewItemProps = {},
    S extends ITreeViewItemState = {}>
    extends ItemsControl<P, S>
{
    public static DefaultBindings = {
        IsExpanded: {
            Mode: BindingMode.TwoWay
        }
    };

    public static DefaultStyle: Style<ITreeViewProps> = new Style<ITreeViewProps>(
        {
            Template: (templatedParent: TreeViewItem<ITreeViewItemProps, ITreeViewItemState>) =>
            (
                <Grid ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}
                    RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition()]}>

                    {/*Expander*/}

                    {/*This Item*/}
                    <Grid Grid={{ Column: 1, Row: 0 }}
                        IsEnabled={new Binding({ Path: templatedParent.state.TreeViewParent?.state.IsContentEnabledPath })}>
                        {templatedParent.props.children}                       
                    </Grid>

                    {/* Children */}
                    <StackPanel
                        ItemsParent={templatedParent}
                        Grid={{ Row: 1, Column: 1 }}
                        IsVisible={templatedParent.state.TreeViewParent?.state.IsExpandedPath
                            ? new Binding(templatedParent.state.TreeViewParent?.state.IsExpandedPath)
                            : templatedParent.state.IsExpanded }
                        VerticalScrollBarVisibility={ScrollBarVisibility.Hidden}
                        HorizontalScrollBarVisibility={ScrollBarVisibility.Hidden}/>
                </Grid>
            )
        }
    );

    /* override */ OnRenderItem(item: any, props?: ITreeViewItemProps)
    {
        props = props || {};
        props.TreeViewParent = this.state.TreeViewParent;
        props.ItemTemplate = this.state.TreeViewParent?.state?.ItemTemplate;

        return super.OnRenderItem(item, props);
    }
}