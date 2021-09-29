using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace Antimatter.Net
{
    public class ClientFile
    {
        private long _position = 0;

        internal Reactor Reactor { get; set; }

        internal IClient ReactorClient { get; set; }

        public int Handle { get; set; }

        public string Name { get; set; }

        public long Size { get; set; }

        public Task<byte[]> ReadContentsAsync()
        {
            return ReactorClient.ReadFileAsync(this.Handle);
        }
    }
}
