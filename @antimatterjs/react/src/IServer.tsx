import { BindingExpression } from "./BindingExpression";
import { ModelObjectReference } from "./ModelObjectReference";
import { ModelValue } from "./ModelValue";

export interface IServer
{
    StartupAsync(): Promise<void>;
    OnServerStartup(): void;
    GetRootObject(objectid: string): Promise<ModelObjectReference>;
    ExecuteICommand(netRef: ModelObjectReference, parameter?: ModelValue): Promise<void>
    Bind(ref: ModelObjectReference, path: string | undefined, expression: BindingExpression);
    Unbind(exp: BindingExpression);
    UpdateBindingSource(bxIndex: number, value: ModelValue);
}