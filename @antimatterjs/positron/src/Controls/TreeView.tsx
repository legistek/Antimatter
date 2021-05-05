import * as React from 'react';
import { Binding, BindingMode, ModelObjectReference } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { Style } from '../Style';
import { Grid } from './Grid';
import { StackPanel } from './StackPanel';
import { ScrollBarVisibility } from '../Enums';
import { TextBlock } from './TextBlock';
import { Icon, MotionAnimations } from '@fluentui/react';

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
    public static DefaultBindings = {
        ItemsSource: {
            NotifyCollectionChanged: true
        }
    };

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
        props.ItemTemplate = this.state.ItemTemplate;
        props.ItemsSource = new Binding({
            Path: this.state.ChildrenPath,
            Source: item,
            NotifyCollectionChanged: true
        });
        props.Item = item;
        if (this.state.IsExpandedPath)
            props.IsExpanded = new Binding({
                Path: this.state.IsExpandedPath,
                Source: item});
        
        return super.OnRenderItem(item, props);
    }
}

interface ITreeViewItemCommon
{
    TreeViewParent?: TreeView<ITreeViewProps, ITreeViewState>,
    Item?: any
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
        },
        ItemsSource: {
            NotifyCollectionChanged: true
        }
    };

    public static DefaultStyle: Style<ITreeViewProps> = new Style<ITreeViewProps>(
        {
            Template: (templatedParent: TreeViewItem<ITreeViewItemProps, ITreeViewItemState>) =>
            (
                <Grid                    
                    ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}
                    RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition()]}>

                    {/*Expander*/}
                    <Icon
                        onClick={(e) => templatedParent.ToggleIsExpanded()}
                        className={templatedParent.GetExpanderClasses()}
                        iconName="e9e1" />

                    {/*This Item*/}
                    <Grid Grid={{ Column: 1, Row: 0 }}
                        IsEnabled={new Binding({
                            Path: templatedParent.state.TreeViewParent?.state.IsContentEnabledPath,
                            Source: templatedParent.state.Item
                        })}>
                        {templatedParent.props.children}
                    </Grid>

                    {/* Children */}
                    <StackPanel
                        Margin="0px 0px 0px 15px"
                        ref={r => templatedParent.ItemsPanelInstance = r}
                        ItemsParent={templatedParent}
                        Grid={{ Row: 1, Column: 1 }}
                        IsVisible={templatedParent.state.IsExpanded}
                        VerticalScrollBarVisibility={ScrollBarVisibility.Hidden}
                        HorizontalScrollBarVisibility={ScrollBarVisibility.Hidden} />
                </Grid>
            )
        },
        {
            Selector: "@",
            Rules:
            {
                animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            }
        },
        {
            Selector: "@ .expander",
            Rules:
            {
                gridRow: 0,
                gridColumn: 0,
                cursor: "pointer",
                alignSelf: "center",
                margin: "0px 5px 0px 0px"
            }
        },
        {
            Selector: "@ .expander.nochildren",
            Rules:
            {
                display: 'none'
            }
        },
        {
            Selector: "@ .expander.expanded",
            Rules:
            {
                transform: "rotate(90deg)"
            }
        });

    /* private */ ToggleIsExpanded()
    {
        this.SetValue("IsExpanded", this.state.IsExpanded === false);
    }

    /* private */ GetExpanderClasses(): string
    {
        let classes: string = "expander ";

        if (!this.state.ItemsSource || this.state.ItemsSource.length === 0)        
            classes += "nochildren ";
        if (this.state.IsExpanded !== false)
            classes += "expanded ";
        return classes;            
    }

    /* override */ renderElement()
    {
        return super.renderElement();
    }

    /* override */ GetContainerForItemOverride()
    {
        return TreeViewItem;
    }

    /* override */ OnRenderItem(item: any, props?: ITreeViewItemProps)
    {
        props = props || {};
        props.TreeViewParent = this.state.TreeViewParent;
        props.ItemsSource = new Binding({
            Path: this.state.TreeViewParent?.state.ChildrenPath,
            Source: item,
            NotifyCollectionChanged: true
        });
        props.ItemTemplate = this.state.TreeViewParent?.state?.ItemTemplate;
        props.Item = item;
        if (this.state.TreeViewParent?.state?.IsExpandedPath)
            props.IsExpanded = new Binding({
                Path: this.state.TreeViewParent.state.IsExpandedPath,
                Source: item,
            });

        return super.OnRenderItem(item, props);
    }
}