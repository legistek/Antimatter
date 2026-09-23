using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net
{
    public class UploadFileArgs
    {
        public int FileHandle { get; set; }

        public long Start { get; set; }

        public long Length { get; set; }

        public string Url { get; set; }

        public string Method { get; set; }

        public Dictionary<string, string> Headers { get; set; }

        public int Callback { get; set; }
    }
}
