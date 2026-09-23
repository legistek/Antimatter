import { BindingExpression } from "./BindingExpression";
import { ICollectionUpdate } from "./ICollectionUpdate";
import { ModelObjectReference } from "./ModelObjectReference";

export interface IServer
{
    StartupAsync(): Promise<void>;
    OnServerStartup(): void;
    ParseLocallyFormattedDate(date: string): Date;
    GetRootObject(objectid: string): Promise<ModelObjectReference>;
    ExecuteICommand(netRef: ModelObjectReference, parameter?: any): Promise<void>
    OnUserActivity(silent?: boolean);
    InvokeModelObjectMethod(netRef: ModelObjectReference|number, method: string, args?: any[]): void;
    Bind(ref: ModelObjectReference, path: string | undefined, expression: BindingExpression);
    Unbind(exp: BindingExpression);
    UpdateBindingSource(bxIndex: number, value: any);
    UpdateBoundCollection(bxIndex: number, value: ICollectionUpdate);
    GetCollectionMembers(handle: number, offset: number, count: number);
    GetCollectionSize(handle: number): number;
    InvokeBeforeClose(): boolean;
    DownloadUrl(url: string, fileName: string | null | undefined);
    AddRef(handle: number);
    ReleaseRef(handle: number);
}