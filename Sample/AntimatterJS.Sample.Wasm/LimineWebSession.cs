///**********************************************************************
// * Legistek Limine Web Client Source Code
// * © Copyright 2013-2019 Legistek Corporation. All Rights Reserved.
// * Unauthorized copying, modification, or distribution prohibited.
// * CONFIDENTIAL AND PROPRIETARY
// *
// * This code is licensed to Epiq Global and its subsidiaries as a 
// * "Licensor Provided Improvement" pursuant to the March 14, 2017 
// * License Agreement between Legistek Corporation and Document Technologies, 
// * LLC, and subject to the restrictions therein. All other users are 
// * prohibited. Contact pmoore@legistek.com for more information.
// **********************************************************************/
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Threading.Tasks;

//using Microsoft.AspNetCore.Components;

//using Legistek.Framework;
//using Legistek.Framework.Imaging;

//using Limine.Core;
//using Limine.Core.ViewModel;
//using Limine.Core.DataModel;
//using Legistek.Framework.Networking;
//using Microsoft.AspNetCore.Components.WebAssembly.Http;
//using System.Net.Http;

//namespace Limine.Web
//{
//    public class LimineWebSession : Session, INetworkConnectionFactory
//    {
//        public LimineWebSession()
//        {
//            General.Initialize(ClientType.BrowserBased);
//            Platform.InitializeGeneral(new GeneralImplementor());
//            Platform.InitializeProjector(new ProjectorImplementor());
//            Platform.InitializeGraphics(new GraphicsImplementor(this));
//            this.Imaging.RegisterProvider(
//                ImagingType.ImageCollection,
//                new ImageCollectionProvider());

//            NetworkConnection.RegisterFactory(this);

//            this.Settings.ContentServerURL = ExternalAPIUrl;

//            HttpClientNetworkConnection.RequestReady += HttpClientNetworkConnection_RequestReady;
//        }

//        public static LimineWebSession Current = new LimineWebSession();

//        public bool Initialized { get; set; }

//        public string XSRFToken { get; set; }

//        public static string ExternalAPIUrl
//        {
//            get
//            {
//#if LIMINEDEBUGLOCAL
//                return "https://localhost:44312";
//#elif LIMINEDEBUGREMOTE || WASM
//                return "https://dev.limine.com/limineapi";
//#endif
//            }
//        }

//        public static string InternalAPIUrl
//        {
//            get
//            {
//#if LIMINEDEBUGLOCAL
//                return "https://localhost:44312";
//#elif LIMINEDEBUGREMOTE || WASM
//                return "https://dev.limine.com/limineapi";
//#else
//                return ServerSettings.Settings.InternalUrl?.TrimEnd('/');
//#endif
//            }
//        }

//        public override async Task OnNavigationAsync(NavigatorItem destination)
//        {
//            Console.WriteLine($"Navigating to NavigatorItem {destination?.ID}");
//            // Window.Current?.NavigationManager?.NavigateTo($"/matters/{destination.CurrentMatter.ID}/folders/{destination.ID}");
//        }

//        public override async Task OnDocumentViewerOpenedAsync(DocumentViewerBase document)
//        {
//            Console.WriteLine($"Navigating to document {document?.Document?.ID}");
//            Guid retrievalParent = document.Document.RetrievalParent?.ID ?? document.Document.ParentID;
//            // Window.Current?.NavigationManager?.NavigateTo($"/matters/{document.CurrentMatter.ID}/folders/{retrievalParent}/documents/{document.ID}");
//        }

//        public override async Task OnMatterOpenedAsync(Matter matter)
//        {
//            Console.WriteLine($"Navigating to matter {matter?.ID}");
//            //Window.Current?.NavigationManager?.NavigateTo($"/matters/{matter.ID}/folders/{matter.ID}");
//        }

//        public void NavigateHome()
//        {
//            Console.WriteLine($"Navigating to home");
//            //Window.Current?.NavigationManager?.NavigateTo($"/");
//        }

//        public async Task LogoutAsync()
//        {
//            //await Framework.ClientPostAsync<object>(
//            //    JSRuntime,
//            //    LimineWebSession.ExternalAPIUrl + "/coreapi/auth/logout",
//            //    null);

//            //await Framework.ClientPostAsync<Account>(
//            //    JSRuntime,
//            //    "api/logout",
//            //    null,
//            //    null);
//            //Window.Current?.NavigationManager?.NavigateTo("/", true);
//        }

//        private static void HttpClientNetworkConnection_RequestReady(HttpRequestMessage msg)
//        {
//            msg.SetBrowserRequestCredentials(BrowserRequestCredentials.Include);

//            var xsrf = LimineWebSession.Current?.XSRFToken;
//            if (!string.IsNullOrEmpty(xsrf))
//                msg.Headers.Add("X-XSRF-TOKEN", xsrf);
//        }

//        private HttpClient _httpClient = new HttpClient();

//        NetworkConnection INetworkConnectionFactory.Create(AppSession session, string apiVersion, string url)
//        {
//            return new HttpClientNetworkConnection(session, apiVersion, url, _httpClient,
//                // Browser always uses cookie auth
//                useJWT: false);
//        }
//    }
//}
