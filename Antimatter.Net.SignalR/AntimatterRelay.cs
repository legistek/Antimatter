using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace Antimatter.Net.SignalR
{
    public delegate Task SessionStartupDelegate(Reactor reactor);

    public class AntimatterRelay : Hub, IClient
    {
        public static event SessionStartupDelegate StartupSession;

        public AntimatterRelay()
        {
            Reactor.Initialize(this);
        }

        [AMXClientInvocable]
        public async Task Startup()
        {
            if (StartupSession != null)
            {
                var reactor = GetOrCreateReactor();
                await StartupSession.Invoke(reactor);
            }
        }

        [AMXClientInvocable]
        public int GetRootObject(string identifier)
        {
            return GetOrCreateReactor().GetRootObject(identifier);
        }

        [AMXClientInvocable]
        public void Bind(int netRef, string path, int bxIndex, bool notifyCollectionChanged, bool marshalledObject)
        {
            GetOrCreateReactor().Bind(netRef, path, bxIndex, notifyCollectionChanged, marshalledObject);
        }

        [AMXClientInvocable]
        public void Unbind(int bxIndex)
        {
            GetOrCreateReactor().Unbind(bxIndex);
        }

        [AMXClientInvocable]
        public void ExecuteICommand(int netRef, ModelValue value)
        {
            GetOrCreateReactor().ExecuteICommand(netRef, value);
        }

        [AMXClientInvocable]
        public void UpdateBindingSource(int bxIndex, ModelValue value)
        {
            GetOrCreateReactor().UpdateBindingSource(bxIndex, value);
        }

        public ModelValue MarshalObject(object obj)
        {
            try
            {
                return new ModelValue
                {
                    Type = ModelValueType.MarshalledObject,
                    StringValue = JsonConvert.SerializeObject(obj)
                };
            }
            catch
            {
                return ModelValue.Null;
            }
        }

        void IClient.NavigateTo(string clientID, string route)
        {
            Clients.Client(clientID)?.SendAsync("NavigateTo", route);
        }

        void IClient.UpdateBinding(string clientID, int bxIndex, ModelValue value)
        {
            var json = JsonConvert.SerializeObject(value);
            Clients.Client(clientID)?.SendAsync("UpdateBinding", bxIndex, json);
        }

        private Reactor GetOrCreateReactor()
        {
            object mgrObject;
            if (!this.Context.Items.TryGetValue("antimatter", out mgrObject))
            {
                mgrObject = new Reactor(this.Context.ConnectionId);
                this.Context.Items["antimatter"] = mgrObject;
            }
            return mgrObject as Reactor;            
        }
    }
}