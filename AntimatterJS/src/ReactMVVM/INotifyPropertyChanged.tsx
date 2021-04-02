import { Event } from './Event';
import { PropertyChangedEventArgs } from './PropertyChangedEventArgs'

export interface INotifyPropertyChanged {
    propertyChanged: Event<PropertyChangedEventArgs>;
}