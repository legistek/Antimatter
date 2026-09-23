import { Antimatter } from '../Antimatter';
import { BindingExpression } from '../BindingExpression';
import { ReactClient } from '../React/ReactClient';
import { DependencyBindingExpression } from './DependencyBindingExpression';
import { IDependencyObject } from './IDependencyObject';

export class ReactMVVMClient extends ReactClient
{
    public UpdateTargetValue(target: any, targetProperty: string, value: any, rerender: boolean)
    {
        if (!target || !target.IsDependencyObject)
            super.UpdateTargetValue(target, targetProperty, value, rerender);
        target[targetProperty] = value;
    }
}