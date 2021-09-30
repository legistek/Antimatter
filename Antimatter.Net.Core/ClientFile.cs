using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

using Antimatter.Net.Internal;

namespace Antimatter.Net
{
    public class ClientFile : IReactorObject
    {
        public ClientFile() : base()
        {           
        }

        #region JSON Serializable

        public int Handle { get; set; }        

        public long Size { get; set; }

        public string Name { get; set; }

        public DateTime Modified { get; set; }

        #endregion
               
        public Task<byte[]> ReadContentsAsync()
        {
            return (this as IReactorObject).ReactorClient.ReadFileAsync(this.Handle);
        }

        Reactor IReactorObject.Reactor { get; set; }

        IClient IReactorObject.ReactorClient { get; set; }
    }

    
}
