import { Antimatter, Binding, BindingMode, BindingParameters, ModelObjectReference, Utilities, BoundCollection } from '@antimatterjs/react';
import { IItemsControlProps, ItemsControlBase } from '../ItemsControl';
import { SelectionMode } from '../../Enums';
import { FrameworkElement, IFrameworkElementState } from '../../FrameworkElement';
import { SelectableItemControlBase } from './SelectableItemControl';
import { ICollectionUpdate } from '@antimatterjs/react/src/ICollectionUpdate';
import { ISelectorProps, SelectorBase } from './Selector';
import { DataTemplate, TemplateFunction } from '../../..';

export interface IEditableSelectorProps extends ISelectorProps
{
    EditMode?: boolean | Binding;
    EditableItemTemplate?: TemplateFunction;
}

export class EditableSelectorBase<P extends IEditableSelectorProps = {},
    S extends IFrameworkElementState = {}>
    extends SelectorBase<P, S>
{
    public override GetTemplateForItem(item?: any): TemplateFunction
    {
        if (this.EditMode && this.IsItemSelected(item) && this.EditableItemTemplate)
            return this.EditableItemTemplate;
        return super.GetTemplateForItem(item);        
    }

    public override async OnBoundPropertyUpdate(prop: string, value: any, oldValue: any)
    {
        if (prop === nameof(this.props.EditMode))
        {
            this.InvalidateRender(true);
        }
        super.OnBoundPropertyUpdate(prop, value, oldValue);
    }

    public get EditMode(): boolean
    {
        return this.GetValue(nameof(this.props.EditMode), false);
    }

    public get EditableItemTemplate(): TemplateFunction | undefined
    {
        return this.GetValue(nameof(this.props.EditableItemTemplate));
    }
}

export class EditableSelector extends EditableSelectorBase<IEditableSelectorProps>
{
}