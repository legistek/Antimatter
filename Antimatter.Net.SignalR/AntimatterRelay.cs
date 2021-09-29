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

        public static IHubContext<AntimatterRelay> Instance { get; set; }

        public AntimatterRelay()
        {
            Reactor.Initialize(this);            
        }
        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
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

        public Task StartupAsync()
        {
            // No special startup notification needed here
            return Task.CompletedTask;
        }

        public object MarshalClientObject(Type desiredType, ModelValue clientValue)
        {
            if (clientValue.Type != ModelValueType.JSON ||
                string.IsNullOrEmpty(clientValue.StringValue))
                throw new Exception();
            return JsonConvert.DeserializeObject(clientValue.StringValue, desiredType);
        }

        public ModelValue MarshalObject(object obj)
        {
            try
            {
                return new ModelValue
                {
                    Type = ModelValueType.JSON,
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
            Instance.Clients.Client(clientID)?.SendAsync("NavigateTo", route);
        }

        void IClient.UpdateBoundCollection(string clinetID, int bxIndex, CollectionUpdate update)
        {
            throw new NotImplementedException();
        }

        void IClient.UpdateBinding(string clientID, int bxIndex, ModelValue value)
        {
            var json = JsonConvert.SerializeObject(value);
            Instance.Clients.Client(clientID)?.SendAsync("UpdateBinding", bxIndex, json);
        }

        Task<ClientFile> IClient.SelectFileAsync(string acceptList)
        {
            throw new NotImplementedException();
        }

        Task<byte[]> IClient.ReadFileAsync(int handle)
        {
            throw new NotImplementedException();
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