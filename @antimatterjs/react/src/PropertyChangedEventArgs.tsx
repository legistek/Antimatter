export class PropertyChangedEventArgs {
    constructor(propertyName: string) {
        this._propertyName = propertyName;
    }

    _propertyName: string;
    public get propertyName(): string {
        return this._propertyName;
    }
}