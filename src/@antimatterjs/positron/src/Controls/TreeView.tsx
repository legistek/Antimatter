import * as React from 'react';
import { Antimatter, Binding, BindingMode, ModelObjectReference, Utilities } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { IItemsControlProps, ItemsControlBase } from './ItemsControl';
import { Style, WebStyle } from '../Style';
import { IPanelProps } from '../Controls/Panel';
import { Grid } from './Grid';
import { StackPanel } from './StackPanel';
import { HorizontalAlignment, ScrollBarVisibility } from '../Enums';
import { TextBlock } from './TextBlock';
import { Icon, MotionAnimations } from '@fluentui/react';
import { ControlTemplate } from '../FrameworkTemplate';
import { SemanticColor, Theme } from '../Theme';
import { IFrameworkElementState } from '../FrameworkElement';
import { VirtualizedPanel } from './VirtualizedPanel';
import { ICollectionUpdate } from '@antimatterjs/react/src/ICollectionUpdate';
import { Glyph } from './Glyph';


export interface ITreeViewProps extends IItemsControlProps
{    
    CanUserSelect?: boolean | Binding,
    SelectionChangedCommand?: ModelObjectReference | Binding,
    SelectedItem?: ModelObjectReference | Binding,
    ChildrenPath?: string,
    IsExpandedPath?: string,
    IsSelectedPath?: string,
    PlaceholderHeight?: number | Binding,
    IsFlat?: boolean | Binding,
    IsEnabledPath?: string,
    IsVisiblePath?: string,
    HideExpanderPath?: string,
    IndentWidth?: number | Binding;
}

export class TreeViewBase<P extends ITreeViewProps = {}> extends ItemsControlBase<P>
{
    /* private */ _selectedTVI?: TreeViewItemBase<ITreeViewItemProps, ITreeViewItemState>;
    /* internal */ _dataMap: Map<any, TreeViewItem> = new Map<any, TreeViewItem>();
    _selectWhenCreatedKey: any;

    public static DefaultBindings = {
        ItemsSource: {
            NotifyCollectionChanged: true
        },
        SelectedItem: {
            Mode: BindingMode.TwoWay
        }
    };

    public static DefaultStyle: WebStyle<ITreeViewProps> = new WebStyle<ITreeViewProps>(
        {
            ItemsPanelStyle: new WebStyle<IPanelProps>({
                VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
                AutoScrollForDrag: true,
            }),
            CanUserSelect: true,
            PlaceholderHeight: 32,
        }
    );

    public get IndentWidth(): number|undefined
    {
        return this.GetValue(nameof(this.props.IndentWidth))
    }

    public get CanUserSelect(): boolean
    {
        return this.GetValue(nameof(this.props.CanUserSelect))
    }

    public get IsFlat(): boolean
    {
        return this.GetValue(nameof(this.props.IsFlat));
    }

    public get PlaceholderHeight(): number
    {
        return this.GetValue(nameof(this.props.PlaceholderHeight), 0);
    }

    public get ChildrenPath(): string | undefined
    {
        return this.GetValue(nameof(this.props.ChildrenPath));
    }

    public get HideExpanderPath(): string | undefined
    {
        return this.GetValue(nameof(this.props.HideExpanderPath));
    }

    public get SelectedItem(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.SelectedItem));
    }

    public get IsExpandedPath(): string | undefined
    {
        return this.GetValue(nameof(this.props.IsExpandedPath));
    }

    public get IsSelectedPath(): string | undefined
    {
        return this.GetValue(nameof(this.props.IsSelectedPath));
    }

    public get IsEnabledPath(): string | undefined
    {
        return this.GetValue(nameof(this.props.IsEnabledPath));
    }
    public get IsVisiblePath(): string | undefined
    {
        return this.GetValue(nameof(this.props.IsVisiblePath));
    }

    public get SelectionChangedCommand(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.SelectionChangedCommand));
    }

    protected override GetContainerForItemOverride()
    {
        return TreeViewItemBase;
    }

    /* override */ OnRenderItem(item: any, index: number, props?: ITreeViewItemProps)
    {
        props = props || {};
        props.TreeViewParent = this;
        props.ItemTemplate = this.ItemTemplate;
        props.ItemContainerStyle = this.ItemContainerStyle;
        props.ItemsSource = new Binding({
            Path: this.ChildrenPath,
            Source: item,
            NotifyCollectionChanged: true
        });
        props.Margin = "0px";
        props.Item = item;
        if (this.IsExpandedPath)
            props.IsExpanded = new Binding({
                Path: this.IsExpandedPath,
                Source: item
            });
        if (this.IsSelectedPath)
            props.IsSelected = new Binding({
                Path: this.IsSelectedPath,
                Source: item
            });
        if (this.IsEnabledPath)
            props.IsItemEnabled = new Binding({
                Path: this.IsEnabledPath,
                Source: item
            });
        if (this.IsVisiblePath)
            props.IsItemVisible = new Binding({
                Path: this.IsVisiblePath,
                Source: item
            });
        if (this.HideExpanderPath)
            props.HideExpander = new Binding({
                Path: this.HideExpanderPath,
                Source: item
            });

        return super.OnRenderItem(item, index, props);
    }

    // Called by a TVI on a click or a binding-based selection
    // We assume the new TVI has NOT set its own state
    public SetSelectedItem(tvi: TreeViewItemBase<ITreeViewItemProps, ITreeViewItemState>)
    {
        if (this.SelectionChangedCommand)
            Antimatter.Server.ExecuteICommand(
                this.SelectionChangedCommand as ModelObjectReference,
                tvi.Item);
        var oldTVI = this._selectedTVI;
        this._selectedTVI = tvi;
        this.SetValue(nameof(this.SelectedItem), tvi.Item, false);
        tvi.SetValue(nameof<TreeViewItem>(s => s.IsSelected), true);
        oldTVI?.SetValue(nameof<TreeViewItem>(s => s.IsSelected), false);
    }

    // Invoked by an external binding changing the selected item
    public override async OnBoundPropertyUpdate(prop: string, value: any, oldValue: any)
    {
        if (prop === nameof(this.SelectedItem))
        {
            if (this._selectedTVI?.Item === value)
            {
                // this really shouldn't happen but if it does
                // it's a no op
            }
            else
            {
                this._selectedTVI?.SetValue(nameof<TreeViewItem>(s => s.IsSelected), false);
                var newItemKey = Utilities.SmartGetKey(value);

                //Handle special case of initial selection, where the children don't exist yet
                if (this._dataMap.size == 0)
                {
                    this._selectWhenCreatedKey = newItemKey;
                    return;
                }
                var newTVI = this._dataMap.get(newItemKey);
                newTVI?.SetValue(nameof<TreeViewItem>(s => s.IsSelected), true);
                this._selectedTVI = newTVI;
                //this.InvalidateRender();
            }
        }
        else
        {
            super.OnBoundPropertyUpdate(prop, value, oldValue);
        }
    }
}

export class TreeView extends TreeViewBase<ITreeViewProps>
{
}

export interface ITreeViewItemCommon
{
    TreeViewParent?: TreeViewBase,
    Item?: any
}
export interface ITreeViewItemProps extends IItemsControlProps, ITreeViewItemCommon
{    
    IsExpanded?: boolean | Binding,
    IsSelected?: boolean | Binding,
    IsItemEnabled?: boolean | Binding,  //Not "IsEnabled", which already exists & would encompass expander/children
    IsItemVisible?: boolean | Binding,   //"IsVisible" is already in use for expansion purposes
    HideExpander?: boolean | Binding
}
interface ITreeViewItemState extends IFrameworkElementState, ITreeViewItemCommon
{
}
export class TreeViewItemBase<
    P extends ITreeViewItemProps,
    S extends ITreeViewItemState>
    extends ItemsControlBase<P, S>
{
    private static DISABLED_CLASS: string = 'disabled-item';

    constructor(props)
    {
        super(props);
        if (this.state.TreeViewParent?._dataMap)
        {
            var key = Utilities.SmartGetKey(this.state.Item);
            this.state.TreeViewParent._dataMap.set(key, this);

            if (this.state.TreeViewParent._selectWhenCreatedKey == key)
            {
                this.state.TreeViewParent._selectedTVI = this;
                this.state.TreeViewParent._selectWhenCreatedKey = null;
            }
        }
    }

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

    public static readonly DefaultTreeViewNodeTemplate =
        new ControlTemplate((templatedParent: TreeViewItemBase<ITreeViewItemProps, ITreeViewItemState>) =>
        {
            return (
                <VirtualizedPanel PlaceholderHeight={templatedParent.TreeViewParent?.PlaceholderHeight || 0}>
                    <Grid
                        ColumnDefinitions={[
                            Grid.ColumnDefinition(templatedParent.TreeViewParent?.IndentWidth),
                            Grid.ColumnDefinition(1, true)
                        ]}
                        RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition()]}
                        IsVisible={templatedParent.IsItemVisible}>

                        {/*Expander*/}
                        {
                            !templatedParent.HideExpander &&
                            <Glyph
                                HorizontalAlignment={HorizontalAlignment.Center}
                                OnClick={(e) => templatedParent.ToggleIsExpanded()}
                                ClassName={templatedParent.GetExpanderClasses()}
                                Icon="ChevronRight" />
                        }

                        {/*This Item*/}
                        <Grid
                            ClassName={templatedParent.GetItemClassName()}
                            Grid={{ Column: 1, Row: 0 }}
                            OnClick={(e) =>
                            {
                                if (templatedParent.IsItemEnabled &&
                                    templatedParent.TreeViewParent?.CanUserSelect)
                                    templatedParent.TreeViewParent?.SetSelectedItem(templatedParent);
                            }}>
                            {templatedParent.props.children}
                        </Grid>

                        {/* Children */}
                        <StackPanel
                            ref={r => { templatedParent.ItemsPanelInstance = r; } }
                            ItemsParent={templatedParent}
                            Grid={{
                                Row: 1,
                                Column:
                                    (templatedParent.HideExpander || templatedParent.TreeViewParent?.IsFlat)
                                        ? 0
                                        : 1,
                                ColumnSpan:
                                    (templatedParent.HideExpander || templatedParent.TreeViewParent?.IsFlat)
                                        ? 2
                                        : 1,
                            }}
                            IsVisible={templatedParent.IsExpanded}
                            VerticalScrollBarVisibility={ScrollBarVisibility.Hidden}
                            HorizontalScrollBarVisibility={ScrollBarVisibility.Hidden} />
                    </Grid>
                </VirtualizedPanel>
            )
        });

    public static DefaultStyle: WebStyle<ITreeViewProps> = new WebStyle<ITreeViewProps>(
        {
            Template: TreeViewItemBase.DefaultTreeViewNodeTemplate
        },
        {
            //"@": {
            //    animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            //},
            "@ .tree-item:not(.selected):hover": {
                background: Theme.Value(SemanticColor.ButtonBackgroundHovered),
            },
            ":not(.is-dragging) @ .tree-item:not(.selected):not(.disabled-item)": {
                cursor: "pointer"
            },
            [`.tree-item.${TreeViewItemBase.DISABLED_CLASS}:not(.selected):hover`]: {
                background: 'none',
                cursor: 'default'
            },
            "@ .expander": {
                gridRow: 0,
                gridColumn: 0,
                cursor: "pointer",
                alignSelf: "center",
                margin: "0px 5px 0px 0px"
            },
            "@ .selected": {
                background: Theme.Value(SemanticColor.ListItemBackgroundChecked)
            },
            "@ .selected:hover": {
                background: Theme.Value(SemanticColor.ListItemBackgroundCheckedHovered),
            },
            "@ .expander.nochildren": {
                visibility: "collapse",
            },
            "@ .expander.nochildren.flat": {
                display: "none",
            },
            "@ .expander.expanded": {
                transform: "rotate(90deg)"
            }
        });

    public get TreeViewParent(): TreeViewBase | undefined
    {
        return this.GetValue(nameof(this.props.TreeViewParent));
    }

    public get Item(): any
    {
        return this.GetValue(nameof(this.props.Item));
    }

    public get IsExpanded(): boolean
    {
        return this.GetValue(nameof(this.props.IsExpanded), false);
    }

    public get IsSelected(): boolean
    {
        return this.GetValue(nameof(this.props.IsSelected), false);
    }

    public get IsItemEnabled(): boolean
    {
        return this.GetValue(nameof(this.props.IsItemEnabled), true);
    }
    public get IsItemVisible(): boolean
    {
        return this.GetValue(nameof(this.props.IsItemVisible), true);
    }
    public get HideExpander(): boolean
    {
        return this.GetValue(nameof(this.props.HideExpander), false);
    }



    protected override OnItemsSourceCollectionChanged(sender: any, e: ICollectionUpdate)
    {
        this.InvalidateRender();
    }

    /* private */ GetItemClassName(): string
    {
        let classNames: string = "tree-item";
        if (this.IsSelected ||
            Utilities.SmartEquals(
                this.state.Item,
                this.state.TreeViewParent?.SelectedItem))
        {
            if (!this.IsSelected)
                this.SetValue(nameof(this.IsSelected), true, false);
            classNames += " selected";
        }

        if (!this.IsItemEnabled)
            classNames += ` ${TreeViewItem.DISABLED_CLASS}`;

        return classNames;
    }

    /* private */ ToggleIsExpanded()
    {
        this.SetValue("IsExpanded", !this.IsExpanded);
    }

    /* private */ GetExpanderClasses(): string
    {
        let classes: string = "expander ";

        if (!this.ItemsSource || this.ItemsSource.length === 0)
        {
            classes += "nochildren ";
            if (this.state.TreeViewParent?.IsFlat)
                classes += "flat ";
        }
        if (this.IsExpanded)
            classes += "expanded ";

        return classes;
    }

    protected override GetContainerForItemOverride()
    {
        return TreeViewItemBase;
    }

    /* override */ OnRenderItem(item: any, index: number, props?: ITreeViewItemProps)
    {
        props = props || {};
        props.TreeViewParent = this.state.TreeViewParent;
        props.Margin = "0px";
        props.ItemsSource = new Binding({
            Path: this.state.TreeViewParent?.ChildrenPath,
            Source: item,
            NotifyCollectionChanged: true
        });
        props.ItemContainerStyle = this.ItemContainerStyle;
        props.ItemTemplate = this.state.TreeViewParent?.ItemTemplate;
        props.Item = item;
        if (this.state.TreeViewParent?.IsExpandedPath)
            props.IsExpanded = new Binding({
                Path: this.state.TreeViewParent.IsExpandedPath,
                Source: item,
            });
        if (this.state.TreeViewParent?.IsSelectedPath)
            props.IsSelected = new Binding({
                Path: this.state.TreeViewParent.IsSelectedPath,
                Source: item
            });
        if (this.state.TreeViewParent?.IsEnabledPath)
            props.IsItemEnabled = new Binding({
                Path: this.state.TreeViewParent.IsEnabledPath,
                Source: item
            });
        if (this.state.TreeViewParent?.IsVisiblePath)
            props.IsItemVisible = new Binding({
                Path: this.state.TreeViewParent.IsVisiblePath,
                Source: item
            });
        if (this.state.TreeViewParent?.HideExpanderPath)
            props.HideExpander = new Binding({
                Path: this.state.TreeViewParent.HideExpanderPath,
                Source: item
            });

        return super.OnRenderItem(item, index, props);
    }
}

export class TreeViewItem extends TreeViewItemBase<ITreeViewItemProps, ITreeViewItemState>
{
}