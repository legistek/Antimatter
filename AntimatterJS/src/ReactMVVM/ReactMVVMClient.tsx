import { Antimatter } from '../Antimatter';
import { BindingMode } from '../Binding';
import { BindingExpression } from '../BindingExpression';
import { ReactClient } from '../React/ReactClient';
import { DependencyBindingExpression } from './DependencyBindingExpression';
import { IDependencyObject } from './IDependencyObject';

export class ReactMVVMClient extends ReactClient
{
    public UpdateTargetValue(target: any, targetProperty: string, value: any)
    {
        if (!target || !target.IsDependencyObject)
            super.UpdateTargetValue(target, targetProperty, value);
        target[targetProperty] = value;
    }
}