import { ObservableObject } from "./ObservableObject";

export class Person extends ObservableObject {
    // #region firstName property
    _firstName: string = '';
    public get firstName(): string {
        return this._firstName;
    }
    public set firstName(value: string) {
        if (value === this._firstName)
            return;
        this._firstName = value;
        this.onPropertyChanged("firstName");
    }
    // #endregion

    _age: number = 0;
    public get age(): number {
        return this._age;
    }
    public set age(value: number) {
        if (value === this._age)
            return;
        this._age = value;
        this.onPropertyChanged("age");
    }
}