import { BindingBase, BindingMode } from "./Binding";
import { BindingExpression } from "./BindingExpression";
import { ModelObjectReference } from "./ModelObjectReference";

export interface IClient
{        
    InitializeComponent(target: any);
    UpdateTargetValue(target: any, targetProperty: string, value: any, reRender: boolean);
    Bind(target: any, args?: { path?: string, source?: any }): any;
    BindCommand(target: any, args?: { path: string, source?: ModelObjectReference }): () => void;
}