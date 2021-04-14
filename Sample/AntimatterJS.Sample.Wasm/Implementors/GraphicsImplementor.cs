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
using Limine.Core.UI;

namespace Limine.Web
{
    public class GraphicsImplementor : AppObject, IGraphicsImplementor
    {
        public GraphicsImplementor(AppSession session) : base(session)
        {
        }

        public void AnimateOpacity(object platformView, double? from, double to, double time, Action callback)
        {
        }

        public Task<bool> EncodeBitmapAsync(Stream outputStream, string destImageType, byte[] pixelData, int pixelWidth, int pixelHeight, int scaledWidth, int scaledHeight)
        {
            throw new NotImplementedException();
        }

        public Task<Image> EncodeBitmapAsync(double width, double height, byte[] pixels)
        {
            throw new NotImplementedException();
        }

        public Image GetBinderThumbnail()
        {
            return Imaging.FromPlatformBitmap("/images/Binder_256x256.png", 256, 256);
        }

        public Image GetDefaultExhibitThumbnail()
        {
            return null;
        }

        public Image GetFolderThumbnail()
        {
            return Imaging.FromPlatformBitmap("/images/Folder_256x256.png", 256, 256);
        }

        public Image GetGenericCustomBackground()
        {
            throw new NotImplementedException();
        }

        public Task<Image> GetHighResApplicationImageAsync(string imageName)
        {
            throw new NotImplementedException();
        }

        public Image GetLoadingThumbnail()
        {
            return null;
        }

        public Image GetMatterThumbnail()
        {
            throw new NotImplementedException();
        }

        public Image GetMovieThumbnail()
        {
            return null;
        }

        public Image GetOfflineThumbnail()
        {
            throw new NotImplementedException();
        }

        public Image GetOriginalsFolderThumbnail()
        {
            return Imaging.FromPlatformBitmap("/images/Originals_256x256.png", 256, 256);
        }

        public Image GetRecycleBinThumbnail()
        {
            return Imaging.FromPlatformBitmap("/images/RecycleBin.png", 256, 256);
        }

        public Image GetSearchFolderThumbnail()
        {
            return Imaging.FromPlatformBitmap("/images/SearchFolder_256x256.png", 256, 256);
        }

        public Image GetTextTranscriptThumbnail()
        {
            return Imaging.FromPlatformBitmap("/images/TranscriptIcon.png", 256, 256);
        }

        public Image GetWhiteboardThumbnail()
        {
            throw new NotImplementedException();
        }

        public Task<Tuple<byte[], int, int>> RenderUIElement(object uiElement, int outputWidth, int outputHeight)
        {
            throw new NotImplementedException();
        }
    }
}
