import { Antimatter, Binding, BindingParameters, ModelObjectReference, ModelValue, Utilities } from '@antimatterjs/react';
import { IItemsControlState, IItemsControlProps, ItemsControl, ItemsControlBase } from '../ItemsControl';
import { SelectionMode } from '../../Enums';
import { FrameworkElement, IFrameworkElementProps, IFrameworkElementState } from '../../FrameworkElement';
import { ISelectableItemControlProps, SelectableItemControl, SelectableItemControlBase } from './SelectableItemControl';
import { BoundCollection } from '@antimatterjs/react/src/BoundCollection';

export interface ISelectorProps extends IItemsControlProps
{
    SelectedItem?: any | Binding,
    SelectedIndex?: number | Binding,
    SelectedItems?: any[] | Binding,
    IsSelectAll?: boolean | Binding,
    CanSelect?: boolean | Binding,
    SelectionMode?: SelectionMode,
    SelectionChangedCommand?: ModelObjectReference | Binding,
    IsEnabledPath?: string
}

export interface ISelectorState extends IItemsControlState
{
    SelectedItem?: any,
    SelectedIndex?: number,
    SelectedItems: any[],
    IsSelectAll?: boolean,
    CanSelect?: boolean,
    SelectionChangedCommand?: ModelObjectReference,
    IsEnabledPath?: string
}

//Default state param for use by "base" classes that Selector
export class EmptyISelectorState implements ISelectorState { SelectedItems = []; }

export class Selector<P extends ISelectorProps = { ItemsSource: [], SelectedItems: [] },
    S extends ISelectorState = { ItemsSource: [], SelectedItems: [] }>
    extends ItemsControlBase<P, S>
{
    _selectedIndex: number = -1;
    _lastClickedOrSelected: number = -1;
    _currentSelectionAnchor: number = -1;

    constructor(props)
    {
        super(props);
        if (!this.state.SelectedItems)
            (this.state as any).SelectedItems = [];
    }

    public /* virtual */ OnRenderItem(item: any, index: number): JSX.Element | null
    {
        const disabled: boolean = this.CheckIsDisabled(item);

        var props: ISelectableItemControlProps = {
            Parent: this,
            Item: item,
            ItemIndex: index,
            IsSelected: this.IsItemSelected(item),
            IsEnabled: !disabled
        };
        if (!disabled)
        {
            props.OnClick = (event: MouseEvent) => this.OnItemClick(event, item);
            props.OnPointerDown = (event: PointerEvent) => this.OnItemPointerDown(event, item);
        }

        return super.OnRenderItem(item, index, props);
    }

    IsItemSelected(item: any): boolean
    {
        if (this.state.IsSelectAll)
            return true;
        else if (this.SelectionMode !== SelectionMode.Single)
        {
            if (this.state.SelectedItems == null)
                return false;


            //return (this.state.SelectedItems.length > 0 && this.state.SelectedItems.includes(item)) === true;

            var match = this.state.SelectedItems?.find(sel =>
                Utilities.SmartEquals(sel, item)) != undefined;
            return match;
            
        }
        else
        {
            if (this.state.SelectedItem?.IsModelObjectReference && item?.IsModelObjectReference)
                return (item as ModelObjectReference).Key === (this.state.SelectedItem as ModelObjectReference).Key;
            else
                return this.state.SelectedItem == item;
        }
    }

    OnItemPointerDown(event: MouseEvent, item: any): void
    {
        this.ProcessSelectionPointerAction(event, item, false, this.IsItemSelected(item));
    }

    OnItemClick(event: MouseEvent, item: any): void
    {
        this.ProcessSelectionPointerAction(event, item, true, this.IsItemSelected(item));
    }

    get SelectionMode(): SelectionMode
    {
        return this.props.SelectionMode === undefined
            ? SelectionMode.Single
            : this.props.SelectionMode as SelectionMode;
    }

    get CanSelect(): boolean
    {
        return this.state.CanSelect !== false;
    }

    /* protected virtual */ OnSelectionChanged()
    {
        this.InvalidateRender();

        const ref: ModelObjectReference = this.state.SelectionChangedCommand as ModelObjectReference;
        if (ref)
            Antimatter.Server.ExecuteICommand(ref, ModelValue.Get(null));
    }

    /* protected override */ GetContainerForItemOverride(): typeof FrameworkElement
    {
        return SelectableItemControlBase;
    }

    /* private */ ProcessSelectionPointerAction(event: MouseEvent, item: any, fullClick: boolean, isCurrentlySelected: boolean)
    {
        if (!this.CanSelect)
            return;

        var itemIndex: number = this.state.ItemsSource?.findIndex(it => Utilities.SmartEquals(item, it)) ?? -1;
        this._lastClickedOrSelected = itemIndex;

        // Screwy-looking logic to try to replicate Windows Explorer behavior.
        if (this.SelectionMode === SelectionMode.Single)
        {
            this._currentSelectionAnchor = -1;
            if (!fullClick)
            {
                this.SetValue(nameof(this.state.SelectedItem), item);
                this.OnSelectionChanged();
            }
        }
        else if (event.ctrlKey)
        {
            this._currentSelectionAnchor = -1;
            if (fullClick)
                this.ChangeSingleItemSelectionState(item, !isCurrentlySelected);
        }
        else if (event.shiftKey)
        {
            if (fullClick)
                return;
            if (itemIndex == -1)
                return; // should never happen

            let currentSelStart: number = 0;
            let currentSelEnd: number = 0;
            var first = this.state.SelectedItems.length > 0 ? this.state.SelectedItems[0] : null;
            if (first)
            {
                currentSelStart = this.state.ItemsSource?.findIndex(it => Utilities.SmartEquals(first, it)) || -1;
                if (currentSelStart == -1)
                    currentSelStart = 0;
            }

            if (this._currentSelectionAnchor != -1)
            {
                var last = this.state.SelectedItems.length > 0
                    ? this.state.SelectedItems[this.state.SelectedItems.length - 1]
                    : null;
                if (last)
                    currentSelEnd = this.state.ItemsSource?.findIndex(it => Utilities.SmartEquals(last, it)) || -1;
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

            var selection = this.state.SelectedItems || [];
            selection.splice(
                0,
                selection.length,
                ...(this.state.ItemsSource?.slice(newSelStart, newSelEnd + 1)||[]) );

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

            if (fullClick)
                this.ToggleMultiItemSelection(itemIndex);
        }

        // Forces all the instantiated children to re-render with their new selection state
        this.ItemsPanelInstance?.InvalidateRender();
    }
    
    /* private */ ChangeSingleItemSelectionState(item: any, select: boolean)
    {
        if (select)
        {
            this.state.SelectedItems.push(item);
        }
        else
        {
            var index = this.state.SelectedItems.findIndex(i => Utilities.SmartEquals(item, i));
            if (index == -1)
                return;
            this.state.SelectedItems.splice(index, 1);
        }
        this.SetValue(nameof(this.state.SelectedItems), this.state.SelectedItems);
        this.OnSelectionChanged();
    }

    /* private */ SetSingleItemSelection(index: number)
    {
        var item = this.state.ItemsSource
            ? this.state.ItemsSource[index]
            : undefined;
        if (!item)
            return;
        if (this.SelectionMode !== SelectionMode.Single)
        {
            this.SetValue(nameof(this.state.SelectedItems), [item]);
        }
        else
        {
            this.SetValue(nameof(this.state.SelectedItem), item);
        }
        this.OnSelectionChanged();
        this._lastClickedOrSelected = index;
    }

    /* private*/ ToggleMultiItemSelection(index: number): void
    {
        if (index < 0 || index > (this.state.ItemsSource?.length ?? 0))
            return;

        var item: any = this.state.ItemsSource ? this.state.ItemsSource[index] : null;
        if (!item || (this.SelectionMode == SelectionMode.Single))
            return;
        const items: any[] = this.state.SelectedItems ?? [];

        const currentIndex: number = items.findIndex(it => Utilities.SmartEquals(it, item));

        if (currentIndex == -1)
            items.push(item);
        else
            items.splice(currentIndex, 1);

        //const itemsCopy: any[] = items.slice();
        //this.SetValue(nameof(this.state.SelectedItems), itemsCopy);

        this.OnSelectionChanged();
        this._lastClickedOrSelected = index;
    }

    override OnPropertyChanged(prop: string, value: any, oldValue: any)
    {
        if (prop === nameof(this.state.SelectedItems))
        {
            if (oldValue?.IsBoundCollection)
                (oldValue as BoundCollection<any>).CollectionChanged.unsubscribe(this.Callback(this.OnSelectedItemsCollectionChanged));

            if (value?.IsBoundCollection)
                (value as BoundCollection<any>).CollectionChanged.subscribe(this.Callback(this.OnSelectedItemsCollectionChanged));

            this.ItemsPanelInstance?.InvalidateRender();
        }

        super.OnPropertyChanged(prop, value, oldValue);
    }

    protected OnSelectedItemsCollectionChanged(sender: any, e: void)
    {
        this.ItemsPanelInstance?.InvalidateRender();
    }

    private CheckIsDisabled(item?: any): boolean
    {
        if (!item)
            return true;
        const disabledBindParams: BindingParameters = {
            Path: this.state.IsEnabledPath,
            Source: item,
            Converter: (val) => !val
        };
        return this.BindState(disabledBindParams, `${Utilities.SmartGetKey(item)}:IsDisabled`);
    }
}
