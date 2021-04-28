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
//using System.IO;
//using System.Linq;
//using System.Threading.Tasks;

//using Legistek.Framework.UI;
//using Legistek.Framework.UI.Input;
//using Legistek.Framework;

//using Limine.Core;
//using Limine.Core.ViewModel;

//namespace Limine.Web
//{
//    public class GeneralImplementor : IGeneralImplementor
//    {
//        public MouseButtonState ButtonState => throw new NotImplementedException();

//        public uint KeyModifiers => 0;

//        public bool IsVirtualEnvironment => false;

//        public bool AreDialogsOpen => false;

//        public bool DesignMode => false;

//        public void BringWindowToTop()
//        {
//            throw new NotImplementedException();
//        }

//        public bool CheckThreadAccess(object target)
//        {
//            return true;
//        }

//        public void CloseAllDialogs()
//        {
//            throw new NotImplementedException();
//        }

//        public void CopyDataToClipboard(Stream data, string format)
//        {
//            throw new NotImplementedException();
//        }

//        public async Task<Exception> DispatchOperationAsync(object platformObject, InvocationDelegate operation, DispatchPriority priority)
//        {
//            try
//            {
//                await operation();
//            }
//            catch (Exception ex)
//            {
//                return ex;
//            }
//            return null;
//        }

//        public void EnableSuspend()
//        {
//            // TODO
//        }

//        public string GetClipboardText()
//        {
//            // TODO
//            return null;
//        }        

//        public void PreventSuspend()
//        {
//            // TODO
//        }

//        public async Task ShowDocumentationAsync(bool tourOnly)
//        {
//            // TODO
//        }

//        public Task<int> ShowMessageWindowAsync(
//            NotificationType notificationType, 
//            string message, 
//            bool allowRememberChoice,
//            Result result, 
//            params string[] options)
//        {
//            return Task.FromResult(0);
//        }

//        public void ShowNotification(string title, string notification, NotificationType type)
//        {
//            // TODO
//        }

//        public void ShowPopupMenu(IEnumerable<IUICommand> commands, bool showAll = false)
//        {
//            // TODO
//        }

//        public Task<Result> TryUpdateApplicationAsync(bool forceNoBeta, bool force = false)
//        {
//            return Result.SuccessTask;
//        }
//    }
//}
