import { Event } from "../Event";
import { INotifyPropertyChanged } from "../INotifyPropertyChanged";
import { PropertyChangedEventArgs } from "../PropertyChangedEventArgs";

export class ObservableObject implements INotifyPropertyChanged {
    public PropertyChanged: Event<PropertyChangedEventArgs> =
        new Event<PropertyChangedEventArgs>();

    protected onPropertyChanged(property: string): void {
        this.PropertyChanged.invoke(
            this,
            new PropertyChangedEventArgs(property));
    }
}