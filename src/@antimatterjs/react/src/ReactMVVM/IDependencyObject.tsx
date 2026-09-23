import { DependencyProperty, DependencyPropertyChangedEventArgs } from "./DependencyProperty";
import { Event } from '@antimatterjs/react/src/Event';

export interface IDependencyObject
{
    Parent?: IDependencyObject;
    DataContext: any;
    SetValue(property: DependencyProperty, value: any);
    GetValue(property: DependencyProperty): any;
    InheritablePropertyChanged: Event<DependencyPropertyChangedEventArgs>;
    SetCurrentValue(property: DependencyProperty, value: any): void;
}