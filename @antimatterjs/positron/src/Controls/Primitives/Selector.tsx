import { Binding, ModelObjectReference } from '@antimatterjs/react';
import { IItemsControlState, IItemsControlProps, ItemsControl } from '../ItemsControl';
import { SelectionMode } from '../../Enums';
import { IFrameworkElementProps, IFrameworkElementState } from '@antimatterjs/positron/src/FrameworkElement';

export interface ISelectorProps extends IItemsControlProps
{
    SelectedItem?: any | Binding,
    SelectedIndex?: number | Binding,
    SelectedItems?: any[] | Binding,
    IsSelectAll?: boolean | Binding,
    CanSelect?: boolean | Binding,
    SelectionMode?: SelectionMode,
}

export interface ISelectorState extends IItemsControlState
{
    SelectedItem?: any,
    SelectedIndex?: number,
    SelectedItems: any[],
    IsSelectAll?: boolean,
    CanSelect?: boolean
}

export interface ISelectableItemProps extends IFrameworkElementProps
{
    IsSelected?: boolean,
    SelectedForeground?: string,
    SelectedBackground?: string
}

export interface ISelectableItemState extends IFrameworkElementState
{
    IsSelected?: boolean
}

export class Selector<P extends ISelectorProps = { ItemsSource: [], SelectedItems: [] },
    S extends ISelectorState = { ItemsSource: [], SelectedItems: [] }>
    extends ItemsControl<P, S>
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

    public /* virtual */ OnRenderItem(item: any): JSX.Element | null
    {
        var props: ISelectableItemProps = {
            IsSelected: this.IsItemSelected(item),
            OnClick: (event: MouseEvent) => this.OnItemClick(event, item),
            OnPointerDown: (event: PointerEvent) => this.OnItemPointerDown(event, item)
        };
        return super.OnRenderItem(item, props);
    }

    IsItemSelected(item: any): boolean
    {
        if (this.state.IsSelectAll)
            return true;
        else if (this.SelectionMode !== SelectionMode.Single)
        {
            return (this.state.SelectedItems.length > 0 && this.state.SelectedItems.includes(item)) === true;
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

    ProcessSelectionPointerAction(event: MouseEvent, item: any, fullClick: boolean, isCurrentlySelected: boolean)
    {
        if (!this.CanSelect)
            return;

        var itemIndex = this.state.ItemsSource?.findIndex(it => it == item) || -1;
        this._lastClickedOrSelected = itemIndex || -1;

        // Screwy-looking logic to try to replicate Windows Explorer behavior.
        if (this.SelectionMode === SelectionMode.Single)
        {
            this._currentSelectionAnchor = -1;
            if (!fullClick)
                this.SetValue(nameof(this.state.SelectedItem), item);
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
                currentSelStart = this.state.ItemsSource?.findIndex(it => it == first) || -1;
                if (currentSelStart == -1)
                    currentSelStart = 0;
            }

            if (this._currentSelectionAnchor != -1)
            {
                var last = this.state.SelectedItems.length > 0
                    ? this.state.SelectedItems[this.state.SelectedItems.length - 1]
                    : null;
                if (last)
                    currentSelEnd = this.state.ItemsSource?.findIndex(it => it == last) || -1;
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

            this.SetValue(
                nameof(this.state.SelectedItems),
                this.state.ItemsSource?.slice(newSelStart, newSelEnd + 1));
        }
        else
        {
            this._currentSelectionAnchor = -1;

            if (isCurrentlySelected && fullClick || !isCurrentlySelected && !fullClick)
                this.SetSingleItemSelection(itemIndex);
        }

        // Forces all the instantiated children to re-render with their new selection state
        this.ItemsPanelInstance?.InvalidateRender();
    }

    ChangeSingleItemSelectionState(item: any, select: boolean)
    {
        if (select)
        {
            this.state.SelectedItems.push(item);            
        }
        else
        {
            var index = this.state.SelectedItems.findIndex(i => i == item);
            if (index == -1)
                return;
            this.state.SelectedItems.splice(index, 1);
        }
        this.SetValue(nameof(this.state.SelectedItems), this.state.SelectedItems);
    }

    SetSingleItemSelection(index: number)
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
        this._lastClickedOrSelected = index;
    }
    
    /* private */ OnPropertyChanged(prop: string, value: any, oldValue: any)
    {
        if (prop === nameof(this.state.SelectedItem))
        {
            this.InvalidateRender();
        }
        else
        {
            super.OnPropertyChanged(prop, value, oldValue);
        }
    }
}
