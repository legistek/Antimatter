import { BindingExpression } from "./BindingExpression";
import { ModelObjectReference } from "./ModelObjectReference";
import { ModelValue } from "./ModelValue";

export interface IServer
{
    StartupAsync(): Promise<void>;
    GetRootObject(objectid: string): Promise<ModelObjectReference>;
    ExecuteICommand(netRef: ModelObjectReference): Promise<void>
    Bind(ref: ModelObjectReference, path: string | undefined, expression: BindingExpression);
    UpdateBindingSource(bxIndex: number, value: ModelValue);
}