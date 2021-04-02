import { IClient } from "./IClient";
import { IServer } from "./IServer";

export class Antimatter
{
    private static _client: IClient;

    public static Server: IServer;   

    public static StartAsync(server: IServer, client: IClient): Promise<void>
    {
        Antimatter.Server = (window as any).AntimatterServer = server;
        Antimatter._client = (window as any).AntimatterClient = client;
        return server.StartupAsync();
    }

    public static UpdateTargetValue(target: any, targetProperty: string, value: any)
    {
        Antimatter._client.UpdateTargetValue(target, targetProperty, value);
    }

    public static InitializeComponent(target: any)
    {
        Antimatter._client.InitializeComponent(target);
    }

    public static Bind(target: any, args?: { path?: string, source?: any }): any
    {
        return Antimatter._client.Bind(target, args);
    }

    public static BindCommand(target: any, args?: { path: string, source?: any }): () => void
    {
        return Antimatter._client.BindCommand(target, args);
    }
}