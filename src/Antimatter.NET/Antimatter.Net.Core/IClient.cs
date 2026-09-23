using System;
using System.Runtime.InteropServices;
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
        /// Called by Models to force all application instances to log out.
        /// </summary>
        void ForceLogout();

        /// <summary>
        /// Called by Models to determine the last user activity across any
        /// application instance, namely for inactivity/logout timers.
        /// </summary>
        /// <returns></returns>
        DateTime GetLastActivity();

        /// <summary>
        /// Called by Models to note user activity for other application
        /// instances/tabs, generally for inactivity/logout timers.
        /// <seealso cref="GetLastActivity"/>.
        /// </summary>
        void RecordUserActivity();

        /// <summary>
        /// Called by model servers to post data to the client's clipboard.
        /// </summary>
        void CopyToClipboard(ModelValue data, string mimeType);

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
        void NavigateTo(string clientID, string route, bool hard = false);

        /// <summary>
        /// Opens a popup browser to the given URL and optionally provides
        /// a URL to 
        /// </summary>
        void OpenPopup(string url, bool mini = false, string urlOnPopupClosed = null);

        /// <summary>
        /// Marshals a model object to an object directly consumable by
        /// a UI client without having to bind to primitive properties. 
        /// ** Use sparingly. **
        /// </summary>
        /// <param name="obj">The object to marshal.</param>
        /// <returns>A <see cref="ModelValue"/>. The <see cref="ModelValue.Type"/>
        /// member must be <see cref="ModelValueType.JSON"/>. The
        /// rest is up to the implementation. For example, a Web/Javascript client
        /// would marshal to a JSON string.
        /// </returns>
        ModelValue MarshalObject(object obj);

        /// <summary>
        /// Initiates a file selection operation on the client.
        /// </summary>
        /// <param name="acceptList">A comma-separated list of
        /// file extensions or MIME types to select.</param>
        /// <param name="allowMultiple">Indicates whether to allow
        /// multiple files to be selected. If <c>false</c>, 
        /// a successful return value will always be an array of 1.
        /// </param>
        /// <returns>A <see cref="ClientFile"/> array. The array will
        /// be empty if no files are selected.
        /// </returns>
        Task<ClientFile[]> SelectFileAsync(string acceptList, bool allowMultiple);

        Task<byte[]> ReadFileAsync(int fileHandle, long start, int length);

        Task UploadFileAsync(UploadFileArgs args);

        void TriggerLocalDownload(string filename, byte[] data);

        object MarshalClientObject(Type desiredType, ModelValue clientValue);

        Task<T> InvokeClientMethodAsync<T>(string identifier, object args);

        Task<string> InvokeClientMethodRawAsync(string identifier, string argsJson);

        ModelValue InvokeClientMethod(string identifier, object args);

        bool GetIsMobile();
    }
}
