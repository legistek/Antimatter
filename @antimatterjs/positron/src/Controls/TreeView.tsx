import * as React from 'react';
import { Antimatter, Binding, BindingMode, ModelObjectReference, ModelValue, Utilities } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { IItemsControlProps, IItemsControlState, ItemsControl } from './ItemsControl';
import { Style } from '../Style';
import { IPanelProps } from '../Controls/Panel';
import { Grid } from './Grid';
import { StackPanel } from './StackPanel';
import { ScrollBarVisibility } from '../Enums';
import { TextBlock } from './TextBlock';
import { getTheme, Icon, MotionAnimations } from '@fluentui/react';
import { ControlTemplate } from '../FrameworkTemplate';

export interface ITreeViewCommon
{
    ChildrenPath?: string,
    IsContentEnabledPath?: string,
    IsExpandedPath?: string,
    IsSelectedPath?: string
}
export interface ITreeViewProps extends IItemsControlProps, ITreeViewCommon
{
    SelectionChangedCommand?: ModelObjectReference | Binding,
    SelectedItem?: ModelObjectReference | Binding,
}
export interface ITreeViewState extends IItemsControlState, ITreeViewCommon
{
    SelectionChangedCommand?: ModelObjectReference,
    SelectedItem?: ModelObjectReference
}
export class TreeView<
    P extends ITreeViewProps = {},
    S extends ITreeViewState = {}>
    extends ItemsControl<P, S>
{
    /* private */ _selectedTVI?: TreeViewItem<ITreeViewItemProps, ITreeViewItemState>;
    /* internal */ _dataMap: Map<any, TreeViewItem> = new Map<any, TreeViewItem>();

    public static DefaultBindings = {
        ItemsSource: {
            NotifyCollectionChanged: true
        },
        SelectedItem: {
            Mode: BindingMode.TwoWay
        }
    };

    public static DefaultStyle: Style<ITreeViewProps> = new Style<ITreeViewProps>(
        {
            ItemsPanelStyle: new Style<IPanelProps>({
                VerticalScrollBarVisibility: ScrollBarVisibility.Auto
            })
        }
    );

    /* override */ GetContainerForItemOverride()
    {       
        return TreeViewItem;
    }

    /* override */ OnRenderItem(item: any, index: number, props?: ITreeViewItemProps)
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
                Source: item
            });
        if (this.state.IsSelectedPath)
            props.IsSelected = new Binding({
                Path: this.state.IsSelectedPath,
                Source: item
            });
                
        return super.OnRenderItem(item, index, props);
    }

    // Called by a TVI on a click or a binding-based selection
    // We assume the new TVI has NOT set its own state
    /* private */ SetSelectedItem(tvi: TreeViewItem<ITreeViewItemProps, ITreeViewItemState>)
    {
        var oldTVI = this._selectedTVI;        
        this._selectedTVI = tvi;
        this.SetValue(nameof(this.state.SelectedItem), tvi.props.Item, false);
        tvi.SetValue(nameof<ITreeViewItemState>(s => s.IsSelected), true);
        oldTVI?.SetValue(nameof<ITreeViewItemState>(s => s.IsSelected), false);
        if (this.state.SelectionChangedCommand)
            Antimatter.Server.ExecuteICommand(
                this.state.SelectionChangedCommand as ModelObjectReference,
                ModelValue.Get(this.state.SelectedItem));
    }

    // Invoked by an external binding changing the selected item
    /* private */ OnPropertyChanged(prop: string, value: any, oldValue: any)
    {
        if (prop === nameof(this.state.SelectedItem))
        {
            if (this._selectedTVI?.state?.Item === value)
            {
                // this really shouldn't happen but if it does
                // it's a no op
            }
            else
            {
                this._selectedTVI?.SetValue(nameof<ITreeViewItemState>(s => s.IsSelected), false);
                var newItemKey = Utilities.SmartGetKey(value);
                var newTVI = this._dataMap.get(newItemKey);
                newTVI?.SetValue(nameof<ITreeViewItemState>(s => s.IsSelected), true);
                this._selectedTVI = newTVI;
                //this.InvalidateRender();
            }
        }
        else
        {
            super.OnPropertyChanged(prop, value, oldValue);
        }
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
    IsSelected?: boolean | Binding
}
interface ITreeViewItemState extends IItemsControlState, ITreeViewItemCommon
{
    IsExpanded?: boolean,
    IsSelected?: boolean
}
class TreeViewItem<
    P extends ITreeViewItemProps = {},
    S extends ITreeViewItemState = {}>
    extends ItemsControl<P, S>
{
    constructor(props)
    {
        super(props);
        if (this.state.TreeViewParent?._dataMap)
        {
            var key = Utilities.SmartGetKey(this.state.Item);
            this.state.TreeViewParent._dataMap.set(key, this);
        }
    }

    static theme = getTheme();

    public static DefaultBindings = {
        IsExpanded: {
            Mode: BindingMode.TwoWay
        },
        IsSelected: {
            Mode: BindingMode.TwoWay
        },
        ItemsSource: {
            NotifyCollectionChanged: true
        }
    };

    public static DefaultStyle: Style<ITreeViewProps> = new Style<ITreeViewProps>(
        {
            Template: new ControlTemplate((templatedParent: TreeViewItem<ITreeViewItemProps, ITreeViewItemState>) =>
            (
                <Grid
                    ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}
                    RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition()]}>

                    {/*Expander*/}
                    <Icon
                        onClick={(e) => templatedParent.ToggleIsExpanded()}
                        className={templatedParent.GetExpanderClasses()}
                        iconName="e9e1" />


                                            {/*IsEnabled={new Binding({*/}
                                            {/*    Path: templatedParent.state.TreeViewParent?.state.IsContentEnabledPath,*/}
                                            {/*    Source: templatedParent.state.Item*/}
                                            {/*})}*/}
                    {/*This Item*/}
                    <Grid
                        ClassName={templatedParent.GetItemClassName()}
                        Grid={{ Column: 1, Row: 0 }}
                        OnClick={(e) => templatedParent.state.TreeViewParent?.SetSelectedItem(templatedParent)}>
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
            ))
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
            Selector: "@ .selected",
            Rules: {
                background: TreeViewItem.theme.semanticColors.listItemBackgroundChecked
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

    /* private */ GetItemClassName(): string
    {
        if (Utilities.SmartEquals(
            this.state.Item,
            this.state.TreeViewParent?.state?.SelectedItem))
        {
            this.SetValue("IsSelected", true, false);
            return "selected";
        }

        return "";        
    }

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

    /* override */ GetContainerForItemOverride()
    {
        return TreeViewItem;
    }

    /* override */ OnRenderItem(item: any, index: number, props?: ITreeViewItemProps)
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
        if (this.state.TreeViewParent?.state.IsSelectedPath)
            props.IsSelected = new Binding({
                Path: this.state.TreeViewParent.state.IsSelectedPath,
                Source: item
            });

        return super.OnRenderItem(item, index, props);
    }
}