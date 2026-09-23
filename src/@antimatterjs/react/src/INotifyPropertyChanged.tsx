import { Event } from '@antimatterjs/react/src/Event';
import { PropertyChangedEventArgs } from '@antimatterjs/react/src/PropertyChangedEventArgs'

export interface INotifyPropertyChanged {
    PropertyChanged: Event<PropertyChangedEventArgs>;
}