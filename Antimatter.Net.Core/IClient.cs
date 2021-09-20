using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Text;
using System.Threading.Tasks;

namespace Antimatter.Net
{
    /// <summary>
    /// Implemented by model servers to expose methods for communicating
    /// with clients.
    /// </summary>
    public interface IClient
    {
        /// <summary>
        /// Called by model servers to notify the client they are ready
        /// to startup.
        /// </summary>
        Task StartupAsync();

        /// <summary>
        /// Notifies clients of an update to a bound source value.
        /// </summary>
        /// <param name="clientID">The client ID provided when creating
        /// the <see cref="Reactor"/> instance. Used in multi-tenant
        /// model server scenarios. Otherwise <c>null</c>.
        /// </param>
        void UpdateBinding(string clientID, int bxIndex, ModelValue value);

        /// <summary>
        /// Notifies clients of a model-side update to a collection that implements
        /// <see cref="INotifyCollectionChanged "/>
        /// </summary>
        /// <param name="clinetID">The client ID provided when creating the
        /// <see cref="Reactor"/> instance. Used in multi-tenant
        /// model server scenarios. Otherwise <c>null</c>.</param>
        /// <param name="bxIndex"></param>
        /// <param name="update">A <see cref="CollectionUpdate"/> instance with
        /// information used by the client to process the collection change.
        /// </param>
        void UpdateBoundCollection(string clinetID, int bxIndex, CollectionUpdate update);

        /// <summary>
        /// Navigate to an application route (e.g. URL).
        /// </summary>
        void NavigateTo(string clientID, string route);

        /// <summary>
        /// Marshals a model object to an object directly consumable by
        /// a UI client without having to bind to primitive properties. 
        /// ** Use sparingly. **
        /// </summary>
        /// <param name="obj">The object to marshal.</param>
        /// <returns>A <see cref="ModelValue"/>. The <see cref="ModelValue.Type"/>
        /// member must be <see cref="ModelValueType.MarshalledObject"/>. The
        /// rest is up to the implementation. For example, a Web/Javascript client
        /// would marshal to a JSON string.
        /// </returns>
        ModelValue MarshalObject(object obj);
    }
}
