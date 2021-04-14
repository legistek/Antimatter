/**********************************************************************
 * Legistek Limine Web Client Source Code
 * © Copyright 2013-2019 Legistek Corporation. All Rights Reserved.
 * Unauthorized copying, modification, or distribution prohibited.
 * CONFIDENTIAL AND PROPRIETARY
 *
 * This code is licensed to Epiq Global and its subsidiaries as a 
 * "Licensor Provided Improvement" pursuant to the March 14, 2017 
 * License Agreement between Legistek Corporation and Document Technologies, 
 * LLC, and subject to the restrictions therein. All other users are 
 * prohibited. Contact pmoore@legistek.com for more information.
 **********************************************************************/

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

using Legistek.Framework.UI;
using Legistek.Framework.UI.Input;
using Legistek.Framework;

using Limine.Core;
using Limine.Core.ViewModel;
using Legistek.Framework.Foundation;
using Legistek.Framework.Imaging;

namespace Limine.Web
{
    public class ImageCollectionProvider : IImagingProvider
    {
        public IEnumerable<ImageOutputFormat> OutputFormats => throw new NotImplementedException();

        public async Task<Result<object>> LoadAsync(Stream stream, ImagingType type)
        {
            return stream.DecodeString();
        }

        public Result<object> GetPage(Image image, long page)
        {
            string url = image.PlatformImage as string;
            if (string.IsNullOrEmpty(url))
                return new ImproperUsageResult();

            string urlPrefix = url.LeftOf("/documents/", includeString: true);
            string docIDString = url.Substring(urlPrefix.Length).LeftOf("/viewer");
            Guid docID;
            if (!Guid.TryParse(docIDString, out docID))
                return new OutOfBoundsResult(nameof(image));

            return urlPrefix + $"{docID}/extract/images/{page}?renderLabels=false";            
        }

        public Task<Result> AppendAsync(Image image, Image secondImage, string indexEntry)
        {
            throw new NotImplementedException();
        }

        public Task<Result<object>> CreateAsync(Size size, PixelFormat format, Stream outputStream)
        {
            throw new NotImplementedException();
        }

        public Result<object> CreateFromRawData(Size size, byte[] data)
        {
            throw new NotImplementedException();
        }

        public Task<Result<object>> CreatePageAsync(Image parent, Size size, long pageNo, Rect? cropBox = null)
        {
            throw new NotImplementedException();
        }

        public MultitouchTransform CreateTransform(ImagingType type)
        {
            throw new NotImplementedException();
        }

        public Task<Result> ExportAsync(Image image, Stream stream, ImageOutputFormat format)
        {
            throw new NotImplementedException();
        }

        public Result<Rect> GetCropBox(Image image)
        {
            throw new NotImplementedException();
        }

        public Size GetDimensions(Image image)
        {
            throw new NotImplementedException();
        }

        public Result<IDrawingContext> GetDrawingContext(Image image)
        {
            throw new NotImplementedException();
        }

        public Task<Result<string>> GetOCRAsync(Image image)
        {
            throw new NotImplementedException();
        }

        public Task<Result<CharBox[]>> GetOCRWithPositioningAsync(Image image)
        {
            throw new NotImplementedException();
        }

        public Result<long> GetPageCount(Image image)
        {
            throw new NotImplementedException();
        }

        public Result<Size> GetPointSize(Stream stream)
        {
            throw new NotImplementedException();
        }

        public Result Rotate(Image image, Rotation rotation)
        {
            throw new NotImplementedException();
        }

        public Result SetResolution(Image image, double dpiX, double dpiY)
        {
            throw new NotImplementedException();
        }

        public Task<Result<object>> TranscodeAsync(Image image, Rect srcRect, double outputWidth, double outputHeight, Rotation rotation, ImagingType outputType)
        {
            throw new NotImplementedException();
        }

        public Task<Result> GetRawData(
            Image image,
            byte[] data)
        {
            throw new NotSupportedException();
        }
    }
}
