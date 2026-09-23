import { Antimatter, Binding, BindingMode, BindingParameters, ModelObjectReference, Utilities, BoundCollection } from '@antimatterjs/react';
import { IItemsControlProps, ItemsControlBase } from '../ItemsControl';
import { SelectionMode } from '../../Enums';
import { FrameworkElement, IFrameworkElementState } from '../../FrameworkElement';
import { SelectableItemControlBase } from './SelectableItemControl';
import { ICollectionUpdate } from '@antimatterjs/react/src/ICollectionUpdate';

export interface ISelectorProps extends IItemsControlProps
{
    SelectedItem?: any | Binding,
    SelectedIndex?: number | Binding,
    SelectedItems?: any[] | Binding,
    IsSelectAll?: boolean | Binding,
    CanSelect?: boolean | Binding,
    IsSelectedPath?: string,
    SelectionMode?: SelectionMode,
    SelectionChangedCommand?: ModelObjectReference | Binding,
    SelectionClickedCommand?: ModelObjectReference | ((commandParameter: any) => void) | Binding,
    ItemDoubleClickCommand?: ModelObjectReference | Binding,
    IsEnabledPath?: string,
    FallbackSelectFirst?: boolean
}

//Default state param for use by "base" classes that Selector
export class EmptyISelectorState implements IFrameworkElementState
{
}

export class SelectorBase<P extends ISelectorProps = { ItemsSource: [], SelectedItems: [] },
    S extends IFrameworkElementState = {}>
    extends ItemsControlBase<P, S>
{
    _currentSelectionAnchor: number = -1;
    _selectedItems: any[] = [];

    public static DefaultBindings = {
        ItemsSource: {
            FallbackValue: [],
            NotifyCollectionChanged: true
        },
        SelectedItem: {
            Mode: BindingMode.TwoWay,
            ValidatesOnDataErrors: true
        },
        SelectedIndex: {
            Mode: BindingMode.TwoWay
        },
        SelectedItems: {
            Mode: BindingMode.TwoWay,
            NotifyCollectionChanged: true
        }
    };

    public override OnRenderItem(item: any, index: number, props?: any): JSX.Element | null
    {
        const disabled: boolean = this.CheckIsDisabled(item);

        if (!props)
            props = {};

        props.Parent = this;
        props.Item = item;
        props.ItemIndex = index;

        if (this.CanSelect)
        {
            if (this.IsSelectedPath)
                props.IsSelected = new Binding({
                    Path: this.IsSelectedPath,
                    Source: item,
                    Mode: BindingMode.TwoWay
                });
            else
            {
                props.IsSelected = this.IsItemSelected(item);
            }
        }
        props.IsEnabled = !disabled;

        if (!disabled)
        {
            props.OnClick = (event: MouseEvent) => this.OnItemClick(event, item);
            props.OnDblClick = (event: MouseEvent, target: FrameworkElement) => this.OnItemDblClick(event, item);
            props.OnPointerDown = (event: PointerEvent) => this.OnItemPointerDown(event, item);
        }

        return super.OnRenderItem(item, index, props);
    }

    public get IsSelectedPath(): string|undefined
    {
        return this.GetValue(nameof(this.props.IsSelectedPath));
    }

    public get FallbackSelectFirst(): boolean
    {
        return this.GetValue(nameof(this.props.FallbackSelectFirst), false);
    }

    public get SelectedItems(): any[]
    {
        return this.GetValue(nameof(this.props.SelectedItems), this._selectedItems);
    }
    public set SelectedItems(value: any[])
    {
        this.SetValue(nameof(this.props.SelectedItems), value, false);
    }

    public get ItemDoubleClickCommand(): ModelObjectReference | undefined
    {
        return this.GetValue(nameof(this.props.ItemDoubleClickCommand));
    }

    public get SelectionChangedCommand(): ModelObjectReference
    {
        return this.GetValue(nameof(this.props.SelectionChangedCommand));
    }

    public get SelectionClickedCommand(): ModelObjectReference | ((commandParameter: any) => void) | undefined
    {
        return this.GetValue(nameof(this.props.SelectionClickedCommand));
    }

    public get CanSelect(): boolean
    {
        return this.GetValue(nameof(this.props.CanSelect), true);
    }

    public get IsSelectAll(): boolean
    {
        return this.GetValue(nameof(this.props.IsSelectAll), false);
    }
    public set IsSelectAll(value: boolean)
    {
        this.SetValue(nameof(this.props.IsSelectAll), value, true);
        this.OnSelectionChanged();
    }

    public get SelectedItem(): any
    {
        return this.GetValue(nameof(this.props.SelectedItem));
    }
    protected set SelectedItem(value: any)
    {
        this.SetValue(nameof(this.props.SelectedItem), value);
    }

    public get SelectedIndex(): number
    {
        return this.GetValue(nameof(this.props.SelectedIndex));
    }
    public set SelectedIndex(value: number)
    {
        this.SetValue(nameof(this.props.SelectedIndex), value);
    }

    public get IsMultiSelect(): boolean
    {
        return this.SelectionMode === SelectionMode.Multiple ||
            this.SelectionMode === SelectionMode.Extended;
    }

    public get IsEnabledPath(): string
    {
        return this.GetValue(nameof(this.props.IsEnabledPath));
    }

    public SelectNext(previous: boolean = false)
    {
        var index = this.ItemsSource.indexOf(this.SelectedItem);
        if (previous && index > 0 ||
            !previous && index < this.ItemsSource.length - 1)
        {
            this.SetSingleItemSelection(!previous ? index + 1 : index - 1);
        }
    }

    public FocusSelected(scrollToView: boolean = true)
    {
        if (this.SelectionMode !== SelectionMode.Single ||
            !this.SelectedItem)
            return;

        var items = this.ItemsSource;
        var item = this.SelectedItem;
        var index = items?.findIndex(i => i === item);
        if (index === -1)
            return;

        var container = this.TryGetItemContainer(index)?.Container;

        var focused = container?.focus();
        if (scrollToView)
            container?.scrollIntoView();
    }

    IsItemSelected(item: any): boolean
    {
        if (this.IsSelectAll)
            return true;
        else if (this.SelectionMode !== SelectionMode.Single)
        {
            if (this.SelectedItems.length === 0)
                return false;

            var match = this.SelectedItems.find(sel =>
                Utilities.SmartEquals(sel, item)) != undefined;
            return match;
        }
        else
        {
            if (this.SelectedItem?.IsModelObjectReference && item?.IsModelObjectReference)
                return (item as ModelObjectReference).Key === (this.SelectedItem as ModelObjectReference).Key;
            else
                return this.SelectedItem == item;
        }
    }

    OnItemPointerDown(event: MouseEvent, item: any): void
    {
        this.ProcessSelectionPointerAction(event, item, false, event.button !== 0, this.IsItemSelected(item));
    }

    OnItemClick(event: MouseEvent, item: any): void
    {
        this.ProcessSelectionPointerAction(event, item, true, event.button !== 0, this.IsItemSelected(item));
        event.stopPropagation();
    }

    OnItemDblClick(event: MouseEvent, item: any): void
    {
        if (this.ItemDoubleClickCommand)
            this.ExecuteCommand(this.ItemDoubleClickCommand, item);
    }

    public get SelectionMode(): SelectionMode
    {
        return this.GetValue(nameof(this.props.SelectionMode), SelectionMode.Single);
    }

    protected /* virtual */ OnSelectionChanged()
    {
        this.InvalidateRender(this.CanSelect && !this.IsSelectedPath);

        const ref: ModelObjectReference = this.SelectionChangedCommand;
        if (ref)
            Antimatter.Server.ExecuteICommand(ref, this.SelectedItem);
    }

    protected override GetContainerForItemOverride(): typeof FrameworkElement
    {
        return SelectableItemControlBase;
    }

    /* private */ ProcessSelectionPointerAction(event: MouseEvent, item: any, fullClick: boolean, rightClick:boolean, isCurrentlySelected: boolean)
    {
        if (!this.CanSelect)
            return;

        var itemIndex: number = this.ItemsSource?.findIndex(it => Utilities.SmartEquals(item, it)) ?? -1;

        // Screwy-looking logic to try to replicate Windows Explorer behavior.
        if (this.SelectionMode === SelectionMode.Single)
        {
            this._currentSelectionAnchor = -1;
            if (!fullClick && this.SelectedItem !== item)
            {
                this.SelectedItem = item;
                this.SelectedIndex = itemIndex;
                this.OnSelectionChanged();
            }
            else
            {
                this.ExecuteCommand(this.SelectionClickedCommand, item);
                return;
            }
        }
        else if (event.ctrlKey)
        {
            this._currentSelectionAnchor = -1;
            if (fullClick)
                this.ChangeSingleItemSelectionState(item, !isCurrentlySelected);
            else
                return;
        }
        else if (event.shiftKey)
        {
            if (fullClick)
                return;
            if (itemIndex == -1)
                return; // should never happen

            let currentSelStart: number = 0;
            let currentSelEnd: number = 0;
            var first = this.SelectedItems.length > 0 ? this.SelectedItems[0] : null;
            if (first)
            {
                currentSelStart = this.ItemsSource?.findIndex(it => Utilities.SmartEquals(first, it)) || -1;
                if (currentSelStart == -1)
                    currentSelStart = 0;
            }

            if (this._currentSelectionAnchor != -1)
            {
                var last = this.SelectedItems.length > 0
                    ? this.SelectedItems[this.SelectedItems.length - 1]
                    : null;
                if (last)
                    currentSelEnd = this.ItemsSource?.findIndex(it => Utilities.SmartEquals(last, it)) || -1;
                if (currentSelEnd == -1)
                    currentSelEnd = 0;
            }

            let newSelStart: number = 0;
            let newSelEnd: number = 0;

            if (itemIndex < currentSelStart)
            {
                newSelStart = itemIndex;
                newSelEnd = this._currentSelectionAnchor == -1
                    ? currentSelStart :
                    this._currentSelectionAnchor;
                this._currentSelectionAnchor = newSelEnd;
            }
            else
            {
                newSelStart = this._currentSelectionAnchor == -1
                    ? currentSelStart :
                    this._currentSelectionAnchor;
                newSelEnd = itemIndex;
                this._currentSelectionAnchor = newSelStart;
            }

            var selection = this.SelectedItems;
            selection.splice(
                0,
                selection.length,
                ...(this.ItemsSource?.slice(newSelStart, newSelEnd + 1) || []));

            //this.SetValue(
            //    nameof(this.state.SelectedItems),
            //    this.state.ItemsSource?.slice(newSelStart, newSelEnd + 1));
            this.OnSelectionChanged();
        }
        else
        {
            this._currentSelectionAnchor = -1;

            //if (isCurrentlySelected && fullClick || !isCurrentlySelected && !fullClick)
            //    this.SetSingleItemSelection(itemIndex);

            if (rightClick)
            {
                if (isCurrentlySelected)
                    return;
                else
                    this.SetSingleItemSelection(itemIndex);
            }
            else if (fullClick)
            {
                if (this.SelectionMode === SelectionMode.Extended)
                    this.SetSingleItemSelection(itemIndex);
                else
                    this.ToggleMultiItemSelection(itemIndex);
            }
            else
            {
                return;
            }
        }

        // Forces all the instantiated children to re-render with their new selection state
        this.ItemsPanelInstance?.InvalidateRender();
    }

    private ChangeSingleItemSelectionState(item: any, select: boolean)
    {
        if (select)
        {
            this.SelectedItems.push(item);
        }
        else
        {
            var index = this.SelectedItems.findIndex(i => Utilities.SmartEquals(item, i));
            if (index == -1)
                return;
            this.SelectedItems.splice(index, 1);
        }
        this.SelectedItems = this.SelectedItems;    // just force a binding update?
        this.OnSelectionChanged();
    }

    public SetSingleItemSelection(index: number)
        {
            var item = this.ItemsSource
                ? this.ItemsSource[index]
                : undefined;
            if (!item)
                return;            
            if (this.SelectionMode !== SelectionMode.Single)
                this.SelectedItems.splice(0, this.SelectedItems.length, item);
            else
        {
                this.SelectedItem = item;                
            this.SelectedIndex = index;
        }
        this.OnSelectionChanged();
    }

    public ToggleMultiItemSelection(index: number): void
    {
        if (index < 0 || index > (this.ItemsSource?.length ?? 0) || !this.CanSelect)
            return;

        var item: any = this.ItemsSource ? this.ItemsSource[index] : null;
        if (!item || (this.SelectionMode == SelectionMode.Single))
            return;

        var items = this.SelectedItems;
        const currentIndex: number = items.findIndex(it => Utilities.SmartEquals(it, item));

        if (currentIndex == -1)
            items.push(item);
        else
            items.splice(currentIndex, 1);

        //const itemsCopy: any[] = items.slice();
        //this.SetValue(nameof(this.state.SelectedItems), itemsCopy);

        this.OnSelectionChanged();
    }

    public override async OnBoundPropertyUpdate(prop: string, value: any, oldValue: any)
    {
        if (prop === nameof(this.props.SelectedItem))
        {
            this.ItemsPanelInstance?.InvalidateRender();
        }
        else if (prop === nameof(this.props.SelectedItems))
        {
            if (oldValue?.IsBoundCollection)
                (oldValue as BoundCollection<any>).CollectionChanged.unsubscribe(this.Callback(this.OnSelectedItemsCollectionChanged));

            if (value?.IsBoundCollection)
                (value as BoundCollection<any>).CollectionChanged.subscribe(this.Callback(this.OnSelectedItemsCollectionChanged));

            this.ItemsPanelInstance?.InvalidateRender();
        }
        else if (prop === nameof(this.props.SelectedIndex))
        {
            this.SetSingleItemSelection(this.SelectedIndex);
        }
        else if (prop == nameof(this.props.CanSelect))
        {
            if (!value)
            {
                if (this.IsMultiSelect)
                {
                    if (this.SelectedItems)
                        this.SelectedItems.splice(0, this.SelectedItems.length);
                    this.OnSelectionChanged();
                }
            }
        }

        super.OnBoundPropertyUpdate(prop, value, oldValue);
    }

    protected /* virtual */ OnSelectedItemsCollectionChanged(sender: any, e: ICollectionUpdate)
    {
        this.ItemsPanelInstance?.InvalidateRender(
            this.CanSelect && !this.IsSelectedPath);
    }

    protected override OnItemsSourceCollectionChanged(sender: any, e: ICollectionUpdate)
    {
        super.OnItemsSourceCollectionChanged(sender, e);
        if (this.FallbackSelectFirst
            && (!this.SelectedItem || !this.ItemsSource.includes(this.SelectedItem)))
        {
            this.SetSingleItemSelection(0);
        }
    }

    private CheckIsDisabled(item?: any): boolean
    {
        if (!item)
            return true;
        if (!this.IsEnabledPath)
            return false;
        const disabledBindParams: BindingParameters = {
            Path: this.IsEnabledPath,
            Source: item,
            Converter: (val) => !val
        };
        return this.BindState(disabledBindParams, `${Utilities.SmartGetKey(item)}:IsDisabled`);
    }
}


export class Selector extends SelectorBase<ISelectorProps, IFrameworkElementState>
{
}