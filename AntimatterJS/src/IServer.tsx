import { BindingExpression } from "./BindingExpression";
import { ModelObjectReference } from "./ModelObjectReference";

export interface IServer
{
    StartupAsync(): Promise<void>;
    GetRootObject(objectid: string): Promise<ModelObjectReference>;
    ExecuteICommand(netRef: ModelObjectReference): Promise<void>
    Bind(ref: ModelObjectReference, path: string | undefined, expression: BindingExpression);        
}