using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Antimatter.Net.Internal;

namespace Antimatter.Net
{
    public class ClientFile : IReactorObject, IDisposable
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

        public async Task UploadAsync(UploadFileArgs args)
        {
            await (this as IReactorObject).ReactorClient.UploadFileAsync(args);
        }

        public Stream OpenRead()
        {
            return new WebFileStream(this);
        }

        Reactor IReactorObject.Reactor { get; set; }

        IClient IReactorObject.ReactorClient { get; set; }

        private class WebFileStream : Stream
        {
            ClientFile _file;
            long _position = 0;

            public WebFileStream(ClientFile file)
            {
                _file = file;
            }

            public override bool CanRead => true;

            public override bool CanSeek => true;

            public override bool CanWrite => false;

            public override long Length => _file.Size;

            public override long Position 
            {
                get => _position;
                set => _position = value;
            }

            public override void Flush()
            {
                throw new NotSupportedException();
            }
            
            public override async Task<int> ReadAsync(
                byte[] buffer, 
                int offset, 
                int count, 
                CancellationToken cancellationToken)
            {
                int actualCount = Math.Min(
                    count, 
                    (int)Math.Min(_file.Size - this._position, int.MaxValue));
                if (actualCount == 0)
                    return 0;

                var retBytes = await (this._file as IReactorObject).ReactorClient.ReadFileAsync(
                    this._file.Handle, 
                    _position,
                    actualCount);

                Array.Copy(retBytes, 0, buffer, offset, actualCount);

                _position += actualCount;
                return actualCount;
            }

            public override int Read(byte[] buffer, int offset, int count)
            {
                // This stream only supports async reads because of HTML5
                return -1;
            }

            public override long Seek(long offset, SeekOrigin origin)
            {
                switch(origin)
                {
                    case SeekOrigin.Begin:
                    default:
                        this._position = offset;
                        break;
                    case SeekOrigin.Current:
                        this._position += offset;
                        break;
                    case SeekOrigin.End:
                        this._position = this._file.Size + offset;
                        break;
                }
                return this._position;
            }

            public override void SetLength(long value)
            {
                throw new NotSupportedException();
            }

            public override void Write(byte[] buffer, int offset, int count)
            {
                throw new NotSupportedException();
            }
        }

        public void Dispose()
        {
            (this as IReactorObject).Reactor?.InvokeClientMethod(
                $"window.Antimatter.FreeFile",
                new 
                { 
                    handle = this.Handle
                });
        }
    }

    
}
