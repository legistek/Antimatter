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
    }
}
