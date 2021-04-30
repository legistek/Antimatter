using System;
using System.Collections.Generic;
using System.Text;

using Antimatter.Net.Internal;

namespace Antimatter.Net
{
    /// <summary>
    /// Implemented by model servers to expose methods for communicating
    /// with clients.
    /// </summary>
    public interface IClient
    {
        /// <summary>
        /// Notifies clients of an update to a bound source value.
        /// </summary>
        /// <param name="clientID">The client ID provided when creating
        /// the <see cref="Reactor"/> instance. Used in multi-tenant
        /// model server scenarios. Otherwise <c>null</c>.
        /// </param>
        void UpdateBinding(string clientID, int bxIndex, ModelValue value);

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
