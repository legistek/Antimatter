import { BindingBase, BindingMode } from "./Binding";
import { BindingExpression } from "./BindingExpression";

export interface IClient
{        
    InitializeComponent(target: any);
    UpdateTargetValue(target: any, targetProperty: string, value: any);
    Bind(target: any, args?: { path?: string, source?: any }): any;
    BindCommand(target: any, args?: { path: string, source?: any }): () => void;
}