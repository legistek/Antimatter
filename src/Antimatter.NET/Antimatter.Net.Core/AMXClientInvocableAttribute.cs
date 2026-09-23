using System;
using System.Collections.Generic;
using System.Text;

namespace Antimatter.Net
{
    /// <summary>
    /// Decorates methods intended to be invoked by clients.
    /// Has no substantive effect.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class AMXClientInvocableAttribute : Attribute
    {
    }
}