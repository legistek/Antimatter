import * as React from 'react';
import { Antimatter, Binding, BindingMode, ModelObjectReference, RelativeSourceMode, Utilities } from '@antimatterjs/react';
import { Control, IControlProps, IControlState } from './Control';
import { IItemsControlProps, ItemsControlBase } from './ItemsControl';
import { Style, WebStyle } from '../Style';
import { Grid } from './Grid';
import { HorizontalAlignment, ScrollBarVisibility } from '../Enums';
import { Icon, MotionAnimations } from '@fluentui/react';
import { ControlTemplate, DataTemplate } from '../FrameworkTemplate';
import { SemanticColor, Theme } from '../Theme';
import { IVirtualizingStackPanelProps, VirtualizingStackPanel } from './VirtualizingStackPanel';
import { ContentPresenter } from './ContentPresenter';
import { ContentControl, ContentControlBase, IContentControlProps } from './ContentControl';
import { VirtualizedPanel } from './VirtualizedPanel';
import { StackPanel } from './StackPanel';

export interface IModelManagedTreeViewItemProps extends IContentControlProps
{
    ModelManagedTreeViewParent?: ModelManagedTreeViewBase<IModelManagedTreeViewProps>,
    IsSelected?: boolean | Binding,
    ItemTemplate?: DataTemplate,
    IndentLevel?: number | Binding,
    IsExpanded?: boolean | Binding,
    CanExpand?: boolean | Binding,
    IndentSize?: number | Binding,
    IsItemEnabled?: boolean | Binding,  //Not "IsEnabled", which already exists & would encompass expander/children
    IsItemVisible?: boolean | Binding   //"IsVisible" is already in use for expansion purposes
    MaxItemWidth?: number | string | Binding,   
}

export class ModelManagedTreeViewItemBase<P extends IModelManagedTreeViewItemProps = {}, S extends IControlState = {}>
    extends ContentControlBase<P, S>
{
    private static DISABLED_CLASS: string = 'disabled-item';
    public static readonly PART_Content = Antimatter.Identifier("amx-ptn-mmtv-content");

    constructor(props)
    {
        super(props);
        if (this.ModelManagedTreeViewParent?._dataMap)
        {
            var key = Utilities.SmartGetKey(this.Content);
            this.ModelManagedTreeViewParent._dataMap.set(key, this);

            if (this.ModelManagedTreeViewParent._selectWhenCreatedKey == key)
            {
                this.ModelManagedTreeViewParent._selectedTVI = this;
                this.ModelManagedTreeViewParent._selectWhenCreatedKey = null;
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

    public static DefaultStyle: WebStyle<IModelManagedTreeViewItemProps> = new WebStyle<IModelManagedTreeViewItemProps>(
        {
            Template: new ControlTemplate((templatedParent: ModelManagedTreeViewItemBase) =>
            {
                return ModelManagedTreeViewItem._baseTemplate(templatedParent);
            })
        },
        {
            //"@": {
            //    animation: `${MotionAnimations.slideDownIn.replace("100ms", "400ms")}, ${MotionAnimations.fadeIn.replace("100ms", "400ms")}`
            //},
            [`@ .${ModelManagedTreeViewItemBase.PART_Content}:not(.selected):hover`]: {
                background: Theme.Value(SemanticColor.ButtonBackgroundHovered),
            },
            [`:not(.is-dragging) @ .${ModelManagedTreeViewItemBase.PART_Content}:not(.selected):not(.disabled-item)`]: {
                cursor: "pointer"
            },
            [`.${ModelManagedTreeViewItemBase.PART_Content}.${ModelManagedTreeViewItemBase.DISABLED_CLASS}:not(.selected):hover`]: {
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
                background: Theme.Value(SemanticColor.ListItemBackgroundChecked) + " !important"
            },
            "@ .selected:hover": {
                background: Theme.Value(SemanticColor.ListItemBackgroundCheckedHovered) + "!important"
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
        },
        ContentControl.DefaultStyle
    );

    public static VariableHeightStyle: WebStyle<IModelManagedTreeViewItemProps> = new WebStyle<IModelManagedTreeViewItemProps>(
        {
            Template: (templatedParent: ModelManagedTreeViewItem) =>
                <>
                    <VirtualizedPanel PlaceholderHeight={templatedParent.ModelManagedTreeViewParent.PlaceholderHeight}>
                        {ModelManagedTreeViewItem._baseTemplate(templatedParent)}
                    </VirtualizedPanel>
                </>
        },
        {
        },
        ModelManagedTreeViewItemBase.DefaultStyle);

    public get ModelManagedTreeViewParent(): ModelManagedTreeViewBase<IModelManagedTreeViewProps>
    {
        return this.GetValue(nameof(this.props.ModelManagedTreeViewParent));
    }

    public get IndentSize(): number
    {
        return this.GetValue(nameof(this.props.IndentSize), 0);
    }

    public get IndentLevel(): number
    {
        return this.GetValue(nameof(this.props.IndentLevel), 0);
    }

    public get CanExpand(): boolean
    {
        return this.GetValue(nameof(this.props.CanExpand));
    }

    public get ItemTemplate(): DataTemplate | undefined
    {
        return this.GetValue(nameof(this.props.ItemTemplate));
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

    public get MaxItemWidth(): number | string | undefined
    {
        return this.GetValue(nameof(this.props.MaxItemWidth));
    }

    /* private */ GetItemClassName(): string
    {
        let classNames = ModelManagedTreeViewItem.PART_Content;
        if (Utilities.SmartEquals(
            this.Content,
            this.ModelManagedTreeViewParent?.SelectedItem))
        {
            this.SetValue(nameof(this.IsSelected), true, false);
            classNames += " selected";
        }

        if (!this.IsItemEnabled)
            classNames += ` ${ModelManagedTreeViewItem.DISABLED_CLASS}`;

        return classNames;
    }

    /* private */ ToggleIsExpanded()
    {
        this.SetValue(nameof(this.props.IsExpanded), !this.IsExpanded);
    }

    /* private */ GetExpanderClasses(): string
    {
        let classes: string = "expander ";

        if (!this.CanExpand)
        {
            classes += "nochildren ";
            if (this.ModelManagedTreeViewParent?.IsFlat)
                classes += "flat ";
        }
        if (this.IsExpanded)
            classes += "expanded ";

        return classes;
    }

    private static _baseTemplate = (templatedParent: ModelManagedTreeViewItem) =>
        <Grid
            Margin={`0px 0px 0px ${templatedParent.IndentLevel * templatedParent.IndentSize}px`}
            ColumnDefinitions={[Grid.ColumnDefinition(), Grid.ColumnDefinition(1, true)]}
            RowDefinitions={[Grid.RowDefinition(), Grid.RowDefinition()]}
            IsVisible={templatedParent.IsItemVisible}>

            {/*Expander*/}
            <Icon
                onPointerDown={
                    (e) => e.stopPropagation()  // don't want this to trigger selection
                }
                onClick={(e) =>
                {
                    templatedParent.ToggleIsExpanded();
                    e.stopPropagation();
                }}
                className={templatedParent.GetExpanderClasses()}
                iconName="ChevronRight" />

            {/*This Item*/}
            <ContentPresenter
                OnClick={(e) =>
                {
                    if (templatedParent?.IsItemEnabled)
                        templatedParent?.ModelManagedTreeViewParent?.SetSelectedItem(templatedParent);
                }}
                MaxWidth={templatedParent.MaxItemWidth}
                ContentTemplate={templatedParent.ItemTemplate}
                Content={templatedParent.Content}
                ClassName={templatedParent.GetItemClassName()}
                Grid={{ Column: 1, Row: 0 }} />
        </Grid>;

}

export class ModelManagedTreeViewItem extends ModelManagedTreeViewItemBase<IModelManagedTreeViewItemProps>
{
}

export interface IModelManagedTreeViewProps extends IItemsControlProps
{
    CanUserSelect?: boolean | Binding,
    SelectedItem?: ModelObjectReference | Binding,
    SelectionChangedCommand?: ModelObjectReference | Binding,    
    CanExpandPath?: string;
    IsContentEnabledPath?: string,
    IsExpandedPath?: string,
    IsSelectedPath?: string,
    IndentLevelPath?: string,
    PlaceholderHeight?: number | Binding,
    IsFlat?: boolean | Binding,
    IsEnabledPath?: string,
    IsVisiblePath?: string,
    IndentSize?: number | Binding,
    AllowHScroll?: boolean | Binding,
    MaxItemWidth?: number | string | Binding,   // Only applies when AllowHScroll is true
}

export class ModelManagedTreeViewBase<P extends IModelManagedTreeViewProps = {}> extends ItemsControlBase<P>
{
    /* private */ _selectedTVI?: ModelManagedTreeViewItemBase;
    /* internal */ _dataMap: Map<any, ModelManagedTreeViewItemBase> = new Map<any, ModelManagedTreeViewItemBase>();
    _selectWhenCreatedKey: any;

    public static DefaultBindings = {
        ItemsSource: {
            FallbackValue: [],
            NotifyCollectionChanged: true
        },
        SelectedItem: {
            Mode: BindingMode.TwoWay
        },
        SelectedIndex: {
            Mode: BindingMode.TwoWay
        },
        SelectedItems: {
            Mode: BindingMode.TwoWay,
            NotifyCollectionChanged: true
        }
    };

    public static DefaultStyle: WebStyle<IModelManagedTreeViewProps> = new WebStyle<IModelManagedTreeViewProps>(
        {
            ItemsPanelStyle: new WebStyle<IVirtualizingStackPanelProps>({
                VerticalScrollBarVisibility: ScrollBarVisibility.Auto,
                HorizontalScrollBarVisibility: ScrollBarVisibility.Auto,
                AutoScrollForDrag: true,
            }),
            MaxItemWidth: "20vw",
            IndentSize: 25,
            PlaceholderHeight: 50,
            ItemsPanel: VirtualizingStackPanel,
            CanUserSelect: true,
        }
    );

    public static VariableHeightStyle: WebStyle<IModelManagedTreeViewProps> = new WebStyle<IModelManagedTreeViewProps>(
        {
            ItemsPanel: StackPanel,
            ItemContainerStyle: ModelManagedTreeViewItem.VariableHeightStyle
        },
        {
        },
        ModelManagedTreeViewBase.DefaultStyle);

    public get AllowHScroll(): boolean
    {
        return this.GetValue(nameof(this.props.AllowHScroll), true);
    }

    public get MaxItemWidth(): number | string | undefined
    {
        return this.GetValue(nameof(this.props.MaxItemWidth));
    }

    public get CanUserSelect(): boolean
    {
        return this.GetValue(nameof(this.props.CanUserSelect))
    }

    public get IndentLevelPath(): string | undefined
    {
        return this.GetValue(nameof(this.props.IndentLevelPath));
    }

    public get IndentSize(): number
    {
        return this.GetValue(nameof(this.props.IndentSize), 0);
    }

    public get IsFlat(): boolean
    {
        return this.GetValue(nameof(this.props.IsFlat));
    }

    public get PlaceholderHeight(): number
    {
        return this.GetValue(nameof(this.props.PlaceholderHeight), 0);
    }

    public get CanExpandPath(): string | undefined
    {
        return this.GetValue(nameof(this.props.CanExpandPath));
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
        if (this.ItemContainerType)
            return this.ItemContainerType;
        return ModelManagedTreeViewItemBase;
    }

    // Called by a TVI on a click or a binding-based selection
    // We assume the new TVI has NOT set its own state
    public SetSelectedItem(tvi: ModelManagedTreeViewItemBase)
    {
        if (!this.CanUserSelect)
            return;
        var oldTVI = this._selectedTVI;
        this._selectedTVI = tvi;
        this.SetValue(nameof(this.SelectedItem), tvi.Content, false);
        tvi.SetValue(nameof<ModelManagedTreeViewItem>(s => s.IsSelected), true, true);
        oldTVI?.SetValue(nameof<ModelManagedTreeViewItem>(s => s.IsSelected), false, true);
        if (this.SelectionChangedCommand)
            Antimatter.Server.ExecuteICommand(
                this.SelectionChangedCommand as ModelObjectReference,
                this.SelectedItem);
    }

    private _key: number = 0;
    /* override */ OnRenderItem(item: any, index: number, props?: IModelManagedTreeViewItemProps)
    {
        props = props || {};
        props.ModelManagedTreeViewParent = this;
        props.ItemTemplate = this.ItemTemplate;
        props.Margin = "0px";
        props.Content = item;
        props.IndentSize = this.IndentSize;
        if (this.AllowHScroll)
        {
            props.HorizontalAlignment = HorizontalAlignment.Left;
            props.MaxItemWidth = this.MaxItemWidth;
        }

        if (this.IndentLevelPath)
            props.IndentLevel = new Binding({
                Path: this.IndentLevelPath,
                Source: item
            });
        if (this.CanExpandPath)
            props.CanExpand = new Binding({
                Path: this.CanExpandPath,
                Source: item
            });
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

        return super.OnRenderItem(item, index, props);
    }    
}

export class ModelManagedTreeView extends ModelManagedTreeViewBase<IModelManagedTreeViewProps>
{
}
