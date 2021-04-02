import { Event } from "./Event";
import { INotifyPropertyChanged } from "./INotifyPropertyChanged";
import { PropertyChangedEventArgs } from "./PropertyChangedEventArgs";

export class ObservableObject implements INotifyPropertyChanged {
    public propertyChanged: Event<PropertyChangedEventArgs> =
        new Event<PropertyChangedEventArgs>();

    protected onPropertyChanged(property: string): void {
        this.propertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(property));
    }
}