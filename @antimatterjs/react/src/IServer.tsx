import { BindingExpression } from "./BindingExpression";
import { ICollectionUpdate } from "./ICollectionUpdate";
import { ModelObjectReference } from "./ModelObjectReference";
import { ModelValue, ModelValueType } from "./ModelValue";
import { System_Object } from "./Mono/Platform";

export interface IServer
{
    StartupAsync(): Promise<void>;
    OnServerStartup(): void;
    GetRootObject(objectid: string): Promise<ModelObjectReference>;
    ExecuteICommand(netRef: ModelObjectReference, parameter?: ModelValue): Promise<void>
    Bind(ref: ModelObjectReference, path: string | undefined, expression: BindingExpression);
    Unbind(exp: BindingExpression);
    UpdateBindingSource(bxIndex: number, value: ModelValue);
    UpdateBoundCollection(bxIndex: number, value: ICollectionUpdate);        
}