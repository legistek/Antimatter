export class PropertyChangedEventArgs {
    constructor(propertyName: string) {
        this._propertyName = propertyName;
    }

    private _propertyName: string;
    public get propertyName(): string {
        return this._propertyName;
    }
}