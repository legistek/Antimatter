using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.SignalR;

using Newtonsoft.Json;

using Antimatter.Net;
using Antimatter.Net.Interop;

namespace Antimatter.Net.SignalR
{
    public delegate Task SessionStartupDelegate(ObjectManager manager);

    public class AntimatterRelay : Hub, IClient
    {
        public static event SessionStartupDelegate StartupSession;

        public AntimatterRelay()
        {
            Reactor.Client = this;
        }

        public async Task Startup()
        {
            if (StartupSession != null)
            {
                var mgr = GetOrCreateReferenceManager();
                await StartupSession.Invoke(mgr);
            }
        }

        public int GetRootObject(string identifier)
        {
            return GetOrCreateReferenceManager().GetRootObject(identifier);
        }

        public void Bind(int netRef, string path, int bxIndex)
        {
            GetOrCreateReferenceManager().Bind(netRef, path, bxIndex);
        }

        public void ExecuteICommand(int netRef)
        {
            GetOrCreateReferenceManager().ExecuteICommand(netRef);
        }

        void IClient.UpdateBinding(string clientID, int bxIndex, DotNetValue value)
        {
            var json = JsonConvert.SerializeObject(value);
            Clients.Client(clientID)?.SendAsync("UpdateBinding", bxIndex, json);
        }

        private ObjectManager GetOrCreateReferenceManager()
        {
            object mgrObject;
            if (!this.Context.Items.TryGetValue("antimatter", out mgrObject))
            {
                mgrObject = new ObjectManager(this.Context.ConnectionId);
                this.Context.Items["antimatter"] = mgrObject;
            }
            return mgrObject as ObjectManager;            
        }
    }
}